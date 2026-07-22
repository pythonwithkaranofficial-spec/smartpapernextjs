import { User } from 'firebase/auth';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserRepository } from '../db/user-repository';
import { DatabaseUser } from '@/types/db';

export class UserSyncService {
  /**
   * Synchronize Firebase User or Decoded ID Token payload to Turso DB
   */
  static async syncFirebaseUser(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firebaseUser: User | DecodedIdToken | any,
    overrideData?: {
      displayName?: string | null;
      photoURL?: string | null;
      email?: string | null;
      providerId?: string;
    }
  ): Promise<DatabaseUser> {
    const uid = 'uid' in firebaseUser ? firebaseUser.uid : (firebaseUser as DecodedIdToken).uid;
    const email = overrideData?.email || ('email' in firebaseUser ? firebaseUser.email : null) || '';
    const displayName = overrideData?.displayName || ('displayName' in firebaseUser ? firebaseUser.displayName : null) || null;
    const photoURL = overrideData?.photoURL || ('photoURL' in firebaseUser ? firebaseUser.photoURL : null) || null;
    const emailVerified = ('emailVerified' in firebaseUser ? firebaseUser.emailVerified : false) || Boolean(('email_verified' in firebaseUser ? firebaseUser.email_verified : false));

    let provider = overrideData?.providerId || 'password';
    if ('providerData' in firebaseUser && (firebaseUser as User).providerData?.[0]?.providerId) {
      provider = (firebaseUser as User).providerData[0].providerId;
    } else if ('firebase' in firebaseUser && (firebaseUser as DecodedIdToken).firebase?.sign_in_provider) {
      provider = (firebaseUser as DecodedIdToken).firebase.sign_in_provider;
    } else if ('providerId' in firebaseUser && firebaseUser.providerId) {
      provider = firebaseUser.providerId;
    }

    const existingUser = await UserRepository.findUserByFirebaseUid(uid);

    if (!existingUser) {
      // First-time registration synchronization
      return await UserRepository.createUser({
        firebase_uid: uid,
        email: email,
        name: displayName,
        photo_url: photoURL,
        provider: provider,
        email_verified: emailVerified ? 1 : 0,
        role: 'USER',
        plan: 'FREE',
      });
    } else {
      // Update existing record details
      return await UserRepository.updateUser(uid, {
        name: displayName,
        photo_url: photoURL,
        email: email,
        email_verified: emailVerified ? 1 : 0,
      }) as DatabaseUser;
    }
  }
}
