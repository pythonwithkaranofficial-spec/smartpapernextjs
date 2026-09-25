import 'package:flutter/material.dart';
import '../../../services/api/api_client.dart';
import '../../../models/user_model.dart';

class AdminProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<UserModel> _users = [];
  Map<String, dynamic>? _stats;
  bool _isLoading = false;
  String? _errorMessage;

  AdminProvider(this._apiClient);

  List<UserModel> get users => _users;
  Map<String, dynamic>? get stats => _stats;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchAllUsers() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _apiClient.get('/admin/users');
      final data = res['data'] is Map<String, dynamic> ? res['data'] : res;
      final rawUsers = data['users'] as List? ?? [];
      _stats = data['stats'] as Map<String, dynamic>?;

      _users = rawUsers
          .map((u) => UserModel.fromJson(u is Map<String, dynamic> ? u : Map<String, dynamic>.from(u)))
          .toList();

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
      if (role != null) {
        await _apiClient.post('/admin/users', body: {
          'targetFirebaseUid': uid,
          'action': 'update_role',
          'role': role,
        });
      }

      if (plan != null) {
        await _apiClient.post('/admin/users', body: {
          'targetFirebaseUid': uid,
          'action': 'update_plan',
          'plan': plan,
        });
      }

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
