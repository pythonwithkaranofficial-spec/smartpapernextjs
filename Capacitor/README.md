# Smart Paper Generator AI - Capacitor Android Project

This directory contains the complete, production-ready **Capacitor Android application** for **Smart Paper Generator AI**, decoupled from the Next.js web application so the website remains 100% untouched.

---

## 📱 Features & Native Capabilities

1. **Security & Server Parity**:
   - Google Gemini API key and Turso/Firebase/Razorpay secrets remain protected on the server.
   - All Next.js features, live AI paper generation, auth sessions, and user credits work seamlessly.
2. **Hardware Back Button Handling**:
   - Modern `OnBackPressedCallback` (Android 13, 14, 15 compatible).
   - Navigates WebView history seamlessly.
   - Double-tap back button to exit on root pages ("Press back again to exit" toast).
3. **Native PDF & DOCX Downloads**:
   - Native WebView `DownloadListener` intercepts jsPDF and Word docx downloads (`blob:`, `data:`, and standard HTTP).
   - Saves files directly into Android `Downloads/` directory with system completion notifications.
   - Triggers native "Open with" chooser to preview generated question papers in PDF viewers.
4. **Native Sharing**:
   - `@capacitor/share` & Android `Intent.ACTION_SEND` with `FileProvider` to share question papers directly via WhatsApp, Gmail, Telegram, or Drive.
5. **Google AdMob Monetization**:
   - `@capacitor-community/admob` with Google Play Services Mobile Ads SDK.
   - Pre-configured with official Google Test IDs for Banner, Interstitial, and Rewarded ads.
   - Centralized configuration in [`admob.config.json`](./admob.config.json) for easy release switching.
6. **Adaptive Icons & Luxury Branding**:
   - High-resolution adaptive launcher icons for all screen densities (mdpi to xxxhdpi).
   - Luxury dark glassmorphic splash screen (`#090d16`) with brand logo.
   - Edge-to-edge status bar styling matching the web interface.
7. **Offline Shell & Reconnection**:
   - If device loses internet, displays a branded luxury offline card with a "Retry Connection" button instead of a browser error.

---

## 🛠️ Quick Build Commands

From this folder (`k:\Android App Files\WebsiteS\Capacitor`):

### 1. Build Debug APK (For Testing on your Phone)
Double-click `scripts/build-apk.bat` or run:
```bash
npm run build:apk
```
Output APK location:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 2. Generate Production Signing Keystore
Double-click `scripts/generate-keystore.bat` or run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-keystore.ps1
```
This automatically creates `android/release.keystore` and `android/keystore.properties`.

### 3. Build Signed Release APK
Double-click `scripts/build-release-apk.bat` or run:
```bash
npm run build:release:apk
```
Output APK location:
`android/app/build/outputs/apk/release/app-release.apk`

### 4. Build Production AAB (For Google Play Store Upload)
Double-click `scripts/build-release-aab.bat` or run:
```bash
npm run build:release:aab
```
Output AAB location:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 💰 AdMob Monetization Configuration

In [`admob.config.json`](./admob.config.json), replace the test IDs with your live AdMob IDs before publishing:

```json
{
  "admob": {
    "appId": {
      "android": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
    },
    "testMode": false,
    "banner": {
      "adId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "position": "BOTTOM_CENTER",
      "isTesting": false
    },
    "interstitial": {
      "adId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "isTesting": false
    },
    "rewarded": {
      "adId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "isTesting": false
    }
  }
}
```

Also update the AdMob Application ID in:
- `android/app/src/main/res/values/strings.xml` (`admob_app_id` string)

---

## 🚀 Google Play Store Submission Checklist

- [x] **Target SDK**: Configured for SDK 35 (Android 15), exceeding Google Play minimums.
- [x] **Application ID**: `com.smartpaper.generator` (matches Firebase project).
- [x] **App Bundle**: Use `scripts/build-release-aab.bat` to compile `.aab`.
- [x] **Privacy Policy**: Deployed live at `https://paperbykaran.vercel.app/privacy`.
- [x] **Security**: Secrets kept on backend; FileProvider configured for secure file sharing.
