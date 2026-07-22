import { User } from 'firebase/auth';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserRepository } from '../db/user-repository';
import { queryOne } from '../turso';
import { DatabaseUser } from '@/types/db';
import { UserRole } from '@/types/auth';

export class UserSyncService {
  /**
   * Synchronize Firebase User or Decoded ID Token payload to Turso DB.
   * Bootstrapping rule: The very first user created in the database automatically receives the ADMIN role.
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
      // First-time registration synchronization: Check if any ADMIN exists
      let initialRole: UserRole = 'USER';
      try {
        const adminCountRow = await queryOne<{ count: number }>({
          sql: `SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`,
        });
        const adminCount = adminCountRow?.count || 0;
        if (adminCount === 0) {
          initialRole = 'ADMIN';
        }
      } catch (err) {
        console.warn('[First Admin Check Notice]:', err);
      }

      return await UserRepository.createUser({
        firebase_uid: uid,
        email: email,
        name: displayName,
        photo_url: photoURL,
        provider: provider,
        email_verified: emailVerified ? 1 : 0,
        role: initialRole,
        plan: 'FREE',
      });
    } else {
      // Check if DB has 0 Admins. If so, auto-promote existing logged in user to ADMIN
      try {
        if (existingUser.role !== 'ADMIN') {
          const adminCountRow = await queryOne<{ count: number }>({
            sql: `SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`,
          });
          if ((adminCountRow?.count || 0) === 0) {
            await UserRepository.updateRole(uid, 'ADMIN');
            existingUser.role = 'ADMIN';
          }
        }
      } catch (err) {
        console.warn('[Admin Upgrade Check Notice]:', err);
      }

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
