import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/history_provider.dart';
import '../../preview/presentation/preview_screen.dart';
import '../../../shared/widgets/empty_state.dart';

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
    final historyProvider = Provider.of<HistoryProvider>(context);
    final filteredList = historyProvider.history.where((item) {
      final query = _searchQuery.toLowerCase();
      return item.subject.toLowerCase().contains(query) ||
          item.paperType.toLowerCase().contains(query) ||
          item.classId.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Generated Paper History', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
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
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search by subject, class, exam type...',
                  hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF6366F1)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),
            if (historyProvider.isLoading)
              const Expanded(child: Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))))
            else if (historyProvider.errorMessage != null)
              Expanded(
                child: Center(
                  child: Text(historyProvider.errorMessage!, style: const TextStyle(color: Colors.redAccent)),
                ),
              )
            else if (filteredList.isEmpty)
              Expanded(
                child: EmptyStateWidget(
                  icon: Icons.description_outlined,
                  title: 'No Papers Generated Yet',
                  description: 'Generate your first CBSE AI question paper to view and download it here anytime.',
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
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Color(0xFF334155)),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        title: Text(
                          '${item.subject.toUpperCase()} (Class ${item.classId})',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text('Exam: ${item.paperType.toUpperCase()} | Marks: ${item.marks}', style: const TextStyle(color: Color(0xFF94A3B8))),
                            Text('Created: ${item.createdAt}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                          ],
                        ),
                        trailing: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                          icon: const Icon(Icons.visibility, size: 16),
                          label: const Text('View'),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (ctx) => const PreviewScreen()),
                            );
                          },
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
