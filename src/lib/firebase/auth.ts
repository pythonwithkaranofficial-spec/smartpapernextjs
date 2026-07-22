import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirebaseApp } from './firebase';

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    authInstance = getAuth(app);
    if (typeof window !== 'undefined') {
      setPersistence(authInstance, browserLocalPersistence).catch((error) => {
        console.warn('[Firebase Auth Persistence Error]:', error);
      });
    }
  } catch (error) {
    console.error('[Firebase Auth Error]:', error);
  }

  return authInstance;
}
