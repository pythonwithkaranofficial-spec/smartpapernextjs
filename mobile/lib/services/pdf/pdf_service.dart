/// Placeholder interface for PDF Generation & Viewing
abstract class PdfService {
  Future<String> generatePdf(Map<String, dynamic> paperData);
}
