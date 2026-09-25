import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/generator_provider.dart';
import '../models/paper_config_model.dart';
import '../../../core/data/subjects_data.dart';
import '../../../core/data/curriculum_data.dart';
import '../../../core/data/exam_types_data.dart';
import '../../preview/presentation/preview_screen.dart';
import '../../../shared/widgets/loading_overlay.dart';
import '../../auth/services/auth_provider.dart';
import '../../auth/presentation/auth_screen.dart';
import '../../../app/theme/theme_provider.dart';
import '../../../app/theme/app_colors.dart';

class GeneratorScreen extends StatefulWidget {
  const GeneratorScreen({super.key});

  @override
  State<GeneratorScreen> createState() => _GeneratorScreenState();
}

class _GeneratorScreenState extends State<GeneratorScreen> {
  int _currentStep = 0;

  final _schoolNameController = TextEditingController();
  final _teacherNameController = TextEditingController();
  final _instructionsController = TextEditingController();
  final _customSubjectController = TextEditingController();

  final List<Map<String, String>> _classes = [
    {'id': '9', 'label': 'Class 9', 'desc': 'Secondary School Curriculum'},
    {'id': '10', 'label': 'Class 10', 'desc': 'Board Exam Preparation'},
    {'id': '11', 'label': 'Class 11', 'desc': 'Senior Secondary Foundation'},
    {'id': '12', 'label': 'Class 12', 'desc': 'Senior Board Exam Standards'},
  ];

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<GeneratorProvider>(context, listen: false);
    _schoolNameController.text = provider.config.schoolName ?? '';
    _teacherNameController.text = provider.config.teacherName ?? '';
    _instructionsController.text = provider.config.options.instructionsText;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      provider.fetchUserUsage();
      _syncInitialChapters(provider.config);
    });
  }

  void _syncInitialChapters(PaperConfigModel config) {
    final cur = curriculumData[config.classId]?[config.subject];
    if (cur != null && config.selectedChapters.isEmpty) {
      config.selectedChapters = List.from(cur.chapters);
    }
  }

  @override
  void dispose() {
    _schoolNameController.dispose();
    _teacherNameController.dispose();
    _instructionsController.dispose();
    _customSubjectController.dispose();
    super.dispose();
  }

  bool _isSubjectHindi(String subject) {
    return subject == 'hindi' ||
        subject == 'hindi_core' ||
        subject == 'hindi_elective' ||
        subject.contains('हिन्दी');
  }

  @override
  Widget build(BuildContext context) {
    final generator = Provider.of<GeneratorProvider>(context);
    final config = generator.config;

    final stepTitles = [
      'Target Class',
      'Select Subject',
      'Assessment Type',
      'Exam Config',
      'Syllabus Chapters',
      'Question Blueprint',
      'Header & Options',
    ];

    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;
    final bg = AppColors.getBackground(isDark);
    final cardBg = AppColors.getSurface(isDark);
    final elevatedBg = AppColors.getSurfaceElevated(isDark);
    final borderColor = AppColors.getBorder(isDark);
    final textColor = AppColors.getTextPrimary(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    return PopScope(
      canPop: _currentStep == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _currentStep > 0) {
          setState(() => _currentStep--);
        }
      },
      child: Scaffold(
        backgroundColor: bg,
        appBar: AppBar(
          backgroundColor: cardBg,
          elevation: 0,
          iconTheme: IconThemeData(color: textColor),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Paper Generator Wizard',
                  style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
              Text('Step ${_currentStep + 1} of 7: ${stepTitles[_currentStep]}',
                  style: TextStyle(color: subtextColor, fontSize: 12)),
            ],
          ),
          actions: [
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: elevatedBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor),
              ),
              child: Row(
                children: [
                  Icon(Icons.bolt, color: textColor, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${generator.papersGeneratedToday}/${generator.dailyLimit}',
                    style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
        body: Stack(
          children: [
            SafeArea(
              child: Column(
                children: [
                  // Progress Indicator Bar
                  LinearProgressIndicator(
                    value: (_currentStep + 1) / 7,
                    backgroundColor: elevatedBg,
                    valueColor: AlwaysStoppedAnimation<Color>(isDark ? Colors.white : Colors.black),
                    minHeight: 4,
                  ),

                  if (!Provider.of<AuthProvider>(context).isAuthenticated)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.lock_outline, color: Colors.black, size: 20),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text(
                              'Sign in to generate CBSE question papers.',
                              style: TextStyle(color: Colors.black, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.black,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              elevation: 0,
                            ),
                            onPressed: () {
                              Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                            },
                            child: const Text('Sign In', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),

                  // Step Content ScrollView
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: _buildStepContent(config, generator),
                    ),
                  ),

                  // Bottom Navigation Controls
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      border: Border(top: BorderSide(color: borderColor)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (_currentStep > 0)
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: borderColor),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            icon: Icon(Icons.arrow_back, size: 16, color: textColor),
                            label: Text('Back', style: TextStyle(color: textColor)),
                            onPressed: () => setState(() => _currentStep--),
                          )
                        else
                          const SizedBox.shrink(),

                        if (_currentStep < 6)
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isDark ? Colors.white : Colors.black,
                              foregroundColor: isDark ? Colors.black : Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            icon: const Icon(Icons.arrow_forward, size: 16),
                            label: const Text('Next Step', style: TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: () {
                              _handleNextStep(config, generator);
                            },
                          )
                        else
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            icon: const Icon(Icons.auto_awesome, size: 18),
                            label: const Text('Generate Paper (AI)',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            onPressed: generator.isGenerating ? null : () => _executeGeneration(config, generator),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (generator.isGenerating)
              const GeneratingOverlay(
                statusText: 'We are creating your paper with our AI, We Appreciate your Patience teacher !',
              ),
          ],
        ),
      ),
    );
  }

  void _handleNextStep(PaperConfigModel config, GeneratorProvider generator) {
    if (_currentStep == 0) {
      // Refresh subject if not in current class
      final subs = classSubjects[config.classId] ?? [];
      if (!subs.any((s) => s.id == config.subject)) {
        config.subject = subs.isNotEmpty ? subs.first.id : 'maths';
      }
      _syncInitialChapters(config);
    } else if (_currentStep == 1) {
      if (_isSubjectHindi(config.subject) && config.language != 'Hindi') {
        config.language = 'Hindi';
      }
      _syncInitialChapters(config);
    } else if (_currentStep == 5) {
      // Validate marks on question distribution step
      final currentMarks = config.questionDistribution.totalMarks;
      if (currentMarks != config.totalMarks) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFF59E0B),
            content: Text(
              'Notice: Total question marks ($currentMarks M) do not match configured exam marks (${config.totalMarks} M). Use Auto-Balance or adjust counts.',
            ),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
    setState(() => _currentStep++);
  }

  Future<void> _executeGeneration(PaperConfigModel config, GeneratorProvider generator) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.white,
          duration: Duration(seconds: 3),
          content: Text(
            'Please sign in or create an account to generate question papers.',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
          ),
        ),
      );
      Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
      return;
    }

    config.options.schoolName = _schoolNameController.text.trim();
    config.options.includeSchoolName = config.options.schoolName.isNotEmpty;
    config.options.teacherName = _teacherNameController.text.trim();
    config.options.includeTeacherName = config.options.teacherName.isNotEmpty;
    config.options.instructionsText = _instructionsController.text.trim();

    final nav = Navigator.of(context);
    final success = await generator.generatePaper();
    if (success && mounted) {
      nav.push(
        MaterialPageRoute(builder: (ctx) => const PreviewScreen()),
      );
    } else if (!success && mounted && generator.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text(generator.errorMessage!),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  Widget _buildStepContent(PaperConfigModel config, GeneratorProvider generator) {
    switch (_currentStep) {
      case 0:
        return _buildStep1Class(config);
      case 1:
        return _buildStep2Subject(config);
      case 2:
        return _buildStep3ExamType(config);
      case 3:
        return _buildStep4Config(config);
      case 4:
        return _buildStep5Chapters(config);
      case 5:
        return _buildStep6QuestionDistribution(config);
      case 6:
        return _buildStep7HeaderOptions(config);
      default:
        return const SizedBox.shrink();
    }
  }

  // STEP 1: CLASS SELECTION
  Widget _buildStep1Class(PaperConfigModel config) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Target Standard',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Choose the CBSE educational class standard for the question paper.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
        const SizedBox(height: 20),
        ..._classes.map((cls) {
          final isSelected = config.classId == cls['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () {
                setState(() {
                  config.classId = cls['id']!;
                  final subs = classSubjects[config.classId] ?? [];
                  if (!subs.any((s) => s.id == config.subject)) {
                    config.subject = subs.isNotEmpty ? subs.first.id : 'maths';
                  }
                  _syncInitialChapters(config);
                });
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF141414),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? Colors.white : const Color(0xFF262626),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.white : const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          cls['id']!,
                          style: TextStyle(
                            color: isSelected ? Colors.black : Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(cls['label']!,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 2),
                          Text(cls['desc']!,
                              style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 12)),
                        ],
                      ),
                    ),
                    Icon(
                      isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: isSelected ? Colors.white : const Color(0xFF737373),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  // STEP 2: SUBJECT SELECTION
  Widget _buildStep2Subject(PaperConfigModel config) {
    final subjects = classSubjects[config.classId] ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Select Subject',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            Chip(
              backgroundColor: const Color(0xFF1E1E1E),
              side: const BorderSide(color: Color(0xFF262626)),
              label: Text('Class ${config.classId}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text('Choose from official CBSE subjects mapped for this class standard.',
            style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 13)),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: subjects.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.25,
          ),
          itemBuilder: (ctx, idx) {
            final subj = subjects[idx];
            final isSelected = config.subject == subj.id;
            return InkWell(
              onTap: () {
                setState(() {
                  config.subject = subj.id;
                  if (_isSubjectHindi(subj.id)) {
                    config.language = 'Hindi';
                  }
                  _syncInitialChapters(config);
                });
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF141414),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? Colors.white : const Color(0xFF262626),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E1E1E),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(subj.icon, color: Colors.white, size: 20),
                        ),
                        if (isSelected)
                          const Icon(Icons.check_circle, color: Colors.white, size: 18),
                      ],
                    ),
                    Text(
                      subj.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // STEP 3: EXAM TYPE
  Widget _buildStep3ExamType(PaperConfigModel config) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Assessment Type',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Select the layout standard of the examination sheet you wish to generate.',
            style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 13)),
        const SizedBox(height: 16),
        ...examTypesList.map((exam) {
          final isSelected = config.examType == exam.id;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            child: InkWell(
              onTap: () {
                setState(() {
                  config.examType = exam.id;
                  config.autoBalanceForMarks(exam.defaultMarks);
                  config.duration = exam.defaultDuration;
                });
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF141414),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? Colors.white : const Color(0xFF262626),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(exam.icon, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(exam.name,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 2),
                          Text(exam.description,
                              style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 11)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E1E1E),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF262626)),
                                ),
                                child: Text('${exam.defaultMarks} Marks',
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E1E1E),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF262626)),
                                ),
                                child: Text(exam.defaultDuration,
                                    style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: isSelected ? Colors.white : const Color(0xFF737373),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  // STEP 4: CONFIGURATION (DIFFICULTY, LANGUAGE, MARKS, DURATION)
  Widget _buildStep4Config(PaperConfigModel config) {
    final difficulties = ['Easy', 'Medium', 'Hard'];
    final languages = ['English', 'Hindi', 'Bilingual'];
    final marksList = [20, 25, 30, 40, 50, 70, 80, 100];
    final durations = ['45 Minutes', '1 Hour', '1.5 Hours', '2 Hours', '3 Hours'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Exam Parameters',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Configure the difficulty scale, language, marks, and allowed duration.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
        const SizedBox(height: 20),

        // Difficulty Level
        const Text('1. Target Difficulty Level:',
            style: TextStyle(color: Color(0xFFE5E5E5), fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: difficulties.map((diff) {
            final isSelected = config.difficulty == diff;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Center(child: Text(diff)),
                  selected: isSelected,
                  selectedColor: Colors.white,
                  backgroundColor: const Color(0xFF1E1E1E),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  onSelected: (_) => setState(() => config.difficulty = diff),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 20),

        // Language Medium
        const Text('2. Paper Language Medium:',
            style: TextStyle(color: Color(0xFFE5E5E5), fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: languages.map((lang) {
            final isSelected = config.language == lang;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Center(child: Text(lang)),
                  selected: isSelected,
                  selectedColor: Colors.white,
                  backgroundColor: const Color(0xFF1E1E1E),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  onSelected: (_) => setState(() => config.language = lang),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 20),

        // Total Marks
        const Text('3. Total Marks:',
            style: TextStyle(color: Color(0xFFE5E5E5), fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: marksList.map((m) {
            final isSelected = config.totalMarks == m;
            return ChoiceChip(
              label: Text('$m Marks'),
              selected: isSelected,
              selectedColor: Colors.white,
              backgroundColor: const Color(0xFF1E1E1E),
              labelStyle: TextStyle(
                color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              onSelected: (_) {
                setState(() {
                  config.autoBalanceForMarks(m);
                });
              },
            );
          }).toList(),
        ),

        const SizedBox(height: 20),

        // Duration Allowed
        const Text('4. Time Allowed:',
            style: TextStyle(color: Color(0xFFE5E5E5), fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: durations.map((d) {
            final isSelected = config.duration == d;
            return ChoiceChip(
              label: Text(d),
              selected: isSelected,
              selectedColor: Colors.white,
              backgroundColor: const Color(0xFF1E1E1E),
              labelStyle: TextStyle(
                color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              onSelected: (_) => setState(() => config.duration = d),
            );
          }).toList(),
        ),
      ],
    );
  }

  // STEP 5: CHAPTERS SELECTION
  Widget _buildStep5Chapters(PaperConfigModel config) {
    final cur = curriculumData[config.classId]?[config.subject];
    final chapters = cur?.chapters ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Syllabus Chapters',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            TextButton.icon(
              icon: Icon(
                config.selectedChapters.length == chapters.length ? Icons.deselect : Icons.select_all,
                size: 16,
                color: Colors.white,
              ),
              label: Text(
                config.selectedChapters.length == chapters.length ? 'Deselect All' : 'Select All',
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
              onPressed: () {
                setState(() {
                  if (config.selectedChapters.length == chapters.length) {
                    config.selectedChapters.clear();
                  } else {
                    config.selectedChapters = List.from(chapters);
                  }
                });
              },
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Selected ${config.selectedChapters.length} of ${chapters.length} Chapters for Class ${config.classId}',
          style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 13),
        ),
        const SizedBox(height: 16),
        if (chapters.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF141414),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              'No hardcoded chapters for this subject. All topics from curriculum will be covered by default.',
              style: TextStyle(color: Color(0xFF737373)),
            ),
          )
        else
          ...chapters.map((chap) {
            final isSelected = config.selectedChapters.contains(chap);
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              child: CheckboxListTile(
                value: isSelected,
                tileColor: const Color(0xFF141414),
                activeColor: Colors.white,
                checkColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(
                    color: isSelected ? Colors.white : const Color(0xFF262626),
                  ),
                ),
                title: Text(chap, style: const TextStyle(color: Colors.white, fontSize: 14)),
                onChanged: (val) {
                  setState(() {
                    if (val == true) {
                      config.selectedChapters.add(chap);
                    } else {
                      config.selectedChapters.remove(chap);
                    }
                  });
                },
              ),
            );
          }),
      ],
    );
  }

  // STEP 6: QUESTION DISTRIBUTION WITH AUTO-BALANCE
  Widget _buildStep6QuestionDistribution(PaperConfigModel config) {
    final dist = config.questionDistribution;
    final currentMarks = dist.totalMarks;
    final targetMarks = config.totalMarks;
    final isBalanced = currentMarks == targetMarks;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Question Blueprint',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              icon: const Icon(Icons.auto_fix_high, size: 16),
              label: const Text('Auto-Balance', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              onPressed: () {
                setState(() {
                  config.autoBalanceForMarks(config.totalMarks);
                });
              },
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text('Configure question breakdown by type. Marks must match total exam marks.',
            style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 13)),
        const SizedBox(height: 16),

        // Marks Status Banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF141414),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isBalanced ? Colors.white : const Color(0xFF737373),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    isBalanced ? Icons.check_circle : Icons.warning_amber_rounded,
                    color: isBalanced ? Colors.white : const Color(0xFFA3A3A3),
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    isBalanced
                        ? 'Balanced: $currentMarks / $targetMarks Marks'
                        : currentMarks < targetMarks
                            ? 'Missing ${targetMarks - currentMarks} Marks ($currentMarks / $targetMarks)'
                            : 'Over by ${currentMarks - targetMarks} Marks ($currentMarks / $targetMarks)',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              Text(
                '${dist.totalQuestions} Questions',
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        _buildQuestionCounter(
          title: 'Multiple Choice (MCQ)',
          marksEach: 1,
          count: dist.mcq,
          onChanged: (val) => setState(() => dist.mcq = val),
        ),
        _buildQuestionCounter(
          title: 'Assertion & Reason',
          marksEach: 1,
          count: dist.assertionReason,
          onChanged: (val) => setState(() => dist.assertionReason = val),
        ),
        _buildQuestionCounter(
          title: 'Very Short Answer (VSA)',
          marksEach: 2,
          count: dist.vsa,
          onChanged: (val) => setState(() => dist.vsa = val),
        ),
        _buildQuestionCounter(
          title: 'Short Answer (SA)',
          marksEach: 3,
          count: dist.sa,
          onChanged: (val) => setState(() => dist.sa = val),
        ),
        _buildQuestionCounter(
          title: 'Case Study / Passage',
          marksEach: 4,
          count: dist.caseStudy,
          onChanged: (val) => setState(() => dist.caseStudy = val),
        ),
        _buildQuestionCounter(
          title: 'Long Answer (LA)',
          marksEach: 5,
          count: dist.la,
          onChanged: (val) => setState(() => dist.la = val),
        ),
      ],
    );
  }

  Widget _buildQuestionCounter({
    required String title,
    required int marksEach,
    required int count,
    required Function(int) onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF262626)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 2),
              Text('$marksEach Mark${marksEach > 1 ? "s" : ""} each • Subtotal: ${count * marksEach} Marks',
                  style: const TextStyle(color: Color(0xFFA3A3A3), fontSize: 12)),
            ],
          ),
          Row(
            children: [
              IconButton(
                style: IconButton.styleFrom(backgroundColor: const Color(0xFF1E1E1E)),
                icon: const Icon(Icons.remove, size: 18, color: Colors.white),
                onPressed: count > 0 ? () => onChanged(count - 1) : null,
              ),
              Container(
                constraints: const BoxConstraints(minWidth: 32),
                alignment: Alignment.center,
                child: Text('$count',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              IconButton(
                style: IconButton.styleFrom(backgroundColor: const Color(0xFF1E1E1E)),
                icon: const Icon(Icons.add, size: 18, color: Colors.white),
                onPressed: () => onChanged(count + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // STEP 7: HEADER & OPTIONS
  Widget _buildStep7HeaderOptions(PaperConfigModel config) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Header & Print Options',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Customize paper header branding, instructions, and multi-set generation.',
            style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 13)),
        const SizedBox(height: 20),

        // School Name
        TextField(
          controller: _schoolNameController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'School / Coaching Institute Name (Optional)',
            labelStyle: const TextStyle(color: Color(0xFFA3A3A3)),
            filled: true,
            fillColor: const Color(0xFF141414),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF262626)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF262626)),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Teacher Name
        TextField(
          controller: _teacherNameController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Prepared By / Teacher Name (Optional)',
            labelStyle: const TextStyle(color: Color(0xFFA3A3A3)),
            filled: true,
            fillColor: const Color(0xFF141414),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF262626)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF262626)),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Multi-set generation selector
        const Text('Number of Sets to Generate:',
            style: TextStyle(color: Color(0xFFE5E5E5), fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: [1, 2, 3].map((sets) {
            final isSelected = config.numberOfSets == sets;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Center(child: Text(sets == 1 ? '1 Set' : '$sets Sets')),
                  selected: isSelected,
                  selectedColor: Colors.white,
                  backgroundColor: const Color(0xFF1E1E1E),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : const Color(0xFFA3A3A3),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  onSelected: (_) => setState(() => config.numberOfSets = sets),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 20),

        // Toggles
        SwitchListTile(
          value: config.options.includeAnswerKey,
          tileColor: const Color(0xFF141414),
          activeTrackColor: Colors.white,
          activeThumbColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: const BorderSide(color: Color(0xFF262626)),
          ),
          title: const Text('Include Complete Solutions / Answer Key', style: TextStyle(color: Colors.white, fontSize: 14)),
          onChanged: (val) => setState(() => config.options.includeAnswerKey = val),
        ),

        const SizedBox(height: 10),

        SwitchListTile(
          value: config.options.includeInstructions,
          tileColor: const Color(0xFF141414),
          activeTrackColor: Colors.white,
          activeThumbColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: const BorderSide(color: Color(0xFF262626)),
          ),
          title: const Text('Include General Instructions Header', style: TextStyle(color: Colors.white, fontSize: 14)),
          onChanged: (val) => setState(() => config.options.includeInstructions = val),
        ),

        if (config.options.includeInstructions) ...[
          const SizedBox(height: 12),
          TextField(
            controller: _instructionsController,
            maxLines: 4,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              labelText: 'General Instructions Text',
              labelStyle: const TextStyle(color: Color(0xFFA3A3A3)),
              filled: true,
              fillColor: const Color(0xFF141414),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF262626)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF262626)),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
