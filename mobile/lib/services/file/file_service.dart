/// Placeholder interface for Local File Storage & Sharing
abstract class FileService {
  Future<void> saveFile(String fileName, List<int> bytes);
  Future<void> shareFile(String filePath);
}
