import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';
import '../../generator/services/generator_provider.dart';
import '../../generator/models/generated_paper_model.dart';

class PreviewScreen extends StatefulWidget {
  const PreviewScreen({super.key});

  @override
  State<PreviewScreen> createState() => _PreviewScreenState();
}

class _PreviewScreenState extends State<PreviewScreen> {
  bool _showSolutions = false;

  Future<void> _exportPdf(GeneratedPaperModel paper) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
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
              pw.Center(
                child: pw.Text('Subject: ${paper.subject}  |  Class: ${paper.classText}'),
              ),
              pw.SizedBox(height: 8),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Time: ${paper.timeText}'),
                  pw.Text('Max Marks: ${paper.maxMarksText}'),
                ],
              ),
              pw.Divider(),
              if (paper.instructions.isNotEmpty) ...[
                pw.Text('GENERAL INSTRUCTIONS:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                ...paper.instructions.map((ins) => pw.Text('• $ins', style: const pw.TextStyle(fontSize: 9))),
                pw.SizedBox(height: 10),
              ],
              ...paper.sections.map((section) {
                return pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.SizedBox(height: 8),
                    pw.Text('${section.name} - ${section.description}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                    ...section.questions.map((q) {
                      return pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(vertical: 4),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text('Q${q.number}. ${q.text} [${q.marks} M]', style: const pw.TextStyle(fontSize: 10)),
                            if (q.choices != null)
                              ...q.choices!.map((c) => pw.Text('   $c', style: const pw.TextStyle(fontSize: 9))),
                          ],
                        ),
                      );
                    }),
                  ],
                );
              }),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: '${paper.subject}_Paper.pdf',
    );
  }

  void _sharePaper(GeneratedPaperModel paper) {
    final buffer = StringBuffer();
    buffer.writeln('${paper.schoolName ?? "EXAMINATION"}\n${paper.examName}');
    buffer.writeln('Subject: ${paper.subject} | ${paper.classText}');
    buffer.writeln('Max Marks: ${paper.maxMarksText} | Time: ${paper.timeText}\n');
    for (final sec in paper.sections) {
      buffer.writeln('\n${sec.name} (${sec.description})');
      for (final q in sec.questions) {
        buffer.writeln('Q${q.number}. ${q.text} [${q.marks} M]');
      }
    }

    Share.share(buffer.toString(), subject: '${paper.subject} Question Paper');
  }

  @override
  Widget build(BuildContext context) {
    final generator = Provider.of<GeneratorProvider>(context);
    final paper = generator.currentPaperSet;

    if (paper == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(title: const Text('Paper Preview')),
        body: const Center(child: Text('No paper generated yet.', style: TextStyle(color: Colors.white))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(paper.setName != null ? 'Paper Preview (${paper.setName})' : 'Paper Preview', style: const TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.white),
            tooltip: 'Share Paper',
            onPressed: () => _sharePaper(paper),
          ),
          IconButton(
            icon: const Icon(Icons.picture_as_pdf, color: Colors.redAccent),
            tooltip: 'Export PDF',
            onPressed: () => _exportPdf(paper),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Variant Set Selector if multi-set
            if (generator.generatedPaper?.sets != null && generator.generatedPaper!.sets!.isNotEmpty)
              Container(
                color: const Color(0xFF1E293B),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Text('Sets Variant:', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                    const SizedBox(width: 12),
                    ...List.generate(generator.generatedPaper!.sets!.length, (idx) {
                      final setName = 'SET ${String.fromCharCode(65 + idx)}';
                      final isSelected = generator.activeSetIndex == idx;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: ChoiceChip(
                          label: Text(setName),
                          selected: isSelected,
                          selectedColor: const Color(0xFF6366F1),
                          backgroundColor: const Color(0xFF0F172A),
                          labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8)),
                          onSelected: (_) => generator.setActiveSetIndex(idx),
                        ),
                      );
                    }),
                  ],
                ),
              ),

            // Paper Toolbar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: const Color(0xFF1E293B).withValues(alpha: 0.5),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Switch(
                        value: _showSolutions,
                        activeTrackColor: const Color(0xFF10B981),
                        onChanged: (val) => setState(() => _showSolutions = val),
                      ),
                      const Text('Show Solutions Key', style: TextStyle(color: Colors.white, fontSize: 13)),
                    ],
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                    icon: const Icon(Icons.download, size: 18),
                    label: const Text('Export PDF'),
                    onPressed: () => _exportPdf(paper),
                  ),
                ],
              ),
            ),

            // Paper View Canvas
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (paper.schoolName != null && paper.schoolName!.isNotEmpty)
                        Center(
                          child: Text(
                            paper.schoolName!.toUpperCase(),
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black),
                          ),
                        ),
                      Center(
                        child: Text(
                          paper.examName,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                      ),
                      Center(
                        child: Text(
                          'Subject: ${paper.subject}   |   Class: ${paper.classText}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black54),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Time Allowed: ${paper.timeText}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                          Text('Maximum Marks: ${paper.maxMarksText}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                        ],
                      ),
                      const Divider(color: Colors.black45, thickness: 1.5),

                      if (paper.instructions.isNotEmpty) ...[
                        const Text('GENERAL INSTRUCTIONS:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black)),
                        const SizedBox(height: 4),
                        ...paper.instructions.map((ins) => Padding(
                              padding: const EdgeInsets.only(bottom: 2),
                              child: Text('• $ins', style: const TextStyle(fontSize: 11, color: Colors.black87)),
                            )),
                        const SizedBox(height: 12),
                      ],

                      // Sections & Questions
                      ...paper.sections.map((section) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                              color: Colors.grey.shade200,
                              child: Text(
                                '${section.name.toUpperCase()} — ${section.description.toUpperCase()}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black),
                              ),
                            ),
                            const SizedBox(height: 8),
                            ...section.questions.map((q) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            'Q${q.number}. ${q.text}',
                                            style: const TextStyle(fontSize: 13, color: Colors.black, fontWeight: FontWeight.w500),
                                          ),
                                        ),
                                        Text(' [${q.marks} M]', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 13)),
                                        IconButton(
                                          icon: const Icon(Icons.sync, size: 18, color: Color(0xFF6366F1)),
                                          tooltip: 'Swap Question (AI)',
                                          onPressed: () async {
                                            final messenger = ScaffoldMessenger.of(context);
                                            final success = await generator.swapQuestion(
                                              sectionId: section.id,
                                              questionId: q.id,
                                              currentText: q.text,
                                              subject: paper.subject,
                                              classId: paper.classText,
                                              questionType: q.type,
                                              marks: q.marks,
                                            );
                                            if (success && mounted) {
                                              messenger.showSnackBar(
                                                const SnackBar(content: Text('Question swapped with AI!')),
                                              );
                                            }
                                          },
                                        ),
                                      ],
                                    ),

                                    if (q.choices != null)
                                      Padding(
                                        padding: const EdgeInsets.only(left: 16.0, top: 4),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: q.choices!.map((c) => Text(c, style: const TextStyle(fontSize: 12, color: Colors.black87))).toList(),
                                        ),
                                      ),

                                    if (_showSolutions && q.solution != null)
                                      Container(
                                        margin: const EdgeInsets.only(top: 4, left: 12),
                                        padding: const EdgeInsets.all(6),
                                        color: Colors.green.shade50,
                                        child: Text('Solution: ${q.solution}', style: TextStyle(fontSize: 11, color: Colors.green.shade900, fontStyle: FontStyle.italic)),
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
          ],
        ),
      ),
    );
  }
}
