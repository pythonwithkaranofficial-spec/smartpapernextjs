package com.smartpaper.generator;

import android.app.DownloadManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {

    /** Only pages served from this origin may use the NativeDownloader bridge. */
    private static final String TRUSTED_SCHEME = "https";
    private static final String TRUSTED_HOST = "paperbykaran.vercel.app";

    private static final String DEFAULT_BASENAME = "question_paper";
    private static final int MAX_BASENAME_LENGTH = 100;

    private final ExecutorService fileExecutor = Executors.newSingleThreadExecutor();
    private long lastBackPressTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Modern Hardware Back Button handling (Android 13, 14, 15 compatible)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;

                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    long currentTime = System.currentTimeMillis();
                    if (currentTime - lastBackPressTime < 2000) {
                        finish();
                    } else {
                        lastBackPressTime = currentTime;
                        Toast.makeText(MainActivity.this, "Press back again to exit Smart Paper AI", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });

        // 2. Setup WebView DownloadListener for PDF and DOCX exports
        setupWebViewDownloadListener();
    }

    @Override
    public void onDestroy() {
        fileExecutor.shutdown();
        super.onDestroy();
    }

    // ---------------------------------------------------------------------
    // Origin checks
    // ---------------------------------------------------------------------

    private static boolean isTrustedUrl(String url) {
        if (url == null) return false;
        try {
            Uri uri = Uri.parse(url);
            return TRUSTED_SCHEME.equalsIgnoreCase(uri.getScheme())
                    && TRUSTED_HOST.equalsIgnoreCase(uri.getHost())
                    && (uri.getPort() == -1 || uri.getPort() == 443);
        } catch (Exception e) {
            return false;
        }
    }

    // ---------------------------------------------------------------------
    // Filename / MIME sanitization
    // ---------------------------------------------------------------------

    private static String extensionForMime(String mimeType) {
        if (mimeType == null) return null;
        String m = mimeType.toLowerCase(Locale.ROOT).trim();
        int semi = m.indexOf(';');
        if (semi >= 0) m = m.substring(0, semi).trim();
        switch (m) {
            case "application/pdf":
                return "pdf";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "docx";
            case "image/png":
                return "png";
            case "image/jpeg":
            case "image/jpg":
                return "jpg";
            default:
                return null;
        }
    }

    private static String mimeForExtension(String ext) {
        switch (ext) {
            case "pdf":
                return "application/pdf";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "png":
                return "image/png";
            case "jpg":
                return "image/jpeg";
            default:
                return "application/octet-stream";
        }
    }

    /**
     * Returns a safe basename with an allowed extension (pdf/docx/png/jpg),
     * or null if the file type is not allowed.
     */
    static String sanitizeFilename(String rawName, String mimeType) {
        String name = rawName == null ? "" : rawName;

        // Keep only the basename (strip any path, both separators)
        int sep = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (sep >= 0) name = name.substring(sep + 1);

        // Strip control characters and characters reserved on common filesystems
        name = name.replaceAll("\\p{Cntrl}", "")
                .replaceAll("[:*?\"<>|]", "_")
                .replace("..", "_")
                .trim();
        while (name.startsWith(".")) name = name.substring(1);

        String base = name;
        String ext = "";
        int dot = name.lastIndexOf('.');
        if (dot > 0) {
            base = name.substring(0, dot);
            ext = name.substring(dot + 1).toLowerCase(Locale.ROOT);
        }
        if (ext.equals("jpeg")) ext = "jpg";

        if (!(ext.equals("pdf") || ext.equals("docx") || ext.equals("png") || ext.equals("jpg"))) {
            // Name had no/unsupported extension: derive it from the MIME type
            base = name;
            ext = extensionForMime(mimeType);
            if (ext == null) return null;
        }

        base = base.replace(".", "_").trim();
        if (base.isEmpty()) base = DEFAULT_BASENAME;
        if (base.length() > MAX_BASENAME_LENGTH) base = base.substring(0, MAX_BASENAME_LENGTH);
        return base + "." + ext;
    }

    // ---------------------------------------------------------------------
    // WebView download handling
    // ---------------------------------------------------------------------

    private void setupWebViewDownloadListener() {
        if (getBridge() == null) return;
        final WebView webView = getBridge().getWebView();
        if (webView == null) return;

        // JavaScript interface to receive blob/data downloads.
        // @JavascriptInterface methods run on a background thread, so the
        // current page URL is checked on the UI thread before doing anything.
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void processBase64Data(final String base64Data, final String filename, final String mimeType) {
                runOnUiThread(() -> {
                    if (!isTrustedUrl(webView.getUrl())) {
                        return; // Ignore calls from any page that is not our own site
                    }
                    final String safeName = sanitizeFilename(filename, mimeType);
                    if (safeName == null) {
                        Toast.makeText(MainActivity.this, "Unsupported file type", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    fileExecutor.execute(() -> saveAndOpenDownloadedFile(base64Data, safeName));
                });
            }
        }, "NativeDownloader");

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                try {
                    if (!isTrustedUrl(webView.getUrl())) {
                        return;
                    }
                    if (url.startsWith("blob:") || url.startsWith("data:")) {
                        // Handle Blob / Data URL via JavaScript injection. All values are
                        // JSON-quoted so they cannot break out of the string literals.
                        String guessed = URLUtil.guessFileName(url, contentDisposition, mimeType);
                        String js = "(function() {" +
                                "  var xhr = new XMLHttpRequest();" +
                                "  xhr.open('GET', " + JSONObject.quote(url) + ", true);" +
                                "  xhr.responseType = 'blob';" +
                                "  xhr.onload = function(e) {" +
                                "    if (this.status == 200 || this.status == 0) {" +
                                "      var blob = this.response;" +
                                "      var reader = new FileReader();" +
                                "      reader.readAsDataURL(blob);" +
                                "      reader.onloadend = function() {" +
                                "        window.NativeDownloader.processBase64Data(reader.result, " +
                                JSONObject.quote(guessed) + ", " + JSONObject.quote(mimeType == null ? "" : mimeType) + ");" +
                                "      };" +
                                "    }" +
                                "  };" +
                                "  xhr.send();" +
                                "})();";
                        webView.evaluateJavascript(js, null);
                    } else if (url.startsWith("https://")) {
                        // Standard HTTPS download via Android DownloadManager
                        String filename = sanitizeFilename(URLUtil.guessFileName(url, contentDisposition, mimeType), mimeType);
                        if (filename == null) {
                            Toast.makeText(MainActivity.this, "Unsupported file type", Toast.LENGTH_SHORT).show();
                            return;
                        }
                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        request.setMimeType(mimeForExtension(filename.substring(filename.lastIndexOf('.') + 1)));
                        request.setTitle(filename);
                        request.setDescription("Downloading question paper...");
                        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);

                        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(request);
                            Toast.makeText(MainActivity.this, "Downloading " + filename + "...", Toast.LENGTH_SHORT).show();
                        }
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download failed", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    /** Runs on {@link #fileExecutor}. {@code filename} must already be sanitized. */
    private void saveAndOpenDownloadedFile(String base64DataWithPrefix, String filename) {
        try {
            String base64 = base64DataWithPrefix != null && base64DataWithPrefix.contains(",")
                    ? base64DataWithPrefix.substring(base64DataWithPrefix.indexOf(",") + 1)
                    : base64DataWithPrefix;
            if (base64 == null) throw new IllegalArgumentException("empty data");

            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            String ext = filename.substring(filename.lastIndexOf('.') + 1);
            String mime = mimeForExtension(ext);

            final Uri contentUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+: public Downloads via MediaStore (no storage permission needed)
                ContentResolver resolver = getContentResolver();
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                values.put(MediaStore.Downloads.MIME_TYPE, mime);
                values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                values.put(MediaStore.Downloads.IS_PENDING, 1);

                Uri itemUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (itemUri == null) throw new IllegalStateException("MediaStore insert failed");
                try (OutputStream os = resolver.openOutputStream(itemUri)) {
                    if (os == null) throw new IllegalStateException("Cannot open output stream");
                    os.write(bytes);
                }
                values.clear();
                values.put(MediaStore.Downloads.IS_PENDING, 0);
                resolver.update(itemUri, values, null, null);
                contentUri = itemUri;
            } else {
                // Android 7-9: app-specific Download folder (no permission needed),
                // shared through FileProvider (external-files-path "Download/").
                File downloadsDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (downloadsDir == null) throw new IllegalStateException("Storage unavailable");
                if (!downloadsDir.exists()) downloadsDir.mkdirs();

                File file = new File(downloadsDir, filename);
                // Defense in depth: never write outside the downloads directory
                if (!file.getCanonicalPath().startsWith(downloadsDir.getCanonicalPath() + File.separator)) {
                    throw new SecurityException("Invalid file path");
                }
                try (FileOutputStream os = new FileOutputStream(file, false)) {
                    os.write(bytes);
                    os.flush();
                }
                contentUri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", file);
            }

            runOnUiThread(() -> {
                Toast.makeText(this, "Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();

                // Open file preview / viewer
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(contentUri, mime);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(Intent.createChooser(intent, "Open with"));
                } catch (Exception e) {
                    // Ignore if no default viewer installed
                }
            });
        } catch (Exception e) {
            runOnUiThread(() -> Toast.makeText(this, "Error saving file", Toast.LENGTH_SHORT).show());
        }
    }
}
