import 'package:flutter/material.dart';
import '../../../services/api/api_client.dart';
import '../../generator/models/generated_paper_model.dart';

class HistoryItem {
  final String id;
  final String classId;
  final String subject;
  final String paperType;
  final int marks;
  final String difficulty;
  final String createdAt;
  final GeneratedPaperModel paperData;

  HistoryItem({
    required this.id,
    required this.classId,
    required this.subject,
    required this.paperType,
    required this.marks,
    required this.difficulty,
    required this.createdAt,
    required this.paperData,
  });

  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    dynamic paperJson = json['paper_json'];
    if (paperJson is String) {
      paperJson = Map<String, dynamic>.from(json['paper_json']);
    }
    return HistoryItem(
      id: json['id'] ?? '',
      classId: json['class'] ?? '',
      subject: json['subject'] ?? '',
      paperType: json['paper_type'] ?? '',
      marks: json['marks'] ?? 80,
      difficulty: json['difficulty'] ?? '',
      createdAt: json['created_at'] ?? '',
      paperData: GeneratedPaperModel.fromJson(paperJson ?? {}),
    );
  }
}

class HistoryProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<HistoryItem> _history = [];
  bool _isLoading = false;
  String? _errorMessage;

  HistoryProvider(this._apiClient);

  List<HistoryItem> get history => _history;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchHistory() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.get('/user/history', queryParameters: {'limit': '50'});
      final items = (response['history'] as List? ?? response['data'] as List? ?? [])
          .map((item) => HistoryItem.fromJson(item))
          .toList();
      _history = items;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      _isLoading = false;
      notifyListeners();
    }
  }
}
