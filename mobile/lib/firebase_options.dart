import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
/// Configured to match the production Next.js website Firebase project (smartpapergenwebsite).
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return ios;
      case TargetPlatform.windows:
        return web;
      case TargetPlatform.linux:
        return web;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyA4YjyiwCOZbYv555GYyYYPdXNy09K2SWc',
    appId: '1:409345118113:web:c02b0c1d6216272af145e0',
    messagingSenderId: '409345118113',
    projectId: 'smartpapergenwebsite',
    authDomain: 'smartpapergenwebsite.firebaseapp.com',
    storageBucket: 'smartpapergenwebsite.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAgkLPllJeFLaQw_hpn_w_3zusooUOMGmA',
    appId: '1:409345118113:android:b9f981032b00d9faf145e0',
    messagingSenderId: '409345118113',
    projectId: 'smartpapergenwebsite',
    storageBucket: 'smartpapergenwebsite.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyA4YjyiwCOZbYv555GYyYYPdXNy09K2SWc',
    appId: '1:409345118113:ios:c02b0c1d6216272af145e0',
    messagingSenderId: '409345118113',
    projectId: 'smartpapergenwebsite',
    storageBucket: 'smartpapergenwebsite.firebasestorage.app',
  );
}
