import 'package:flutter/material.dart';
import '../../../models/user_model.dart';
import '../../../services/firebase/firebase_auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuthService _authService;
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._authService) {
    _user = _authService.currentUser;
    // Auto-restore token and backend session on startup
    restoreSession();
  }

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> restoreSession() async {
    final restoredUser = await _authService.restoreSession();
    if (restoredUser != null) {
      _user = restoredUser;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    try {
      _user = await _authService.signInWithEmail(email, password);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> signUp(String email, String password, {String? displayName}) async {
    _setLoading(true);
    try {
      _user = await _authService.signUpWithEmail(email, password, displayName: displayName);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> loginWithGoogle() async {
    _setLoading(true);
    try {
      _user = await _authService.signInWithGoogle();
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> sendPasswordReset(String email) async {
    _setLoading(true);
    try {
      await _authService.sendPasswordReset(email);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> sendEmailVerification() async {
    try {
      await _authService.sendEmailVerification();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.signOut();
    _user = null;
    notifyListeners();
  }

  void updateUserPlan(String newPlan) {
    if (_user != null) {
      _user = _user!.copyWith(plan: newPlan);
      notifyListeners();
    }
  }

  Future<bool> updateProfile({String? displayName, String? preferredClass}) async {
    _setLoading(true);
    try {
      await _authService.updateProfile(displayName: displayName, preferredClass: preferredClass);
      if (_user != null) {
        _user = _user!.copyWith(
          displayName: displayName ?? _user!.displayName,
          preferredClass: preferredClass ?? _user!.preferredClass,
        );
      }
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }
}
