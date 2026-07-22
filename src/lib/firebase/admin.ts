import { getApps, getApp, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminAppInstance: App | null = null;

export function getFirebaseAdminApp(): App {
  if (adminAppInstance) {
    return adminAppInstance;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminAppInstance = existingApps[0]!;
    return adminAppInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'smartpapergenwebsite';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  try {
    if (clientEmail && privateKey && projectId) {
      adminAppInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminAppInstance = initializeApp({
        projectId,
      });
    }
  } catch (error) {
    console.error('[Firebase Admin Init Error]:', error);
    if (getApps().length > 0) {
      adminAppInstance = getApp();
    } else {
      adminAppInstance = initializeApp({ projectId });
    }
  }

  return adminAppInstance;
}

export function getFirebaseAdminAuth(): Auth {
  const app = getFirebaseAdminApp();
  return getAuth(app);
}
