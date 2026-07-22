import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirebaseApp } from './firebase';

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();
  authInstance = getAuth(app);
  
  if (typeof window !== 'undefined') {
    setPersistence(authInstance, browserLocalPersistence).catch((error) => {
      console.warn('[Firebase Auth Persistence Error]:', error);
    });
  }

  return authInstance;
}
