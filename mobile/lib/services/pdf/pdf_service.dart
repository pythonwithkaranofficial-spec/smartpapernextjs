import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../docx/docx_service.dart';

/// Abstract service defining PDF generation and export capabilities
abstract class PdfService {
  Future<Uint8List> generatePdfBytes(Map<String, dynamic> paperData);
  Future<String> generatePdf(Map<String, dynamic> paperData);
  Future<void> printOrSharePdf(Map<String, dynamic> paperData, String title);
}

/// Concrete implementation of PdfService utilizing the pdf and printing packages
class PdfServiceImpl implements PdfService {
  @override
  Future<Uint8List> generatePdfBytes(Map<String, dynamic> paperData) async {
    final pdf = pw.Document();

    pw.Font? regularFont;
    pw.Font? boldFont;
    try {
      regularFont = await PdfGoogleFonts.robotoRegular();
      boldFont = await PdfGoogleFonts.robotoBold();
    } catch (_) {
      // Fallback if offline
      regularFont = pw.Font.helvetica();
      boldFont = pw.Font.helveticaBold();
    }

    final pdfTheme = pw.ThemeData.withFont(
      base: regularFont,
      bold: boldFont,
    );

    final schoolName = (paperData['schoolName'] as String?) ?? '';
    final examName = (paperData['examName'] as String?) ?? 'EXAMINATION';
    final subject = (paperData['subject'] as String?) ?? 'Subject';
    final classText = (paperData['class'] ?? paperData['classText'] ?? '').toString();
    final timeAllowed = (paperData['timeAllowed'] ?? paperData['timeText'] ?? '3 Hours').toString();
    final maxMarks = (paperData['maxMarks'] ?? paperData['maxMarksText'] ?? '80').toString();
    final instructions = (paperData['instructions'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];
    final sections = (paperData['sections'] as List<dynamic>?) ?? [];

    pdf.addPage(
      pw.MultiPage(
        theme: pdfTheme,
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(36),
        header: (pw.Context context) {
          if (context.pageNumber == 1) {
            return pw.Column(
              children: [
                if (schoolName.isNotEmpty)
                  pw.Center(
                    child: pw.Text(
                      schoolName.toUpperCase(),
                      style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
                    ),
                  ),
                pw.Center(
                  child: pw.Text(
                    examName,
                    style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
                  ),
                ),
                pw.SizedBox(height: 4),
                pw.Center(
                  child: pw.Text(
                    'Subject: $subject   |   Class: $classText',
                    style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold),
                  ),
                ),
                pw.SizedBox(height: 6),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Time: $timeAllowed', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Max Marks: $maxMarks', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                  ],
                ),
                pw.Divider(thickness: 1.2),
                if (instructions.isNotEmpty) ...[
                  pw.Align(
                    alignment: pw.Alignment.centerLeft,
                    child: pw.Text('GENERAL INSTRUCTIONS:',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9)),
                  ),
                  pw.SizedBox(height: 2),
                  ...instructions.map((ins) => pw.Padding(
                        padding: const pw.EdgeInsets.only(bottom: 2),
                        child: pw.Align(
                          alignment: pw.Alignment.centerLeft,
                          child: pw.Text('• $ins', style: const pw.TextStyle(fontSize: 8)),
                        ),
                      )),
                  pw.Divider(thickness: 0.8),
                ],
              ],
            );
          }
          return pw.Container(
            alignment: pw.Alignment.centerRight,
            margin: const pw.EdgeInsets.only(bottom: 12),
            child: pw.Text('$subject — Class $classText',
                style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
          );
        },
        footer: (pw.Context context) {
          return pw.Container(
            alignment: pw.Alignment.center,
            margin: const pw.EdgeInsets.only(top: 10),
            child: pw.Text('Page ${context.pageNumber} of ${context.pagesCount}',
                style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
          );
        },
        build: (pw.Context context) {
          final List<pw.Widget> widgets = [];

          for (final rawSec in sections) {
            final sec = rawSec as Map<String, dynamic>;
            final secName = (sec['name'] ?? 'Section').toString();
            final secDesc = (sec['description'] ?? '').toString();
            final questions = (sec['questions'] as List<dynamic>?) ?? [];

            widgets.add(
              pw.Container(
                width: double.infinity,
                padding: const pw.EdgeInsets.symmetric(vertical: 4, horizontal: 6),
                margin: const pw.EdgeInsets.only(top: 10, bottom: 6),
                color: PdfColors.grey200,
                child: pw.Text(
                  secDesc.isNotEmpty
                      ? '${secName.toUpperCase()} — ${secDesc.toUpperCase()}'
                      : secName.toUpperCase(),
                  style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10),
                ),
              ),
            );

            for (final rawQ in questions) {
              final q = rawQ as Map<String, dynamic>;
              final num = q['number'] ?? '';
              final text = (q['text'] ?? '').toString();
              final marks = q['marks'] ?? 1;
              final choices = (q['choices'] as List<dynamic>?)?.map((c) => c.toString()).toList();
              final orQuestion = (q['orQuestion'] as String?);

              widgets.add(
                pw.Padding(
                  padding: const pw.EdgeInsets.only(bottom: 8),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Row(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Expanded(
                            child: pw.Text(
                              'Q$num. $text',
                              style: const pw.TextStyle(fontSize: 9),
                            ),
                          ),
                          pw.SizedBox(width: 8),
                          pw.Text('[$marks M]',
                              style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9)),
                        ],
                      ),
                      if (choices != null && choices.isNotEmpty)
                        pw.Padding(
                          padding: const pw.EdgeInsets.only(left: 12, top: 3),
                          child: pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              for (int cIdx = 0; cIdx < choices.length; cIdx++)
                                pw.Padding(
                                  padding: const pw.EdgeInsets.only(bottom: 2),
                                  child: pw.Text(
                                    DocxService.formatChoice(cIdx, choices[cIdx]),
                                    style: const pw.TextStyle(fontSize: 8.5),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      if (orQuestion != null && orQuestion.isNotEmpty) ...[
                        pw.Center(
                          child: pw.Padding(
                            padding: const pw.EdgeInsets.symmetric(vertical: 2),
                            child: pw.Text('— OR —',
                                style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold)),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.only(left: 8),
                          child: pw.Text(orQuestion, style: const pw.TextStyle(fontSize: 9)),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }
          }

          return widgets;
        },
      ),
    );

    return await pdf.save();
  }

  @override
  Future<String> generatePdf(Map<String, dynamic> paperData) async {
    final bytes = await generatePdfBytes(paperData);
    final dir = await getApplicationDocumentsDirectory();
    final subject = (paperData['subject'] ?? 'Paper').toString().replaceAll(' ', '_');
    final filename = '${subject}_${DateTime.now().millisecondsSinceEpoch}.pdf';
    final file = File('${dir.path}/$filename');
    await file.writeAsBytes(bytes);
    return file.path;
  }

  @override
  Future<void> printOrSharePdf(Map<String, dynamic> paperData, String title) async {
    final bytes = await generatePdfBytes(paperData);
    await Printing.layoutPdf(
      onLayout: (_) async => bytes,
      name: '$title.pdf',
    );
  }
}
