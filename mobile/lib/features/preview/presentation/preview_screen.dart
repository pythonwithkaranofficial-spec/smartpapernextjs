import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';
import '../../generator/services/generator_provider.dart';
import '../../generator/models/generated_paper_model.dart';
import '../../../services/docx/docx_service.dart';

class PreviewScreen extends StatefulWidget {
  const PreviewScreen({super.key});

  @override
  State<PreviewScreen> createState() => _PreviewScreenState();
}

class _PreviewScreenState extends State<PreviewScreen> {
  bool _showSolutions = false;
  bool _isSwapping = false;
  bool _isGeneratingDocx = false;
  bool _isGeneratingPdf = false;

  Future<void> _exportPdf(GeneratedPaperModel paper) async {
    setState(() => _isGeneratingPdf = true);
    try {
      final pdf = pw.Document();

      pw.Font? regularFont;
      pw.Font? boldFont;
      try {
        regularFont = await PdfGoogleFonts.robotoRegular();
        boldFont = await PdfGoogleFonts.robotoBold();
      } catch (_) {
        regularFont = pw.Font.helvetica();
        boldFont = pw.Font.helveticaBold();
      }

      final pdfTheme = pw.ThemeData.withFont(
        base: regularFont,
        bold: boldFont,
      );

      pdf.addPage(
        pw.MultiPage(
          theme: pdfTheme,
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(36),
          header: (pw.Context context) {
            if (context.pageNumber == 1) {
              return pw.Column(
                children: [
                  if (paper.schoolName != null && paper.schoolName!.isNotEmpty)
                    pw.Center(
                      child: pw.Text(
                        paper.schoolName!.toUpperCase(),
                        style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
                      ),
                    ),
                  pw.Center(
                    child: pw.Text(
                      paper.examName,
                      style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
                    ),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Center(
                    child: pw.Text(
                      'Subject: ${paper.subject}   |   Class: ${paper.classText}${paper.setName != null ? "   |   ${paper.setName}" : ""}',
                      style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold),
                    ),
                  ),
                  pw.SizedBox(height: 6),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Time Allowed: ${paper.timeText}', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                      pw.Text('Maximum Marks: ${paper.maxMarksText}', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                    ],
                  ),
                  pw.Divider(thickness: 1.2),
                  if (paper.instructions.isNotEmpty) ...[
                    pw.Align(
                      alignment: pw.Alignment.centerLeft,
                      child: pw.Text('GENERAL INSTRUCTIONS:',
                          style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9)),
                    ),
                    pw.SizedBox(height: 2),
                    ...paper.instructions.map((ins) => pw.Padding(
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
              child: pw.Text('${paper.subject} — Class ${paper.classText}',
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

            for (final section in paper.sections) {
              widgets.add(
                pw.Container(
                  width: double.infinity,
                  padding: const pw.EdgeInsets.symmetric(vertical: 4, horizontal: 6),
                  margin: const pw.EdgeInsets.only(top: 10, bottom: 6),
                  color: PdfColors.grey200,
                  child: pw.Text(
                    '${section.name.toUpperCase()} — ${section.description.toUpperCase()}',
                    style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10),
                  ),
                ),
              );

              for (final q in section.questions) {
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
                                'Q${q.number}. ${q.text}',
                                style: const pw.TextStyle(fontSize: 9),
                              ),
                            ),
                            pw.SizedBox(width: 8),
                            pw.Text('[${q.marks} M]',
                                style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9)),
                          ],
                        ),
                        if (q.choices != null && q.choices!.isNotEmpty)
                          pw.Padding(
                            padding: const pw.EdgeInsets.only(left: 12, top: 3),
                            child: pw.Column(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                for (int cIdx = 0; cIdx < q.choices!.length; cIdx++)
                                  pw.Padding(
                                    padding: const pw.EdgeInsets.only(bottom: 2),
                                    child: pw.Text(
                                      DocxService.formatChoice(cIdx, q.choices![cIdx]),
                                      style: const pw.TextStyle(fontSize: 8.5),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        if (q.orQuestion != null && q.orQuestion!.isNotEmpty) ...[
                          pw.SizedBox(height: 3),
                          pw.Center(child: pw.Text('OR', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8))),
                          pw.SizedBox(height: 2),
                          pw.Padding(
                            padding: const pw.EdgeInsets.only(left: 8),
                            child: pw.Text(q.orQuestion!, style: const pw.TextStyle(fontSize: 9, fontStyle: pw.FontStyle.italic)),
                          ),
                        ],
                        if (_showSolutions && q.solution != null && q.solution!.isNotEmpty)
                          pw.Container(
                            margin: const pw.EdgeInsets.only(top: 4),
                            padding: const pw.EdgeInsets.all(4),
                            decoration: pw.BoxDecoration(
                              color: PdfColors.grey100,
                              border: pw.Border.all(color: PdfColors.grey400),
                              borderRadius: const pw.BorderRadius.all(pw.Radius.circular(3)),
                            ),
                            child: pw.Text(
                              'Ans: ${q.solution}',
                              style: const pw.TextStyle(fontSize: 8, color: PdfColors.black),
                            ),
                          ),
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

      final cleanSub = paper.subject.replaceAll(RegExp(r'[^\w\s]+'), '').replaceAll(' ', '_');
      final cleanCls = paper.classText.replaceAll(RegExp(r'[^\w\s]+'), '').replaceAll(' ', '');
      await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async => pdf.save(),
        name: '${cleanSub}_Class${cleanCls}_Paper.pdf',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text('Export PDF failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isGeneratingPdf = false);
    }
  }

  Future<void> _exportDocx(GeneratedPaperModel paper) async {
    setState(() => _isGeneratingDocx = true);
    try {
      final savedPath = await DocxService.downloadOrSaveDocx(paper);
      final fileName = savedPath.split('/').last.split('\\').last;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.white,
            duration: const Duration(seconds: 4),
            content: Text(
              'Saved to Documents/Smart Paper Generator/$fileName',
              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text('Export Word failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isGeneratingDocx = false);
    }
  }

  void _sharePaper(GeneratedPaperModel paper) {
    final buffer = StringBuffer();
    if (paper.schoolName != null && paper.schoolName!.isNotEmpty) {
      buffer.writeln(paper.schoolName!.toUpperCase());
    }
    buffer.writeln(paper.examName);
    buffer.writeln('Subject: ${paper.subject} | Class: ${paper.classText}');
    buffer.writeln('Time: ${paper.timeText} | Max Marks: ${paper.maxMarksText}');
    buffer.writeln('----------------------------------------\n');

    for (final sec in paper.sections) {
      buffer.writeln('${sec.name} — ${sec.description}');
      for (final q in sec.questions) {
        buffer.writeln('Q${q.number}. ${q.text}  [${q.marks} M]');
        if (q.choices != null) {
          for (int cIdx = 0; cIdx < q.choices!.length; cIdx++) {
            buffer.writeln('   ${DocxService.formatChoice(cIdx, q.choices![cIdx])}');
          }
        }

        if (q.orQuestion != null) {
          buffer.writeln('   OR');
          buffer.writeln('   ${q.orQuestion}');
        }
        if (_showSolutions && q.solution != null) {
          buffer.writeln('   Ans: ${q.solution}');
        }
        buffer.writeln();
      }
    }

    Share.share(
      buffer.toString(),
      subject: '${paper.examName} - ${paper.subject}',
    );
  }

  void _showEditQuestionDialog(
    BuildContext context,
    SectionModel section,
    QuestionModel question,
    GeneratorProvider generator,
  ) {
    final textController = TextEditingController(text: question.text);
    final marksController = TextEditingController(text: question.marks.toString());
    final orTextController = TextEditingController(text: question.orQuestion ?? '');
    final List<TextEditingController> choiceControllers = (question.choices ?? [])
        .map((c) => TextEditingController(text: c))
        .toList();

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF141414),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Color(0xFF262626)),
              ),
              title: Row(
                children: [
                  const Icon(Icons.edit_note, color: Colors.white, size: 22),
                  const SizedBox(width: 8),
                  Text('Edit Question ${question.number}',
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SingleChildScrollView(
                child: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.9,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Question Text', style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: textController,
                        maxLines: 4,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF1F1F1F),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      const Text('Marks', style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: marksController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF1F1F1F),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white)),
                        ),
                      ),
                      if (choiceControllers.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        const Text('Multiple Choice Options', style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        ...List.generate(choiceControllers.length, (cIdx) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 6.0),
                            child: TextField(
                              controller: choiceControllers[cIdx],
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: const Color(0xFF1F1F1F),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white)),
                              ),
                            ),
                          );
                        }),
                      ],
                      const SizedBox(height: 14),
                      const Text('Optional: Internal Choice Question (OR)', style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: orTextController,
                        maxLines: 2,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Leave empty if no OR question',
                          hintStyle: const TextStyle(color: Color(0xFF666666)),
                          filled: true,
                          fillColor: const Color(0xFF1F1F1F),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF333333))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: const Text('Cancel', style: TextStyle(color: Color(0xFFA3A3A3))),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                  ),
                  onPressed: () {
                    final newText = textController.text.trim();
                    final newMarks = int.tryParse(marksController.text.trim()) ?? question.marks;
                    final newChoices = List.generate(
                      choiceControllers.length,
                      (cIdx) => DocxService.formatChoice(cIdx, choiceControllers[cIdx].text.trim()),
                    );
                    final newOrText = orTextController.text.trim();

                    if (newText.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Question text cannot be empty')),
                      );
                      return;
                    }

