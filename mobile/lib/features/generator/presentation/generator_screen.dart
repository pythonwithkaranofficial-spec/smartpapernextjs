import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/generator_provider.dart';
import '../models/paper_config_model.dart';
import '../../preview/presentation/preview_screen.dart';
import '../../../shared/widgets/loading_overlay.dart';

class GeneratorScreen extends StatefulWidget {
  const GeneratorScreen({super.key});

  @override
  State<GeneratorScreen> createState() => _GeneratorScreenState();
}

class _GeneratorScreenState extends State<GeneratorScreen> {
  int _currentStep = 0;

  final _schoolNameController = TextEditingController();
  final _teacherNameController = TextEditingController();

  final List<Map<String, String>> _examTypes = [
    {'id': 'class_test', 'name': 'Class Test'},
    {'id': 'periodic_test', 'name': 'Periodic Test'},
    {'id': 'unit_test', 'name': 'Unit Test'},
    {'id': 'half_yearly', 'name': 'Half Yearly'},
    {'id': 'annual_exam', 'name': 'Annual Exam'},
    {'id': 'pre_board', 'name': 'Pre-Board'},
    {'id': 'sample_paper', 'name': 'Sample Paper'},
  ];

  final List<String> _classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  final List<Map<String, String>> _subjects = [
    {'id': 'mathematics', 'name': 'Mathematics'},
    {'id': 'science', 'name': 'Science'},
    {'id': 'english', 'name': 'English'},
    {'id': 'social_science', 'name': 'Social Science'},
    {'id': 'hindi', 'name': 'हिन्दी (Hindi)'},
    {'id': 'physics', 'name': 'Physics'},
    {'id': 'chemistry', 'name': 'Chemistry'},
    {'id': 'biology', 'name': 'Biology'},
  ];

