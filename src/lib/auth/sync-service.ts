import { User } from 'firebase/auth';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserRepository } from '../db/user-repository';
import { isTrustedSuperAdmin } from './super-admin';
import { DatabaseUser } from '@/types/db';
import { UserRole } from '@/types/auth';
import { AuthError } from '../errors';

export class UserSyncService {
  /**
   * Synchronize Firebase User or Decoded ID Token payload to Turso DB.
   * Super-Admin Rule: users whose Firebase-VERIFIED email is in SUPER_ADMIN_EMAILS are locked as ADMIN.
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
    const emailVerified = ('emailVerified' in firebaseUser ? firebaseUser.emailVerified : false) || Boolean(('email_verified' in firebaseUser ? firebaseUser.email_verified : false));

    let provider = overrideData?.providerId || 'password';
    if ('providerData' in firebaseUser && (firebaseUser as User).providerData?.[0]?.providerId) {
      provider = (firebaseUser as User).providerData[0].providerId;
    } else if ('firebase' in firebaseUser && (firebaseUser as DecodedIdToken).firebase?.sign_in_provider) {
      provider = (firebaseUser as DecodedIdToken).firebase.sign_in_provider;
    } else if ('providerId' in firebaseUser && firebaseUser.providerId) {
      provider = firebaseUser.providerId;
    }

    const isSuperAdmin = isTrustedSuperAdmin(email, emailVerified);
    const existingUser = await UserRepository.findUserByFirebaseUid(uid);

    let photoURL: string | null = null;
    if (overrideData?.photoURL !== undefined && overrideData.photoURL !== null) {
      photoURL = overrideData.photoURL;
    } else if ('photoURL' in firebaseUser && firebaseUser.photoURL) {
      photoURL = firebaseUser.photoURL;
    } else if (existingUser?.photo_url) {
      photoURL = existingUser.photo_url;
    }

    if (!existingUser) {
      const initialRole: UserRole = isSuperAdmin ? 'ADMIN' : 'USER';

      // Same email, different uid (account deleted & re-created in Firebase): relink the
      // existing row to the new uid, but ONLY when Firebase has verified the email.
      if (email) {
        const byEmail = await UserRepository.findUserByEmail(email.toLowerCase().trim());
        if (byEmail && byEmail.firebase_uid !== uid) {
          if (!emailVerified) {
            throw new AuthError(
              'This email is already linked to another account. Please verify your email address and try again.',
              409,
              'EMAIL_IN_USE'
            );
          }
          await UserRepository.relinkFirebaseUid(byEmail.firebase_uid, uid);
          return (await UserRepository.updateUser(uid, {
            name: displayName,
            photo_url: photoURL,
            email_verified: 1,
            role: isSuperAdmin ? 'ADMIN' : byEmail.role,
          })) as DatabaseUser;
        }
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
      // Auto-lock Super Admins to ADMIN role if not already set
      if (isSuperAdmin && existingUser.role !== 'ADMIN') {
        await UserRepository.updateRole(uid, 'ADMIN');
        existingUser.role = 'ADMIN';
      }

      // Update existing record details
      return await UserRepository.updateUser(uid, {
        name: displayName,
        photo_url: photoURL,
        email: email,
        email_verified: emailVerified ? 1 : 0,
        role: isSuperAdmin ? 'ADMIN' : existingUser.role,
      }) as DatabaseUser;
    }
  }
}
