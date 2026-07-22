import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA4YjyiwCOZbYv555GYyYYPdXNy09K2SWc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smartpapergenwebsite.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smartpapergenwebsite",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smartpapergenwebsite.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "409345118113",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:409345118113:web:c02b0c1d6216272af145e0",
};

let appInstance: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) {
    return appInstance;
  }

  try {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  } catch (error) {
    console.error('[Firebase Init Error]:', error);
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }

  return appInstance;
}
