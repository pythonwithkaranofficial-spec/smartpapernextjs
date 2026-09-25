import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../app/theme/theme_provider.dart';
import '../../../app/theme/app_colors.dart';
import '../services/history_provider.dart';
import '../../generator/services/generator_provider.dart';
import '../../preview/presentation/preview_screen.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../services/docx/docx_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HistoryProvider>(context, listen: false).fetchHistory();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final historyProvider = Provider.of<HistoryProvider>(context);
    final generatorProvider = Provider.of<GeneratorProvider>(context, listen: false);

    final isDark = themeProvider.isDarkMode;
    final bg = AppColors.getBackground(isDark);
    final cardBg = AppColors.getSurface(isDark);
    final elevatedBg = AppColors.getSurfaceElevated(isDark);
    final borderColor = AppColors.getBorder(isDark);
    final textColor = AppColors.getTextPrimary(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    final filteredList = historyProvider.history.where((item) {
      final query = _searchQuery.toLowerCase();
      return item.subject.toLowerCase().contains(query) ||
          item.paperType.toLowerCase().contains(query) ||
          item.classId.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: cardBg,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        title: Text(
          'Paper History',
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 17),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: textColor),
            tooltip: 'Refresh History',
            onPressed: () => historyProvider.fetchHistory(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                style: TextStyle(color: textColor, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Search by subject, class, or exam...',
                  hintStyle: TextStyle(color: subtextColor),
                  prefixIcon: Icon(Icons.search, color: subtextColor, size: 20),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear, color: subtextColor, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: elevatedBg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: borderColor)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: borderColor)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: textColor)),
                ),
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),
            if (historyProvider.isLoading && historyProvider.history.isEmpty)
              Expanded(child: Center(child: CircularProgressIndicator(color: textColor)))
            else if (filteredList.isEmpty)
              const Expanded(
                child: EmptyStateWidget(
                  icon: Icons.description_outlined,
                  title: 'No Papers Found',
                  description: 'Generate your first CBSE AI question paper to view and export it here anytime.',
                ),
              )
            else
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: filteredList.length,
                  itemBuilder: (ctx, idx) {
                    final item = filteredList[idx];
                    return Card(
                      color: cardBg,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                        side: BorderSide(color: borderColor),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    '${item.subject.toUpperCase()} (Class ${item.classId})',
                                    style: TextStyle(
                                      color: textColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.2)),
                                  ),
                                  child: Text(
                                    '${item.marks} Marks',
                                    style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Assessment: ${item.paperType.toUpperCase()} • ${item.difficulty}',
                              style: TextStyle(color: subtextColor, fontSize: 12.5),
                            ),
                            if (item.createdAt.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 3),
                                child: Text(
                                  'Created: ${item.createdAt}',
                                  style: TextStyle(color: subtextColor, fontSize: 11),
                                ),
                              ),
                            const SizedBox(height: 14),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                // Export Word
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: textColor,
                                    side: BorderSide(color: borderColor),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  icon: const Icon(Icons.description_outlined, size: 14),
                                  label: const Text('Word (.docx)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                  onPressed: () async {
                                    final messenger = ScaffoldMessenger.of(context);
                                    try {
                                      final path = await DocxService.downloadOrSaveDocx(item.paperData);
                                      final fileName = path.split('/').last.split('\\').last;
                                      messenger.showSnackBar(
                                        SnackBar(
                                          backgroundColor: isDark ? Colors.white : Colors.black,
                                          duration: const Duration(seconds: 4),
                                          content: Text(
                                            'Saved to Documents/Smart Paper Generator/$fileName',
                                            style: TextStyle(
                                              color: isDark ? Colors.black : Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      );
                                    } catch (e) {
                                      messenger.showSnackBar(
                                        SnackBar(content: Text('Failed to export Word: $e')),
                                      );
                                    }
                                  },
                                ),
                                const SizedBox(width: 8),

                                // Open Paper in Preview
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isDark ? Colors.white : Colors.black,
                                    foregroundColor: isDark ? Colors.black : Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  icon: const Icon(Icons.visibility_outlined, size: 15),
                                  label: const Text('Open Paper', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                  onPressed: () {
                                    generatorProvider.setLoadedPaper(item.paperData);
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (ctx) => const PreviewScreen()),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
