import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../models/user_model.dart';
import '../api/api_client.dart';

abstract class FirebaseAuthService {
  Future<UserModel> signInWithEmail(String email, String password);
  Future<UserModel> signUpWithEmail(String email, String password, {String? displayName});
  Future<UserModel> signInWithGoogle();
  Future<void> sendPasswordReset(String email);
  Future<void> sendEmailVerification();
  Future<void> signOut();
  Future<UserModel?> restoreSession();
  Future<void> updateProfile({String? displayName, String? preferredClass});
  Future<UserModel?> refreshProfile();
  UserModel? get currentUser;
  String? get currentToken;
}

class FirebaseAuthServiceImpl implements FirebaseAuthService {
  final ApiClient _apiClient;
  final FirebaseAuth? _customAuth;
  UserModel? _currentUser;
  String? _authToken;

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: '409345118113-td478v2vmkjtahu344h3kb1atf4b9cl1.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
  );

  StreamSubscription<User?>? _idTokenSub;

  static const String _networkErrorMessage =
      'Unable to reach the sign-in service. Please check your internet connection and try again.';

  FirebaseAuthServiceImpl(this._apiClient, {FirebaseAuth? firebaseAuth})
      : _customAuth = firebaseAuth {
    // Every API request asks Firebase for the current ID token; getIdToken()
    // refreshes it automatically once it is close to its 1h expiry.
    _apiClient.setTokenProvider(_fetchIdToken);

    // Keep the cached token in sync with Firebase (sign-in, sign-out, refresh).
    final auth = _firebaseAuth;
    if (auth != null) {
      try {
        _idTokenSub = auth.idTokenChanges().listen((user) async {
          if (user == null) {
            _authToken = null;
            _apiClient.setAuthToken(null);
            return;
          }
          try {
            final token = await user.getIdToken();
            _authToken = token;
            _apiClient.setAuthToken(token);
          } catch (_) {}
        });
      } catch (_) {}
    }
  }

  Future<String?> _fetchIdToken({bool forceRefresh = false}) async {
    final user = _firebaseAuth?.currentUser;
    if (user == null) return null;
    final token = await user.getIdToken(forceRefresh);
    _authToken = token;
    return token;
  }

  /// Fetches the latest profile (plan, role, usage limits) from the server.
  @override
  Future<UserModel?> refreshProfile() async {
    if (_firebaseAuth?.currentUser == null) return null;
    final profileRes = await _apiClient.get('/user/me');
    final userData = profileRes['data'] ?? profileRes;
    if (userData is Map<String, dynamic>) {
      _currentUser = UserModel.fromJson(userData);
      return _currentUser;
    }
    return _currentUser;
  }

  void dispose() {
    _idTokenSub?.cancel();
    _idTokenSub = null;
  }

  @override
  UserModel? get currentUser {
    if (_currentUser != null) return _currentUser;
    final auth = _firebaseAuth;
    if (auth != null && auth.currentUser != null) {
      final user = auth.currentUser!;
      _currentUser = UserModel(
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? user.email?.split('@').first ?? 'User',
        photoUrl: user.photoURL,
        plan: 'FREE',
        role: 'USER',
        emailVerified: user.emailVerified,
      );
      return _currentUser;
    }
    return null;
  }

  @override
  String? get currentToken => _authToken;

  FirebaseAuth? get _firebaseAuth {
    if (_customAuth != null) return _customAuth;
    try {
      return FirebaseAuth.instance;
    } catch (_) {
      return null;
    }
  }

  String _formatFirebaseError(String code, String defaultMsg) {
    switch (code) {
      case 'user-not-found':
        return 'No account found with this email. Please register.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password. Please verify and try again.';
      case 'email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'too-many-requests':
        return 'Too many failed attempts. Please try again in a few minutes.';
      case 'network-request-failed':
        return 'Network connection error. Check your internet connection.';
      default:
        return defaultMsg;
    }
  }

  @override
  Future<UserModel?> restoreSession() async {
    final auth = _firebaseAuth;
    if (auth == null || auth.currentUser == null) {
      return null;
    }

    try {
      final user = auth.currentUser!;
      final idToken = await user.getIdToken();
      _authToken = idToken;
      _apiClient.setAuthToken(idToken);

      // Synchronize latest profile data with Next.js DB
      try {
        final profileRes = await _apiClient.get('/user/me');
        final userData = profileRes['data'] ?? profileRes;
        if (userData is Map<String, dynamic>) {
          _currentUser = UserModel.fromJson(userData);
          return _currentUser;
        }
      } catch (_) {}

      _currentUser = UserModel(
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? user.email?.split('@').first ?? 'User',
        photoUrl: user.photoURL,
        plan: 'FREE',
        role: 'USER',
        emailVerified: user.emailVerified,
      );
      return _currentUser;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<UserModel> signInWithEmail(String email, String password) async {
    final auth = _firebaseAuth;
    if (auth != null) {
      try {
        final userCredential = await auth.signInWithEmailAndPassword(
          email: email.trim(),
          password: password,
        );

        final user = userCredential.user;
        if (user == null) {
          throw ApiException('Authentication failed. No user returned from Firebase.');
        }

        final idToken = await user.getIdToken();
        _authToken = idToken;
        _apiClient.setAuthToken(idToken);

        // Sync with Next.js backend & Turso SQLite DB
        try {
          await _apiClient.post('/auth/sync', body: {
            'uid': user.uid,
            'email': user.email ?? email.trim(),
            'displayName': user.displayName ?? email.split('@').first,
            'provider': 'password',
          });

          final profileRes = await _apiClient.get('/user/me');
          final userData = profileRes['data'] ?? profileRes;
          if (userData is Map<String, dynamic>) {
            _currentUser = UserModel.fromJson(userData);
            return _currentUser!;
          }
        } catch (_) {}

        _currentUser = UserModel(
          uid: user.uid,
          email: user.email ?? email,
          displayName: user.displayName ?? email.split('@').first,
          photoUrl: user.photoURL,
          plan: 'FREE',
          role: 'USER',
          emailVerified: user.emailVerified,
        );

        return _currentUser!;
      } on FirebaseAuthException catch (e) {
        throw ApiException(_formatFirebaseError(e.code, e.message ?? 'Login failed'), statusCode: 400);
      } catch (e) {
        if (e is ApiException) rethrow;
        throw ApiException(_networkErrorMessage, statusCode: 0);
      }
    }
    throw ApiException('Firebase Authentication is not available on this platform.', statusCode: 0);
  }

  @override
  Future<UserModel> signUpWithEmail(String email, String password, {String? displayName}) async {
    final auth = _firebaseAuth;
    if (auth != null) {
      try {
        final userCredential = await auth.createUserWithEmailAndPassword(
          email: email.trim(),
          password: password,
        );

        final user = userCredential.user;
        if (user == null) {
          throw ApiException('Registration failed. No user returned from Firebase.');
        }

        final name = (displayName != null && displayName.isNotEmpty) ? displayName : email.split('@').first;
        await user.updateDisplayName(name);

        final idToken = await user.getIdToken();
        _authToken = idToken;
        _apiClient.setAuthToken(idToken);

        // Sync with Next.js backend & Turso SQLite DB
        try {
          await _apiClient.post('/auth/sync', body: {
            'uid': user.uid,
            'email': user.email ?? email.trim(),
            'displayName': name,
            'provider': 'password',
          });

          final profileRes = await _apiClient.get('/user/me');
          final userData = profileRes['data'] ?? profileRes;
          if (userData is Map<String, dynamic>) {
            _currentUser = UserModel.fromJson(userData);
            return _currentUser!;
          }
        } catch (_) {}

        _currentUser = UserModel(
          uid: user.uid,
          email: user.email ?? email,
          displayName: name,
          photoUrl: user.photoURL,
          plan: 'FREE',
          role: 'USER',
          emailVerified: user.emailVerified,
        );

        return _currentUser!;
      } on FirebaseAuthException catch (e) {
        throw ApiException(_formatFirebaseError(e.code, e.message ?? 'Registration failed'), statusCode: 400);
      } catch (e) {
        if (e is ApiException) rethrow;
        throw ApiException(_networkErrorMessage, statusCode: 0);
      }
    }
    throw ApiException('Firebase Authentication is not available on this platform.', statusCode: 0);
  }

  @override
  Future<UserModel> signInWithGoogle() async {
    final auth = _firebaseAuth;
    if (auth == null) {
      throw ApiException('Firebase Authentication is not available on this platform.');
    }

    try {
      // 1. Trigger Google Sign-In interactive account picker
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw ApiException('Google sign-in was cancelled by user.', statusCode: 400);
      }

      // 2. Obtain auth details from request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      if (googleAuth.idToken == null && googleAuth.accessToken == null) {
        throw ApiException('Failed to get security tokens from Google account.', statusCode: 400);
      }

      // 3. Create a credential for Firebase
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // 4. Sign in to Firebase with the Google credential
      final UserCredential userCredential = await auth.signInWithCredential(credential);
      final user = userCredential.user;

      if (user == null) {
        throw ApiException('Google authentication failed. No user returned.');
      }

      final idToken = await user.getIdToken();
      _authToken = idToken;
      _apiClient.setAuthToken(idToken);

      // 5. Synchronize with Next.js backend (matches website Google SSO)
      try {
        await _apiClient.post('/auth/sync', body: {
          'uid': user.uid,
          'email': user.email ?? googleUser.email,
          'displayName': user.displayName ?? googleUser.displayName ?? 'Google User',
          'photoURL': user.photoURL ?? googleUser.photoUrl,
          'provider': 'google.com',
        });

        final profileRes = await _apiClient.get('/user/me');
        final userData = profileRes['data'] ?? profileRes;
        if (userData is Map<String, dynamic>) {
          _currentUser = UserModel.fromJson(userData);
          return _currentUser!;
        }
      } catch (_) {}

      _currentUser = UserModel(
        uid: user.uid,
        email: user.email ?? googleUser.email,
        displayName: user.displayName ?? googleUser.displayName ?? 'Google User',
        photoUrl: user.photoURL ?? googleUser.photoUrl,
        plan: 'FREE',
        role: 'USER',
        emailVerified: true,
      );

      return _currentUser!;
    } on FirebaseAuthException catch (e) {
      throw ApiException(_formatFirebaseError(e.code, e.message ?? 'Google Sign-In failed'), statusCode: 400);
    } catch (e) {
      if (e is ApiException) rethrow;
      final errorStr = e.toString();
      if (errorStr.contains('10') || errorStr.contains('sign_in_failed')) {
        throw ApiException('Google Sign-In configuration error (ApiException: 10). Ensure your device has Google Play Services and internet.', statusCode: 400);
      }
      throw ApiException('Google sign-in error: $e', statusCode: 400);
    }
  }

  @override
  Future<void> sendPasswordReset(String email) async {
    final auth = _firebaseAuth;
    if (auth != null) {
      try {
        await auth.sendPasswordResetEmail(email: email.trim());
      } on FirebaseAuthException catch (e) {
        throw ApiException(_formatFirebaseError(e.code, e.message ?? 'Reset password failed'), statusCode: 400);
      }
    }
  }

  @override
  Future<void> sendEmailVerification() async {
    final auth = _firebaseAuth;
    if (auth != null) {
      try {
        await auth.currentUser?.sendEmailVerification();
      } on FirebaseAuthException catch (e) {
        throw ApiException(_formatFirebaseError(e.code, e.message ?? 'Verification email failed'), statusCode: 400);
      }
    }
  }

  @override
  Future<void> signOut() async {
    final auth = _firebaseAuth;
    if (auth != null) {
      try {
        await auth.signOut();
      } catch (_) {}
    }
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
    _currentUser = null;
    _authToken = null;
    _apiClient.setAuthToken(null);
  }

  @override
  Future<void> updateProfile({String? displayName, String? preferredClass}) async {
    final auth = _firebaseAuth;
    if (auth != null && auth.currentUser != null && displayName != null && displayName.isNotEmpty) {
      try {
        await auth.currentUser!.updateDisplayName(displayName);
      } catch (_) {}
    }

    if (_currentUser != null) {
      _currentUser = _currentUser!.copyWith(
        displayName: displayName ?? _currentUser!.displayName,
        preferredClass: preferredClass ?? _currentUser!.preferredClass,
      );
    }

    try {
      final syncBody = <String, dynamic>{};
      if (displayName != null) syncBody['displayName'] = displayName;
      if (preferredClass != null) syncBody['preferredClass'] = preferredClass;
      if (syncBody.isNotEmpty) {
        await _apiClient.post('/auth/sync', body: syncBody);
      }
    } catch (_) {}
  }
}
