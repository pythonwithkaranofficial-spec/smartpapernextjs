import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

/// Service contract for local storage and device sharing
abstract class FileService {
  Future<File> saveFile(String fileName, List<int> bytes);
  Future<void> shareFile(String filePath, {String? subject, String? text});
  Future<void> shareText(String text, {String? subject});
  Future<String> getAppStoragePath();
}

/// Concrete implementation of FileService
class FileServiceImpl implements FileService {
  @override
  Future<String> getAppStoragePath() async {
    final dir = await getApplicationDocumentsDirectory();
    return dir.path;
  }

  @override
  Future<File> saveFile(String fileName, List<int> bytes) async {
    final dirPath = await getAppStoragePath();
    final file = File('$dirPath/$fileName');
    return await file.writeAsBytes(bytes);
  }

  @override
  Future<void> shareFile(String filePath, {String? subject, String? text}) async {
    final xfile = XFile(filePath);
    await Share.shareXFiles(
      [xfile],
      subject: subject,
      text: text,
    );
  }

  @override
  Future<void> shareText(String text, {String? subject}) async {
    await Share.share(text, subject: subject);
  }
}
