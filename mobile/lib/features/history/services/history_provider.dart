import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
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
      try {
        paperJson = jsonDecode(paperJson);
      } catch (_) {
        paperJson = {};
      }
    }
    return HistoryItem(
      id: json['id']?.toString() ?? '',
      classId: json['class']?.toString() ?? '',
      subject: json['subject']?.toString() ?? '',
      paperType: json['paper_type']?.toString() ?? '',
      marks: json['marks'] is int ? json['marks'] : int.tryParse(json['marks']?.toString() ?? '80') ?? 80,
      difficulty: json['difficulty']?.toString() ?? '',
      createdAt: json['created_at']?.toString() ?? '',
      paperData: GeneratedPaperModel.fromJson(paperJson is Map<String, dynamic> ? paperJson : {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'class': classId,
    'subject': subject,
    'paper_type': paperType,
    'marks': marks,
    'difficulty': difficulty,
    'created_at': createdAt,
    'paper_json': paperData.toJson(),
  };
}

class HistoryProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  List<HistoryItem> _history = [];
  bool _isLoading = false;
  String? _errorMessage;

  HistoryProvider(this._apiClient) {
    _loadLocalCache();
  }

  List<HistoryItem> get history => _history;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<File> _getCacheFile() async {
    final dir = await getApplicationDocumentsDirectory();
    return File('${dir.path}/smart_paper_history_cache.json');
  }

  Future<void> _loadLocalCache() async {
    try {
      final file = await _getCacheFile();
      if (await file.exists()) {
        final content = await file.readAsString();
        final List<dynamic> jsonList = jsonDecode(content);
        _history = jsonList
            .map((item) => HistoryItem.fromJson(item as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> _saveLocalCache() async {
    try {
      final file = await _getCacheFile();
      final content = jsonEncode(_history.map((e) => e.toJson()).toList());
      await file.writeAsString(content);
    } catch (_) {}
  }

  Future<void> addPaperLocally(HistoryItem item) async {
    // Deduplicate by ID or exact creation timestamp
    _history.removeWhere((h) => h.id == item.id || (h.id.isEmpty && h.createdAt == item.createdAt));
    _history.insert(0, item);
    notifyListeners();
    await _saveLocalCache();
  }

  Future<void> deleteHistoryItem(String id) async {
    _history.removeWhere((item) => item.id == id);
    notifyListeners();
    await _saveLocalCache();
  }

  Future<void> fetchHistory() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    // 1. Ensure local cache is loaded first
    await _loadLocalCache();

    // 2. Fetch cloud history if auth token exists
    try {
      final response = await _apiClient.get('/user/history', queryParameters: {'limit': '50'});
      final itemsList = response['data'] is List
          ? response['data'] as List
          : (response['history'] is List ? response['history'] as List : []);

      final cloudItems = itemsList
          .map((item) => HistoryItem.fromJson(item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item)))
          .toList();

      // Merge local and cloud items (cloud items take precedence for matched IDs)
      final Map<String, HistoryItem> itemMap = {};
      for (final item in cloudItems) {
        final key = item.id.isNotEmpty ? item.id : item.createdAt;
        itemMap[key] = item;
      }
      for (final item in _history) {
        final key = item.id.isNotEmpty ? item.id : item.createdAt;
        if (!itemMap.containsKey(key)) {
          itemMap[key] = item;
        }
      }

      final merged = itemMap.values.toList()
        ..sort((a, b) {
          final aDate = DateTime.tryParse(a.createdAt) ?? DateTime.fromMillisecondsSinceEpoch(0);
          final bDate = DateTime.tryParse(b.createdAt) ?? DateTime.fromMillisecondsSinceEpoch(0);
          return bDate.compareTo(aDate);
        });

      _history = merged;
      _errorMessage = null;
      _isLoading = false;
      notifyListeners();
      await _saveLocalCache();
    } catch (e) {
      // If server returns 401/500 or network fails, fall back smoothly to local papers without crashing
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
    }
  }
}
