package com.smartpaper.generator;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends BridgeActivity {

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

    private void setupWebViewDownloadListener() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        // JavaScript interface to receive blob/data downloads
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void processBase64Data(String base64Data, String filename, String mimeType) {
                saveAndOpenDownloadedFile(base64Data, filename, mimeType);
            }
        }, "NativeDownloader");

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                try {
                    if (url.startsWith("blob:") || url.startsWith("data:")) {
                        // Handle Blob / Data URL via JavaScript injection
                        String js = "javascript:(function() {" +
                                "  var xhr = new XMLHttpRequest();" +
                                "  xhr.open('GET', '" + url + "', true);" +
                                "  xhr.responseType = 'blob';" +
                                "  xhr.onload = function(e) {" +
                                "    if (this.status == 200 || this.status == 0) {" +
                                "      var blob = this.response;" +
                                "      var reader = new FileReader();" +
                                "      reader.readAsDataURL(blob);" +
                                "      reader.onloadend = function() {" +
                                "        var base64data = reader.result;" +
                                "        var filename = '" + URLUtil.guessFileName(url, contentDisposition, mimeType) + "';" +
                                "        window.NativeDownloader.processBase64Data(base64data, filename, '" + mimeType + "');" +
                                "      };" +
                                "    }" +
                                "  };" +
                                "  xhr.send();" +
                                "})();";
                        webView.loadUrl(js);
                    } else {
                        // Standard HTTP/HTTPS download via Android DownloadManager
                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        request.setMimeType(mimeType);
                        String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
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
                    Toast.makeText(MainActivity.this, "Download failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void saveAndOpenDownloadedFile(String base64DataWithPrefix, String filename, String mimeType) {
        try {
            String base64 = base64DataWithPrefix.contains(",")
                    ? base64DataWithPrefix.substring(base64DataWithPrefix.indexOf(",") + 1)
                    : base64DataWithPrefix;

            byte[] pdfAsBytes = Base64.decode(base64, Base64.DEFAULT);

            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs();
            }

            File file = new File(downloadsDir, filename);
            FileOutputStream os = new FileOutputStream(file, false);
            os.write(pdfAsBytes);
            os.flush();
            os.close();

            runOnUiThread(() -> {
                Toast.makeText(this, "Saved to Downloads: " + filename, Toast.LENGTH_LONG).show();

                // Open file preview / viewer
                try {
                    Uri contentUri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", file);
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(contentUri, mimeType);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(Intent.createChooser(intent, "Open with"));
                } catch (Exception e) {
                    // Ignore if no default viewer installed
                }
            });
        } catch (Exception e) {
            runOnUiThread(() -> Toast.makeText(this, "Error saving file: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }
}
