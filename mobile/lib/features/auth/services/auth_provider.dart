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
  }

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
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

  Future<void> sendPasswordReset(String email) async {
    _setLoading(true);
    try {
      await _authService.sendPasswordReset(email);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    await _authService.signOut();
    _user = null;
    notifyListeners();
  }

  void updateUserPlan(String newPlan) {
    if (_user != null) {
      _user = UserModel(
        uid: _user!.uid,
        email: _user!.email,
        displayName: _user!.displayName,
        photoUrl: _user!.photoUrl,
        plan: newPlan,
        role: _user!.role,
        emailVerified: _user!.emailVerified,
      );
      notifyListeners();
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
