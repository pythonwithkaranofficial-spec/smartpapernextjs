import 'package:flutter/material.dart';
import '../../../services/api/api_client.dart';
import '../models/paper_config_model.dart';
import '../models/generated_paper_model.dart';

class GeneratorProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  PaperConfigModel _config = PaperConfigModel();
  GeneratedPaperModel? _generatedPaper;
  int _activeSetIndex = 0;

  bool _isGenerating = false;
  String? _errorMessage;
  int _papersGeneratedToday = 0;
  int _dailyLimit = 5;

  GeneratorProvider(this._apiClient);

  PaperConfigModel get config => _config;
  GeneratedPaperModel? get generatedPaper => _generatedPaper;
  int get activeSetIndex => _activeSetIndex;
  bool get isGenerating => _isGenerating;
  String? get errorMessage => _errorMessage;
  int get papersGeneratedToday => _papersGeneratedToday;
  int get dailyLimit => _dailyLimit;

  GeneratedPaperModel? get currentPaperSet {
    if (_generatedPaper == null) return null;
    if (_generatedPaper!.sets != null && _generatedPaper!.sets!.isNotEmpty) {
      if (_activeSetIndex < _generatedPaper!.sets!.length) {
        return _generatedPaper!.sets![_activeSetIndex];
      }
    }
    return _generatedPaper;
  }

  void setActiveSetIndex(int index) {
    _activeSetIndex = index;
    notifyListeners();
  }

  void updateConfig(PaperConfigModel newConfig) {
    _config = newConfig;
    notifyListeners();
  }

  Future<void> fetchUserUsage() async {
    try {
      final res = await _apiClient.get('/user/usage');
      _papersGeneratedToday = res['papersGenerated'] ?? 0;
      _dailyLimit = res['dailyLimit'] ?? 5;
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> generatePaper() async {
    _isGenerating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Call Next.js Gemini AI paper generation endpoint
      final responseJson = await _apiClient.post('/generate', body: _config.toJson());
      _generatedPaper = GeneratedPaperModel.fromJson(responseJson);
      _activeSetIndex = 0;

      // 2. Increment daily usage & save to history
      try {
        await _apiClient.post('/user/usage/increment');
        await _apiClient.post('/user/history', body: {
          'class': _config.classId,
          'subject': _config.subject,
          'paper_type': _config.examType,
          'marks': _config.totalMarks,
          'difficulty': '${_config.easyPercentage}/${_config.mediumPercentage}/${_config.hardPercentage}',
          'paper_json': responseJson,
        });
      } catch (_) {}

      _isGenerating = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      _isGenerating = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> swapQuestion({
    required String sectionId,
    required String questionId,
    required String currentText,
    required String subject,
    required String classId,
    required String questionType,
    required int marks,
  }) async {
    try {
      final response = await _apiClient.post('/swap-question', body: {
        'currentQuestion': currentText,
        'subject': subject,
        'classId': classId,
        'questionType': questionType,
        'marks': marks,
      });

      final newQuestion = QuestionModel.fromJson(response['newQuestion'] ?? response);

      if (_generatedPaper != null) {
        for (final section in currentPaperSet!.sections) {
          final idx = section.questions.indexWhere((q) => q.id == questionId);
          if (idx != -1) {
            section.questions[idx] = newQuestion;
            notifyListeners();
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
