import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:archive/archive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../features/generator/models/generated_paper_model.dart';

class DocxService {
  static String _escapeXml(String text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
  }

  static Uint8List generateDocxBytes(GeneratedPaperModel paper) {
    final archive = Archive();

    // 1. [Content_Types].xml
    const contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
        '  <Default Extension="xml" ContentType="application/xml"/>\n'
        '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n'
        '  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n'
        '</Types>';
    archive.addFile(ArchiveFile('[Content_Types].xml', contentTypesXml.length, utf8.encode(contentTypesXml)));

    // 2. _rels/.rels
    const rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n'
        '</Relationships>';
    archive.addFile(ArchiveFile('_rels/.rels', rootRelsXml.length, utf8.encode(rootRelsXml)));

    // 3. word/_rels/document.xml.rels
    const docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n'
        '</Relationships>';
    archive.addFile(ArchiveFile('word/_rels/document.xml.rels', docRelsXml.length, utf8.encode(docRelsXml)));

    // 4. word/styles.xml
    const stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
        '  <w:docDefaults>\n'
        '    <w:rPrDefault>\n'
        '      <w:rPr>\n'
        '        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>\n'
        '        <w:sz w:val="22"/>\n'
        '      </w:rPr>\n'
        '    </w:rPrDefault>\n'
        '  </w:docDefaults>\n'
        '</w:styles>';
    archive.addFile(ArchiveFile('word/styles.xml', stylesXml.length, utf8.encode(stylesXml)));

    // 5. Build word/document.xml
    final StringBuffer body = StringBuffer();

    // Helper for adding a paragraph
    void addParagraph(String text, {
      bool bold = false,
      int sizeHalfPoints = 22, // 22 = 11pt
      String align = 'left', // left, center, right
      int spaceAfter = 120, // in twips
      int spaceBefore = 0,
    }) {
      body.write('<w:p>');
      body.write('<w:pPr>');
      if (align != 'left') {
        body.write('<w:jc w:val="$align"/>');
      }
      body.write('<w:spacing w:before="$spaceBefore" w:after="$spaceAfter" w:line="240" w:lineRule="auto"/>');
      body.write('</w:pPr>');
      body.write('<w:r>');
      body.write('<w:rPr>');
      if (bold) body.write('<w:b/>');
      body.write('<w:sz w:val="$sizeHalfPoints"/>');
      body.write('</w:rPr>');
      body.write('<w:t xml:space="preserve">${_escapeXml(text)}</w:t>');
      body.write('</w:r>');
      body.write('</w:p>');
    }

    // 1. School Name
    if (paper.schoolName != null && paper.schoolName!.trim().isNotEmpty) {
      addParagraph(paper.schoolName!.toUpperCase(), bold: true, sizeHalfPoints: 28, align: 'center', spaceAfter: 80);
    }

    // 2. Exam Name
    addParagraph(paper.examName.toUpperCase(), bold: true, sizeHalfPoints: 24, align: 'center', spaceAfter: 60);

    // 3. Subject and Class line
    final subInfo = 'Subject: ${paper.subject}   |   Class: ${paper.classText}${paper.setName != null ? "   |   ${paper.setName}" : ""}';
    addParagraph(subInfo, bold: true, sizeHalfPoints: 20, align: 'center', spaceAfter: 120);

    // 4. Time & Maximum Marks line
    body.write('<w:p>');
    body.write('<w:pPr><w:spacing w:before="60" w:after="140"/><w:tabs><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>');
    body.write('<w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Time Allowed: ${_escapeXml(paper.timeText)}</w:t></w:r>');
    body.write('<w:r><w:tab/></w:r>');
    body.write('<w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Maximum Marks: ${_escapeXml(paper.maxMarksText)}</w:t></w:r>');
    body.write('</w:p>');

    // 5. Divider
    body.write('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="1" w:color="333333"/></w:pBdr><w:spacing w:after="100"/></w:pPr></w:p>');

    // 6. General Instructions
    if (paper.instructions.isNotEmpty) {
      addParagraph('GENERAL INSTRUCTIONS:', bold: true, sizeHalfPoints: 19, spaceAfter: 40);
      for (final ins in paper.instructions) {
        addParagraph('• $ins', sizeHalfPoints: 18, spaceAfter: 40);
      }
      body.write('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="666666"/></w:pBdr><w:spacing w:before="60" w:after="140"/></w:pPr></w:p>');
    }

    // 7. Sections & Questions
    for (final sec in paper.sections) {
      // Section Header Box
      body.write('<w:p>');
      body.write('<w:pPr>');
      body.write('<w:shd w:val="clear" w:color="auto" w:fill="E5E7EB"/>');
      body.write('<w:spacing w:before="180" w:after="100"/>');
      body.write('<w:pBdr>');
      body.write('<w:top w:val="single" w:sz="4" w:color="CCCCCC"/>');
      body.write('<w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/>');
      body.write('</w:pBdr>');
      body.write('</w:pPr>');
      body.write('<w:r>');
      body.write('<w:rPr><w:b/><w:sz w:val="21"/></w:rPr>');
      body.write('<w:t xml:space="preserve">  ${_escapeXml(sec.name.toUpperCase())} — ${_escapeXml(sec.description.toUpperCase())}</w:t>');
      body.write('</w:r>');
      body.write('</w:p>');

      // Questions in Section
      for (final q in sec.questions) {
        body.write('<w:p>');
        body.write('<w:pPr><w:spacing w:before="80" w:after="40"/><w:tabs><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>');
        body.write('<w:r><w:rPr><w:b/><w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">Q${q.number}. </w:t></w:r>');
        body.write('<w:r><w:rPr><w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">${_escapeXml(q.text)}</w:t></w:r>');
        body.write('<w:r><w:tab/></w:r>');
        body.write('<w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">[${q.marks} M]</w:t></w:r>');
        body.write('</w:p>');

        // Choices if MCQ with proper (A), (B), (C), (D) mapping
        if (q.choices != null && q.choices!.isNotEmpty) {
          for (int cIdx = 0; cIdx < q.choices!.length; cIdx++) {
            final formatted = formatChoice(cIdx, q.choices![cIdx]);
            body.write('<w:p>');
            body.write('<w:pPr><w:ind w:left="400"/><w:spacing w:before="20" w:after="30"/></w:pPr>');
            body.write('<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${_escapeXml(formatted)}</w:t></w:r>');
            body.write('</w:p>');
          }
        }

        // OR Question if internal choice
        if (q.orQuestion != null && q.orQuestion!.trim().isNotEmpty) {
          addParagraph('OR', bold: true, sizeHalfPoints: 19, align: 'center', spaceBefore: 60, spaceAfter: 40);
          body.write('<w:p>');
          body.write('<w:pPr><w:ind w:left="300"/><w:spacing w:before="40" w:after="60"/></w:pPr>');
          body.write('<w:r><w:rPr><w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">${_escapeXml(q.orQuestion!)}</w:t></w:r>');
          body.write('</w:p>');
        }
      }
    }

    final documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
        '  <w:body>\n'
        '    $body\n'
        '    <w:sectPr>\n'
        '      <w:pgSz w:w="11906" w:h="16838"/>\n' // A4 portrait size
        '      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>\n' // 1 inch margins
        '    </w:sectPr>\n'
        '  </w:body>\n'
        '</w:document>';

    archive.addFile(ArchiveFile('word/document.xml', utf8.encode(documentXml).length, utf8.encode(documentXml)));

    final zipData = ZipEncoder().encode(archive);
    return Uint8List.fromList(zipData);
  }

