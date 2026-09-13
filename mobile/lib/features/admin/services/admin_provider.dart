import 'package:flutter/material.dart';
import '../../../services/api/api_client.dart';
import '../../../models/user_model.dart';

class AdminProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<UserModel> _users = [];
  bool _isLoading = false;
  String? _errorMessage;

  AdminProvider(this._apiClient);

  List<UserModel> get users => _users;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchAllUsers() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _apiClient.get('/admin/users');
      final list = (res['users'] as List? ?? res['data'] as List? ?? [])
          .map((u) => UserModel.fromJson(u))
          .toList();
      _users = list;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateUserRoleOrPlan(String uid, {String? role, String? plan}) async {
    try {
      final payload = <String, dynamic>{'firebase_uid': uid};
      if (role != null) payload['role'] = role;
      if (plan != null) payload['plan'] = plan;

      await _apiClient.put('/admin/users', body: payload);

      final idx = _users.indexWhere((u) => u.uid == uid);
      if (idx != -1) {
        final existing = _users[idx];
        _users[idx] = UserModel(
          uid: existing.uid,
          email: existing.email,
          displayName: existing.displayName,
          photoUrl: existing.photoUrl,
          plan: plan ?? existing.plan,
          role: role ?? existing.role,
          emailVerified: existing.emailVerified,
        );
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
