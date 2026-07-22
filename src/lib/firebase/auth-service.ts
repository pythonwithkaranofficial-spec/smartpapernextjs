import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User,
  NextOrObserver,
  Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth } from './auth';
import { AuthError } from '../errors';

export class AuthService {
  /**
   * Register a new user with email and password
   */
  static async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return userCredential.user;
    } catch (error) {
      console.error('[AuthService.signUp Error]:', error);
      throw new AuthError(
        error instanceof Error ? error.message : 'Registration failed',
        400,
        'SIGNUP_FAILED'
      );
    }
  }

  /**
   * Sign in user with email and password
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('[AuthService.login Error]:', error);
      throw new AuthError(
        error instanceof Error ? error.message : 'Invalid credentials',
        401,
        'LOGIN_FAILED'
      );
    }
  }

  /**
   * Sign in or register using Google Provider
   */
  static async loginWithGoogle(): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (error) {
      console.error('[AuthService.loginWithGoogle Error]:', error);
      throw new AuthError(
        error instanceof Error ? error.message : 'Google sign-in failed',
        400,
        'GOOGLE_AUTH_FAILED'
      );
    }
  }

  /**
   * Sign out current user
   */
  static async logout(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[AuthService.logout Error]:', error);
      throw new AuthError('Failed to sign out', 500, 'LOGOUT_FAILED');
    }
  }

  /**
   * Send email verification to current user
   */
  static async sendVerificationEmail(user?: User | null): Promise<void> {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) {
      throw new AuthError('No authenticated user found for email verification', 401);
    }

    try {
      await firebaseSendEmailVerification(currentUser);
    } catch (error) {
      console.error('[AuthService.sendVerificationEmail Error]:', error);
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to send verification email',
        400,
        'VERIFICATION_EMAIL_FAILED'
      );
    }
  }

  /**
   * Send password reset link to user's email
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('[AuthService.forgotPassword Error]:', error);
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to send password reset email',
        400,
        'PASSWORD_RESET_EMAIL_FAILED'
      );
    }
  }

  /**
   * Confirm password reset with action code and new password
   */
  static async resetPassword(actionCode: string, newPassword: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await firebaseConfirmPasswordReset(auth, actionCode, newPassword);
    } catch (error) {
      console.error('[AuthService.resetPassword Error]:', error);
      throw new AuthError(
        error instanceof Error ? error.message : 'Password reset failed',
        400,
        'PASSWORD_RESET_FAILED'
      );
    }
  }

  /**
   * Get the currently logged-in Firebase User instance synchronously
   */
  static getCurrentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  }

  /**
   * Verify if current user is active and reload profile data
   */
  static async verifyCurrentUser(): Promise<User | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      await user.reload();
      return getFirebaseAuth().currentUser;
    } catch (error) {
      console.error('[AuthService.verifyCurrentUser Error]:', error);
      return null;
    }
  }

  /**
   * Retrieve Firebase ID Token for current user
   */
  static async getFirebaseToken(forceRefresh = false): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('[AuthService.getFirebaseToken Error]:', error);
      return null;
    }
  }

  /**
   * Force refresh current user's Firebase token
   */
  static async refreshToken(): Promise<string | null> {
    return this.getFirebaseToken(true);
  }

  /**
   * Attach listener for Firebase Auth State changes
   */
  static onAuthStateChangedListener(observer: NextOrObserver<User>): Unsubscribe {
    const auth = getFirebaseAuth();
    return firebaseOnAuthStateChanged(auth, observer);
  }
}
