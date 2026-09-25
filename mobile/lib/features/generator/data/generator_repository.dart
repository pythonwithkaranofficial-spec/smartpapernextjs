import '../../../services/api/api_client.dart';
import '../models/paper_config_model.dart';
import '../models/generated_paper_model.dart';

/// Repository handling paper generation and AI question swapping requests
class GeneratorRepository {
  final ApiClient _apiClient;

  GeneratorRepository(this._apiClient);

  /// Requests AI paper generation from the Next.js API
  Future<GeneratedPaperModel> generatePaper(PaperConfigModel config) async {
    final response = await _apiClient.post('/generate', body: config.toJson());
    final data = response['data'] ?? response;
    final paperJson = (data['paper'] as Map<String, dynamic>?) ?? data;
    return GeneratedPaperModel.fromJson(paperJson);
  }

  /// Swaps an individual question in a section with AI-suggested alternative
  Future<QuestionModel> swapQuestion({
    required String sectionId,
    required String questionId,
    required int questionNumber,
    required String currentText,
    required String subject,
    required String classText,
    required String questionType,
    required int marks,
    required String language,
  }) async {
    final response = await _apiClient.post('/generate/swap-question', body: {
      'sectionId': sectionId,
      'questionId': questionId,
      'questionNumber': questionNumber,
      'currentText': currentText,
      'subject': subject,
      'class': classText,
      'type': questionType,
      'marks': marks,
      'language': language,
    });

    final data = response['data'] ?? response;
    final questionJson = (data['question'] as Map<String, dynamic>?) ?? data;
    return QuestionModel.fromJson(questionJson);
  }
}
