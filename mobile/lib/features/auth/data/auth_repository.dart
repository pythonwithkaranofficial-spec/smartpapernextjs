import '../../../services/api/api_client.dart';
import '../../../models/user_model.dart';

/// Repository handling authentication data synchronization and profile operations
class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  /// Synchronizes authenticated Firebase user with the Turso DB
  Future<UserModel> syncUser({
    required String uid,
    required String email,
    String? displayName,
    String? photoUrl,
  }) async {
    final response = await _apiClient.post('/auth/sync', body: {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
    });

    final data = response['data'] ?? response;
    final userJson = (data['user'] as Map<String, dynamic>?) ?? data;
    return UserModel.fromJson(userJson);
  }

  /// Fetches the current user profile from the backend
  Future<UserModel> getCurrentUserProfile() async {
    final response = await _apiClient.get('/user/me');
    final data = response['data'] ?? response;
    final userJson = (data['user'] as Map<String, dynamic>?) ?? data;
    return UserModel.fromJson(userJson);
  }
}