                    generator.editQuestion(
                      sectionId: section.id,
                      questionId: question.id,
                      newText: newText,
                      newMarks: newMarks,
                      newChoices: newChoices.isNotEmpty ? newChoices : null,
                      newOrQuestion: newOrText.isNotEmpty ? newOrText : null,
                    );

                    Navigator.pop(dialogCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Question ${question.number} updated!')),
                    );
                  },
                  child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final generator = Provider.of<GeneratorProvider>(context);
    final paper = generator.currentPaperSet;

    if (paper == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0A0A),
        appBar: AppBar(
          backgroundColor: const Color(0xFF141414),
          title: const Text('Paper Preview', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        body: const Center(
          child: Text('No paper generated yet.', style: TextStyle(color: Colors.white70, fontSize: 16)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141414),
        title: Text(
          paper.setName != null ? 'Paper Preview (${paper.setName})' : 'Paper Preview',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: Colors.white),
            tooltip: 'Share Paper Text',
            onPressed: () => _sharePaper(paper),
          ),
          IconButton(
            icon: _isGeneratingDocx
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.description_outlined, color: Colors.white),
            tooltip: 'Download Word (.docx)',
            onPressed: _isGeneratingDocx ? null : () => _exportDocx(paper),
          ),
          IconButton(
            icon: _isGeneratingPdf
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.picture_as_pdf_outlined, color: Colors.white),
            tooltip: 'Export PDF',
            onPressed: _isGeneratingPdf ? null : () => _exportPdf(paper),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Variant Set Selector if multi-set was generated
            if (generator.generatedPaper?.sets != null && generator.generatedPaper!.sets!.length > 1)
              Container(
                color: const Color(0xFF141414),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Text('Sets Variant:',
                        style: TextStyle(color: Color(0xFFA3A3A3), fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(width: 12),
                    ...List.generate(generator.generatedPaper!.sets!.length, (idx) {
                      final setName = 'SET ${String.fromCharCode(65 + idx)}';
                      final isSelected = generator.activeSetIndex == idx;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: ChoiceChip(
                          label: Text(setName),
                          selected: isSelected,
                          selectedColor: Colors.white,
                          backgroundColor: const Color(0xFF1F1F1F),
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                          onSelected: (_) => generator.setActiveSetIndex(idx),
                        ),
                      );
                    }),
                  ],
                ),
              ),

            // Paper Toolbar (Show Solutions & Quick Export)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: Color(0xFF141414),
                border: Border(bottom: BorderSide(color: Color(0xFF262626))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Switch(
                        value: _showSolutions,
                        activeThumbColor: Colors.white,
                        activeTrackColor: const Color(0xFF404040),
                        inactiveThumbColor: const Color(0xFFA3A3A3),
                        inactiveTrackColor: const Color(0xFF262626),
                        onChanged: (val) => setState(() => _showSolutions = val),
                      ),
                      const SizedBox(width: 6),
                      const Text('Answer Key',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFF404040)),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.description, size: 15),
                        label: const Text('Word', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: _isGeneratingDocx ? null : () => _exportDocx(paper),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.download, size: 15),
                        label: const Text('PDF', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: _isGeneratingPdf ? null : () => _exportPdf(paper),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            if (_isSwapping)
              const LinearProgressIndicator(
                backgroundColor: Color(0xFF1F1F1F),
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),

            // Main Paper Sheet Container
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Center(
                  child: Container(
                    constraints: const BoxConstraints(maxWidth: 800),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.5),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // School Header
                        if (paper.schoolName != null && paper.schoolName!.isNotEmpty)
                          Center(
                            child: Text(
                              paper.schoolName!.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                                letterSpacing: 0.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        Center(
                          child: Text(
                            paper.examName.toUpperCase(),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Center(
                          child: Text(
                            'Subject: ${paper.subject}   |   Class: ${paper.classText}${paper.setName != null ? "   |   ${paper.setName}" : ""}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Time & Max Marks
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Time Allowed: ${paper.timeText}',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                            Text('Maximum Marks: ${paper.maxMarksText}',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                          ],
                        ),
                        const Divider(color: Colors.black87, thickness: 1.5),

                        // General Instructions
                        if (paper.instructions.isNotEmpty) ...[
                          const Text('GENERAL INSTRUCTIONS:',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.black)),
                          const SizedBox(height: 4),
                          ...paper.instructions.map((ins) => Padding(
                                padding: const EdgeInsets.only(bottom: 2),
                                child: Text('• $ins',
                                    style: const TextStyle(fontSize: 10.5, color: Colors.black87, height: 1.3)),
                              )),
                          const Divider(color: Colors.black45, thickness: 1),
                          const SizedBox(height: 8),
                        ],

                        // Sections & Questions
                        ...paper.sections.map((section) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 8),
                                margin: const EdgeInsets.symmetric(vertical: 8),
                                color: const Color(0xFFEEEEEE),
                                child: Text(
                                  '${section.name.toUpperCase()} — ${section.description.toUpperCase()}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black),
                                ),
                              ),
                              ...List.generate(section.questions.length, (qIdx) {
                                final q = section.questions[qIdx];
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12.0),
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: Colors.transparent,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFFE5E5E5)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              'Q${q.number}. ${q.text}',
                                              style: const TextStyle(
                                                fontSize: 13,
                                                color: Colors.black,
                                                fontWeight: FontWeight.w500,
                                                height: 1.35,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '[${q.marks} M]',
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 12),
                                          ),
                                        ],
                                      ),

                                      // Multiple choice options
                                      if (q.choices != null && q.choices!.isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.only(left: 16.0, top: 4),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: List.generate(
                                              q.choices!.length,
                                              (cIdx) => Padding(
                                                padding: const EdgeInsets.only(bottom: 2),
                                                child: Text(
                                                  DocxService.formatChoice(cIdx, q.choices![cIdx]),
                                                  style: const TextStyle(fontSize: 12, color: Colors.black87),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),

                                      // Internal choice "OR"
                                      if (q.orQuestion != null && q.orQuestion!.isNotEmpty) ...[
                                        const SizedBox(height: 6),
                                        const Center(
                                          child: Text('OR',
                                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.black)),
                                        ),
                                        const SizedBox(height: 4),
                                        Padding(
                                          padding: const EdgeInsets.only(left: 12.0),
                                          child: Text(
                                            q.orQuestion!,
                                            style: const TextStyle(
                                                fontSize: 13, fontStyle: FontStyle.italic, color: Colors.black87),
                                          ),
                                        ),
                                      ],

                                      // Answer Key / Solution
                                      if (_showSolutions && q.solution != null && q.solution!.isNotEmpty)
                                        Container(
                                          margin: const EdgeInsets.only(top: 8),
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF5F5F5),
                                            border: Border.all(color: const Color(0xFFCCCCCC)),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            'Solution: ${q.solution}',
                                            style: const TextStyle(fontSize: 11, color: Colors.black87, fontWeight: FontWeight.w500),
                                          ),
                                        ),

                                      const SizedBox(height: 8),

                                      // Question Actions Bar (Edit, Swap, Move Up, Move Down, Delete)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF9F9F9),
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: const Color(0xFFE5E5E5)),
                                        ),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.end,
                                          children: [
                                            // Edit Button
                                            IconButton(
                                              icon: const Icon(Icons.edit_outlined, size: 17, color: Color(0xFF262626)),
                                              tooltip: 'Edit Question',
                                              visualDensity: VisualDensity.compact,
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                              onPressed: () => _showEditQuestionDialog(context, section, q, generator),
                                            ),

                                            // Swap / Re-roll Button
                                            IconButton(
                                              icon: const Icon(Icons.sync, size: 17, color: Color(0xFF262626)),
                                              tooltip: 'Swap Question with AI',
                                              visualDensity: VisualDensity.compact,
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                              onPressed: _isSwapping
                                                  ? null
                                                  : () async {
                                                      setState(() => _isSwapping = true);
                                                      final messenger = ScaffoldMessenger.of(context);
                                                      final success = await generator.swapQuestion(
                                                        sectionId: section.id,
                                                        questionId: q.id,
                                                        questionNumber: q.number,
                                                        currentText: q.text,
                                                        subject: paper.subject,
                                                        classText: paper.classText,
                                                        questionType: q.type,
                                                        marks: q.marks,
                                                        language: generator.config.language,
                                                      );
                                                      setState(() => _isSwapping = false);
                                                      if (success && mounted) {
                                                        messenger.showSnackBar(
                                                          const SnackBar(
                                                            backgroundColor: Colors.black,
                                                            content: Text('Question swapped with AI!'),
                                                          ),
                                                        );
                                                      } else if (!success && mounted) {
                                                        messenger.showSnackBar(
                                                          SnackBar(
                                                            backgroundColor: Colors.redAccent,
                                                            content: Text(generator.errorMessage ?? 'Swap failed.'),
                                                          ),
                                                        );
                                                      }
                                                    },
                                            ),

                                            // Move Up Button
                                            IconButton(
                                              icon: const Icon(Icons.arrow_upward, size: 17, color: Color(0xFF262626)),
                                              tooltip: 'Move Up',
                                              visualDensity: VisualDensity.compact,
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                              onPressed: qIdx == 0
                                                  ? null
                                                  : () => generator.moveQuestion(
                                                        sectionId: section.id,
                                                        currentIndex: qIdx,
                                                        direction: 'up',
                                                      ),
                                            ),

                                            // Move Down Button
                                            IconButton(
                                              icon: const Icon(Icons.arrow_downward, size: 17, color: Color(0xFF262626)),
                                              tooltip: 'Move Down',
                                              visualDensity: VisualDensity.compact,
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                              onPressed: qIdx == section.questions.length - 1
                                                  ? null
                                                  : () => generator.moveQuestion(
                                                        sectionId: section.id,
                                                        currentIndex: qIdx,
                                                        direction: 'down',
                                                      ),
                                            ),

                                            // Delete Button
                                            IconButton(
                                              icon: const Icon(Icons.delete_outline, size: 17, color: Colors.redAccent),
                                              tooltip: 'Delete Question',
                                              visualDensity: VisualDensity.compact,
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                              onPressed: () {
                                                showDialog(
                                                  context: context,
                                                  builder: (dCtx) => AlertDialog(
                                                    backgroundColor: const Color(0xFF141414),
                                                    title: const Text('Delete Question', style: TextStyle(color: Colors.white)),
                                                    content: Text(
                                                      'Are you sure you want to remove Question ${q.number}?',
                                                      style: const TextStyle(color: Color(0xFFA3A3A3)),
                                                    ),
                                                    actions: [
                                                      TextButton(
                                                        onPressed: () => Navigator.pop(dCtx),
                                                        child: const Text('Cancel', style: TextStyle(color: Color(0xFFA3A3A3))),
                                                      ),
                                                      ElevatedButton(
                                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                                                        onPressed: () {
                                                          generator.deleteQuestion(sectionId: section.id, questionId: q.id);
                                                          Navigator.pop(dCtx);
                                                        },
                                                        child: const Text('Delete', style: TextStyle(color: Colors.white)),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                              },
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
