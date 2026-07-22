import { UserRepository } from '../db/user-repository';
import { DatabaseUser } from '../../types/db';
import { User } from 'firebase/auth';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface UserSyncPayload {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  providerId?: string;
}

export class UserSyncService {
  /**
   * Synchronize a Firebase user (client or admin object) with Turso database
   */
  static async syncFirebaseUser(
    firebaseUser: User | DecodedIdToken | UserSyncPayload
  ): Promise<DatabaseUser> {
    const uid = 'uid' in firebaseUser ? firebaseUser.uid : (firebaseUser as UserSyncPayload).uid;
    const email = firebaseUser.email || '';
    const displayName =
      'displayName' in firebaseUser
        ? firebaseUser.displayName
        : 'name' in firebaseUser
        ? (firebaseUser as DecodedIdToken).name
        : null;
    const photoURL =
      'photoURL' in firebaseUser
        ? firebaseUser.photoURL
        : 'picture' in firebaseUser
        ? (firebaseUser as DecodedIdToken).picture
        : null;
    const emailVerified =
      'emailVerified' in firebaseUser
        ? (firebaseUser as User).emailVerified
        : 'email_verified' in firebaseUser
        ? (firebaseUser as DecodedIdToken).email_verified ?? false
        : false;

    let provider = 'email';
    if ('providerData' in firebaseUser && (firebaseUser as User).providerData.length > 0) {
      provider = (firebaseUser as User).providerData[0].providerId;
    } else if ('firebase' in firebaseUser && (firebaseUser as DecodedIdToken).firebase?.sign_in_provider) {
      provider = (firebaseUser as DecodedIdToken).firebase.sign_in_provider;
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
        email_verified: emailVerified,
        role: 'USER',
        plan: 'FREE',
      });
    } else {
      // Update existing record details
      return await UserRepository.updateUser(uid, {
        name: displayName,
        photo_url: photoURL,
        email: email,
        email_verified: emailVerified,
      });
    }
  }
}