  final Map<String, List<String>> _chaptersMap = {
    'mathematics': ['Real Numbers', 'Polynomials', 'Pair of Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Circles', 'Statistics', 'Probability'],
    'science': ['Chemical Reactions & Equations', 'Acids, Bases & Salts', 'Metals & Non-metals', 'Carbon & Its Compounds', 'Life Processes', 'Control & Coordination', 'Light Reflection & Refraction', 'Electricity', 'Magnetic Effects of Electric Current', 'Our Environment'],
    'english': ['A Letter to God', 'Nelson Mandela', 'Two Stories about Flying', 'From the Diary of Anne Frank', 'The Hundred Dresses', 'Glimpses of India', 'Fog', 'The Trees'],
    'social_science': ['The Rise of Nationalism in Europe', 'Nationalism in India', 'Resources & Development', 'Forest & Wildlife', 'Water Resources', 'Agriculture', 'Power Sharing', 'Federalism'],
    'hindi': ['सूरदास के पद', 'राम-लक्ष्मण-परशुराम संवाद', 'उत्साह और अट नहीं रही', 'नेताजी का चश्मा', 'बालगोबिन भगत', 'माता का आँचल'],
    'physics': ['Electric Charges & Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges & Magnetism', 'Ray Optics', 'Wave Optics'],
    'chemistry': ['The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Haloalkanes & Haloarenes'],
    'biology': ['Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health', 'Genetics', 'Evolution'],
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GeneratorProvider>(context, listen: false).fetchUserUsage();
    });
  }

  @override
  void dispose() {
    _schoolNameController.dispose();
    _teacherNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final generator = Provider.of<GeneratorProvider>(context);
    final config = generator.config;

    return PopScope(
      canPop: _currentStep == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _currentStep > 0) {
          setState(() => _currentStep--);
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Paper Generator Wizard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        body: Stack(
          children: [
            SafeArea(
              child: Column(
                children: [
                  Container(
                    color: const Color(0xFF1E293B),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(5, (idx) {
                        final isCompleted = idx < _currentStep;
                        final isCurrent = idx == _currentStep;
                        return Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: isCurrent
                                  ? const Color(0xFF6366F1)
                                  : (isCompleted ? const Color(0xFF10B981) : const Color(0xFF334155)),
                              child: isCompleted
                                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                                  : Text('${idx + 1}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            if (idx < 4)
                              Container(
                                width: 24,
                                height: 2,
                                color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF334155),
                              ),
                          ],
                        );
                      }),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Step ${_currentStep + 1} of 5', style: const TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.w600)),
                        Text(
                          'Quota: ${generator.papersGeneratedToday}/${generator.dailyLimit} Used',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  if (generator.errorMessage != null)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      padding: const EdgeInsets.all(10),
                      color: Colors.red.withValues(alpha: 0.15),
                      child: Text(generator.errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                    ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: _buildStepContent(config, generator),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: const Color(0xFF1E293B),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (_currentStep > 0)
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFF334155))),
                            onPressed: () => setState(() => _currentStep--),
                            child: const Text('Back', style: TextStyle(color: Colors.white)),
                          )
                        else
                          const SizedBox.shrink(),

                        if (_currentStep < 4)
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                            onPressed: () => setState(() => _currentStep++),
                            child: const Text('Next Step'),
                          )
                        else
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                            icon: const Icon(Icons.auto_awesome),
                            label: const Text('Generate Paper (AI)', style: TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: generator.isGenerating
                                ? null
                                : () async {
                                    config.schoolName = _schoolNameController.text.trim();
                                    config.teacherName = _teacherNameController.text.trim();
                                    final nav = Navigator.of(context);
                                    final success = await generator.generatePaper();
                                    if (success && mounted) {
                                      nav.push(
                                        MaterialPageRoute(builder: (ctx) => const PreviewScreen()),
                                      );
                                    }
                                  },
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (generator.isGenerating)
              const GeneratingOverlay(statusText: 'Gemini 2.5 AI is generating your question paper...'),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent(PaperConfigModel config, GeneratorProvider generator) {
    switch (_currentStep) {
      case 0:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 1: Select Exam Type & Class', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const Text('Exam Type:', style: TextStyle(color: Color(0xFF94A3B8))),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _examTypes.map((exam) {
                final isSelected = config.examType == exam['id'];
                return ChoiceChip(
                  label: Text(exam['name']!),
                  selected: isSelected,
                  selectedColor: const Color(0xFF6366F1),
                  backgroundColor: const Color(0xFF1E293B),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8)),
                  onSelected: (val) {
                    setState(() {
                      config.examType = exam['id']!;
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            const Text('Class Standard:', style: TextStyle(color: Color(0xFF94A3B8))),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _classes.map((c) {
                final isSelected = config.classId == c;
                return ChoiceChip(
                  label: Text('Class $c'),
                  selected: isSelected,
                  selectedColor: const Color(0xFF6366F1),
                  backgroundColor: const Color(0xFF1E293B),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8)),
                  onSelected: (val) {
                    setState(() {
                      config.classId = c;
                    });
                  },
                );
              }).toList(),
            ),
          ],
        );

      case 1:
        final currentChapters = _chaptersMap[config.subject] ?? [];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 2: Select Subject & Chapters', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: config.subject,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Select Subject',
                labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: Color(0xFF1E293B),
                border: OutlineInputBorder(),
              ),
              items: _subjects.map((sub) {
                return DropdownMenuItem(value: sub['id'], child: Text(sub['name']!));
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    config.subject = val;
                    config.chapters = [];
                  });
                }
              },
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Chapters Included:', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () {
                    setState(() {
                      if (config.chapters.length == currentChapters.length) {
                        config.chapters = [];
                      } else {
                        config.chapters = List.from(currentChapters);
                      }
                    });
                  },
                  child: Text(config.chapters.length == currentChapters.length ? 'Deselect All' : 'Select All', style: const TextStyle(color: Color(0xFF818CF8))),
                ),
              ],
            ),
            ...currentChapters.map((ch) {
              final isChecked = config.chapters.contains(ch);
              return CheckboxListTile(
                title: Text(ch, style: const TextStyle(color: Colors.white, fontSize: 14)),
                value: isChecked,
                activeColor: const Color(0xFF6366F1),
                onChanged: (val) {
                  setState(() {
                    if (val == true) {
                      config.chapters.add(ch);
                    } else {
                      config.chapters.remove(ch);
                    }
                  });
                },
              );
            }),
          ],
        );

      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 3: Paper Metadata & Options', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: _schoolNameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'School / Institution Name (Optional)',
                labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: Color(0xFF1E293B),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _teacherNameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Teacher / Prepared By Name (Optional)',
                labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: Color(0xFF1E293B),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    initialValue: config.totalMarks.toString(),
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Total Marks',
                      labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Color(0xFF1E293B),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (val) {
                      config.totalMarks = int.tryParse(val) ?? 80;
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    initialValue: config.duration,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Duration (e.g. 3 Hours)',
                      labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Color(0xFF1E293B),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (val) => config.duration = val,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Paper Sets Variant Count:', style: TextStyle(color: Color(0xFF94A3B8))),
            Row(
              children: [1, 2, 3].map((sets) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text('$sets Set${sets > 1 ? 's' : ''}'),
                    selected: config.numberOfSets == sets,
                    selectedColor: const Color(0xFF6366F1),
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(color: config.numberOfSets == sets ? Colors.white : const Color(0xFF94A3B8)),
                    onSelected: (val) {
                      setState(() => config.numberOfSets = sets);
                    },
                  ),
                );
              }).toList(),
            ),
            SwitchListTile(
              title: const Text('Include General Instructions', style: TextStyle(color: Colors.white)),
              value: config.includeInstructions,
              activeTrackColor: const Color(0xFF6366F1),
              onChanged: (val) => setState(() => config.includeInstructions = val),
            ),
            SwitchListTile(
              title: const Text('Include Answer Key & Solutions', style: TextStyle(color: Colors.white)),
              value: config.includeAnswerKey,
              activeTrackColor: const Color(0xFF6366F1),
              onChanged: (val) => setState(() => config.includeAnswerKey = val),
            ),
          ],
        );

      case 3:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 4: Question Distribution & Difficulty', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildQuestionTypeRow('MCQs (1 Mark)', config.mcqCount, (val) => setState(() => config.mcqCount = val)),
            _buildQuestionTypeRow('Very Short (2 Marks)', config.vsaCount, (val) => setState(() => config.vsaCount = val)),
            _buildQuestionTypeRow('Short Answer (3 Marks)', config.saCount, (val) => setState(() => config.saCount = val)),
            _buildQuestionTypeRow('Case Study (4 Marks)', config.caseCount, (val) => setState(() => config.caseCount = val)),
            _buildQuestionTypeRow('Long Answer (5 Marks)', config.laCount, (val) => setState(() => config.laCount = val)),
            const SizedBox(height: 24),
            const Text('Difficulty Breakdown:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            Text('Easy: ${config.easyPercentage}% | Medium: ${config.mediumPercentage}% | Hard: ${config.hardPercentage}%', style: const TextStyle(color: Color(0xFF818CF8))),
            Slider(
              value: config.easyPercentage.toDouble(),
              min: 0,
              max: 100,
              activeColor: const Color(0xFF10B981),
              onChanged: (val) {
                setState(() {
                  config.easyPercentage = val.toInt();
                  config.mediumPercentage = 100 - config.easyPercentage - config.hardPercentage;
                  if (config.mediumPercentage < 0) config.mediumPercentage = 0;
                });
              },
            ),
          ],
        );

      case 4:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 5: Review & Confirmation', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Exam Type: ${config.examType.toUpperCase()}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('Class: Class ${config.classId} | Subject: ${config.subject}', style: const TextStyle(color: Color(0xFF94A3B8))),
                  const SizedBox(height: 4),
                  Text('Chapters: ${config.chapters.length} selected', style: const TextStyle(color: Color(0xFF94A3B8))),
                  const SizedBox(height: 4),
                  Text('Total Marks: ${config.totalMarks} | Duration: ${config.duration}', style: const TextStyle(color: Color(0xFF94A3B8))),
                  const SizedBox(height: 4),
                  Text('Variants: ${config.numberOfSets} Set(s)', style: const TextStyle(color: Color(0xFF94A3B8))),
                ],
              ),
            ),
          ],
        );

      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildQuestionTypeRow(String label, int currentCount, ValueChanged<int> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 14)),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF94A3B8)),
                onPressed: currentCount > 0 ? () => onChanged(currentCount - 1) : null,
              ),
              Text('$currentCount', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Color(0xFF818CF8)),
                onPressed: () => onChanged(currentCount + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
