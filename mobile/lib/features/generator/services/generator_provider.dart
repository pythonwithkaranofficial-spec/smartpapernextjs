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

  void setLoadedPaper(GeneratedPaperModel paper) {
    _generatedPaper = paper;
    _activeSetIndex = 0;
    notifyListeners();
  }

  Future<void> fetchUserUsage() async {
    try {
      final res = await _apiClient.get('/user/usage');
      final data = res['data'] is Map<String, dynamic> ? res['data'] : res;
      _papersGeneratedToday = data['usedToday'] ?? data['papersGenerated'] ?? 0;
      _dailyLimit = data['dailyLimit'] ?? 5;
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> generatePaper() async {
    _isGenerating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Call Next.js Gemini AI paper generation endpoint with aligned payload
      final responseJson = await _apiClient.post('/generate', body: _config.toJson());
      _generatedPaper = GeneratedPaperModel.fromJson(responseJson);
      _activeSetIndex = 0;

      // 2. Increment daily usage & save to history in background
      _papersGeneratedToday += 1;
      notifyListeners();
      try {
        await _apiClient.post('/user/usage/increment');
        await fetchUserUsage();
      } catch (_) {}

      try {
        await _apiClient.post('/user/history', body: {
          'class': _config.isCustom && _config.customClass != null && _config.customClass!.isNotEmpty
              ? _config.customClass
              : _config.classId,
          'subject': _config.isCustom && _config.customSubject != null && _config.customSubject!.isNotEmpty
              ? _config.customSubject
              : _config.subject,
          'paper_type': _config.examType,
          'marks': _config.totalMarks,
          'difficulty': _config.difficulty,
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

  void editQuestion({
    required String sectionId,
    required String questionId,
    required String newText,
    required int newMarks,
    List<String>? newChoices,
    String? newOrQuestion,
  }) {
    if (currentPaperSet == null) return;
    for (final sec in currentPaperSet!.sections) {
      if (sec.id == sectionId) {
        final idx = sec.questions.indexWhere((q) => q.id == questionId);
        if (idx != -1) {
          final q = sec.questions[idx];
          q.text = newText;
          q.marks = newMarks;
          if (newChoices != null) q.choices = newChoices;
          if (newOrQuestion != null) q.orQuestion = newOrQuestion;
          notifyListeners();
          return;
        }
      }
    }
  }

  void moveQuestion({
    required String sectionId,
    required int currentIndex,
    required String direction,
  }) {
    if (currentPaperSet == null) return;
    for (final sec in currentPaperSet!.sections) {
      if (sec.id == sectionId) {
        final targetIndex = direction == 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= sec.questions.length) return;
        final item = sec.questions.removeAt(currentIndex);
        sec.questions.insert(targetIndex, item);
        for (int i = 0; i < sec.questions.length; i++) {
          sec.questions[i].number = i + 1;
        }
        notifyListeners();
        return;
      }
    }
  }

  void deleteQuestion({
    required String sectionId,
    required String questionId,
  }) {
    if (currentPaperSet == null) return;
    for (final sec in currentPaperSet!.sections) {
      if (sec.id == sectionId) {
        sec.questions.removeWhere((q) => q.id == questionId);
        for (int i = 0; i < sec.questions.length; i++) {
          sec.questions[i].number = i + 1;
        }
        notifyListeners();
        return;
      }
    }
  }

  Future<bool> swapQuestion({
    required String sectionId,
    required String questionId,
    required int questionNumber,
    required String currentText,
    required String subject,
    required String classText,
    required String questionType,
    required int marks,
    String language = 'English',
  }) async {
    try {
      // Collect existing question texts to exclude duplicates
      final List<String> excludeQuestionTexts = [];
      if (currentPaperSet != null) {
        for (final sec in currentPaperSet!.sections) {
          for (final q in sec.questions) {
            if (q.text.isNotEmpty) {
              excludeQuestionTexts.add(q.text);
            }
          }
        }
      }

      // Next.js /api/swap-question request schema
      final response = await _apiClient.post('/swap-question', body: {
        'questionToReplace': {
          'id': questionId,
          'number': questionNumber,
          'text': currentText,
          'type': questionType,
          'marks': marks,
        },
        'subject': subject,
        'classText': classText,
        'language': language,
        'excludeQuestionTexts': excludeQuestionTexts,
      });

      final questionData = response['question'] ?? response['data']?['question'] ?? response;
      final newQuestion = QuestionModel.fromJson(questionData);

      if (_generatedPaper != null && currentPaperSet != null) {
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
