import 'package:flutter/material.dart';
import '../../../core/data/subjects_data.dart';
import '../../../core/data/curriculum_data.dart';

class SyllabusScreen extends StatefulWidget {
  const SyllabusScreen({super.key});

  @override
  State<SyllabusScreen> createState() => _SyllabusScreenState();
}

class _SyllabusScreenState extends State<SyllabusScreen> {
  String _selectedClass = '10';
  late String _selectedSubject;

  @override
  void initState() {
    super.initState();
    final subjects = classSubjects[_selectedClass] ?? [];
    _selectedSubject = subjects.isNotEmpty ? subjects.first.id : 'maths';
  }

  @override
  Widget build(BuildContext context) {
    final subjects = classSubjects[_selectedClass] ?? [];
    final currentCurriculum = curriculumData[_selectedClass]?[_selectedSubject];
    final chapters = currentCurriculum?.chapters ?? [];
    final notes = currentCurriculum?.notes;

    final currentSubjObj = subjects.firstWhere(
      (s) => s.id == _selectedSubject,
      orElse: () => subjects.isNotEmpty
          ? subjects.first
          : const SubjectItem(
              id: 'maths',
              name: 'Mathematics',
              icon: Icons.calculate_outlined,
              color: Color(0xFF3B82F6),
            ),
    );

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141414),
        title: const Text('CBSE Syllabus Explorer',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Class Selector Tabs
            Container(
              color: const Color(0xFF141414),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: ['9', '10', '11', '12'].map((c) {
                  final isSelected = _selectedClass == c;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: ChoiceChip(
                        label: Center(child: Text('Class $c')),
                        selected: isSelected,
                        selectedColor: Colors.white,
                        backgroundColor: const Color(0xFF1E1E1E),
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13,
                        ),
                        onSelected: (_) {
                          setState(() {
                            _selectedClass = c;
                            final subs = classSubjects[_selectedClass] ?? [];
                            _selectedSubject = subs.isNotEmpty ? subs.first.id : 'maths';
                          });
                        },
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Subject Selector Horizontal List
            Container(
              height: 52,
              color: const Color(0xFF141414),
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: subjects.length,
                itemBuilder: (ctx, idx) {
                  final s = subjects[idx];
                  final isSelected = _selectedSubject == s.id;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ActionChip(
                      avatar: Icon(s.icon, color: isSelected ? Colors.black : Colors.white, size: 16),
                      label: Text(s.name),
                      backgroundColor: isSelected ? Colors.white : const Color(0xFF1E1E1E),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 12,
                      ),
                      onPressed: () => setState(() => _selectedSubject = s.id),
                    ),
                  );
                },
              ),
            ),

            // Chapter Details Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF141414),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF262626)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E1E1E),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(currentSubjObj.icon, color: Colors.white, size: 28),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${currentSubjObj.name} (Class $_selectedClass)',
                                  style: const TextStyle(
                                      color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${chapters.length} Official CBSE Syllabus Chapters',
                                  style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    if (notes != null && notes.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF141414),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF262626)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.info_outline, color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                notes,
                                style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 12, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 20),
                    const Text('Curriculum Units & Chapters:',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (chapters.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF141414),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Center(
                          child: Text(
                            'Curriculum details are being aligned for this subject.',
                            style: TextStyle(color: Color(0xFF737373)),
                          ),
                        ),
                      )
                    else
                      ...chapters.asMap().entries.map((entry) {
                        final index = entry.key;
                        final chapter = entry.value;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF141414),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF262626)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E1E1E),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Center(
                                  child: Text(
                                    '${index + 1}',
                                    style: const TextStyle(
                                        color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  chapter,
                                  style: const TextStyle(
                                      color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500, height: 1.3),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