  /// Formats raw MCQ option into standard (A), (B), (C), (D) notation
  static String formatChoice(int index, String rawChoice) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    final letter = index < letters.length ? letters[index] : String.fromCharCode(65 + index);
    final cleaned = rawChoice
        .trim()
        .replaceFirst(RegExp(r'^[\(\[\{]?[a-fA-F0-9][.\)\:\-\]]\s*'), '')
        .trim();
    return '($letter) $cleaned';
  }

  /// Saves the paper as DOCX into Documents/Smart Paper Generator/
  static Future<String> downloadOrSaveDocx(GeneratedPaperModel paper) async {
    final bytes = generateDocxBytes(paper);
    final cleanSubject = paper.subject.replaceAll(RegExp(r'[^\w\s]+'), '').replaceAll(' ', '_');
    final cleanClass = paper.classText.replaceAll(RegExp(r'[^\w\s]+'), '').replaceAll(' ', '');
    final fileName = '${cleanSubject}_Class_${cleanClass}_Paper.docx';

    File? targetFile;

    // 1. Primary target: Documents/Smart Paper Generator
    try {
      final docsDir = Directory('/storage/emulated/0/Documents/Smart Paper Generator');
      if (!await docsDir.exists()) {
        await docsDir.create(recursive: true);
      }
      final file = File('${docsDir.path}/$fileName');
      await file.writeAsBytes(bytes);
      targetFile = file;
    } catch (_) {
      // 2. Secondary target: App Documents directory / Smart Paper Generator
      try {
        final appDocs = await getApplicationDocumentsDirectory();
        final docsDir = Directory('${appDocs.path}/Smart Paper Generator');
        if (!await docsDir.exists()) {
          await docsDir.create(recursive: true);
        }
        final file = File('${docsDir.path}/$fileName');
        await file.writeAsBytes(bytes);
        targetFile = file;
      } catch (_) {
        // 3. Fallback: Temporary directory
        final tempDir = await getTemporaryDirectory();
        final file = File('${tempDir.path}/$fileName');
        await file.writeAsBytes(bytes);
        targetFile = file;
      }
    }

    // Trigger share/open sheet so the user can immediately open in Word
    try {
      await Share.shareXFiles(
        [XFile(targetFile.path)],
        text: '${paper.examName} - ${paper.subject} (Class ${paper.classText}) Question Paper',
        subject: fileName,
      );
    } catch (_) {}

    return targetFile.path;
  }

  /// Backward compatible alias
  static Future<String> downloadOrShareDocx(GeneratedPaperModel paper) => downloadOrSaveDocx(paper);
}

