import '../../../services/api/api_client.dart';
import '../../history/services/history_provider.dart';

/// Repository handling home feed data, system statistics, and recent activity
class HomeRepository {
  final ApiClient _apiClient;

  HomeRepository(this._apiClient);

  /// Retrieves recent papers created by the authenticated user
  Future<List<HistoryItem>> getRecentPapers() async {
    try {
      final response = await _apiClient.get('/papers/history');
      final data = response['data'] ?? response;
      if (data is List) {
        return data.map((json) => HistoryItem.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Retrieves system usage statistics (e.g. daily limit, used count)
  Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await _apiClient.get('/user/me');
      final data = response['data'] ?? response;
      return (data is Map<String, dynamic>) ? data : {};
    } catch (_) {
      return {};
    }
  }
}
