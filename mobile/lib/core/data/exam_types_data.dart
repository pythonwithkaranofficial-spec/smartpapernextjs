import 'package:flutter/material.dart';

class ExamTypeItem {
  final String id;
  final String name;
  final String description;
  final int defaultMarks;
  final String defaultDuration;
  final IconData icon;
  final Color color;

  const ExamTypeItem({
    required this.id,
    required this.name,
    required this.description,
    required this.defaultMarks,
    required this.defaultDuration,
    required this.icon,
    required this.color,
  });
}

const List<ExamTypeItem> examTypesList = [
  ExamTypeItem(
    id: 'class_test',
    name: 'Class Test',
    description: 'Quick formative assessment for classrooms.',
    defaultMarks: 20,
    defaultDuration: '45 Minutes',
    icon: Icons.description_outlined,
    color: Color(0xFF6366F1),
  ),
  ExamTypeItem(
    id: 'periodic_test',
    name: 'Periodic Test',
    description: 'Scheduled test for measuring chapter-wise progress.',
    defaultMarks: 40,
    defaultDuration: '1.5 Hours',
    icon: Icons.alarm_outlined,
    color: Color(0xFF10B981),
  ),
  ExamTypeItem(
    id: 'unit_test',
    name: 'Unit Test',
    description: 'Standard school test conducted after a unit is completed.',
    defaultMarks: 30,
    defaultDuration: '1 Hour',
    icon: Icons.bookmark_outline,
    color: Color(0xFFEC4899),
  ),
  ExamTypeItem(
    id: 'half_yearly',
    name: 'Half Yearly',
    description: 'Summative assessment covering half of the curriculum.',
    defaultMarks: 80,
    defaultDuration: '3 Hours',
    icon: Icons.layers_outlined,
    color: Color(0xFFF59E0B),
  ),
  ExamTypeItem(
    id: 'annual_exam',
    name: 'Annual Exam',
    description: 'Final school exam covering the entire year\'s curriculum.',
    defaultMarks: 80,
    defaultDuration: '3 Hours',
    icon: Icons.school_outlined,
    color: Color(0xFF06B6D4),
  ),
  ExamTypeItem(
    id: 'pre_board',
    name: 'Pre-Board',
    description: 'Preparatory board exam strictly aligning with CBSE guidelines.',
    defaultMarks: 80,
    defaultDuration: '3 Hours',
    icon: Icons.emoji_events_outlined,
    color: Color(0xFFEF4444),
  ),
  ExamTypeItem(
    id: 'revision_test',
    name: 'Revision Test',
    description: 'Mock test to check revision of specific modules.',
    defaultMarks: 25,
    defaultDuration: '1 Hour',
    icon: Icons.replay_outlined,
    color: Color(0xFFD946EF),
  ),
  ExamTypeItem(
    id: 'practice_paper',
    name: 'Practice Paper',
    description: 'Curated questions for self-study and student practice.',
    defaultMarks: 50,
    defaultDuration: '2 Hours',
    icon: Icons.edit_note_outlined,
    color: Color(0xFF38BDF8),
  ),
  ExamTypeItem(
    id: 'sample_paper',
    name: 'Sample Paper',
    description: 'Complete model question paper following CBSE layout.',
    defaultMarks: 80,
    defaultDuration: '3 Hours',
    icon: Icons.auto_awesome_outlined,
    color: Color(0xFF8B5CF6),
  ),
  ExamTypeItem(
    id: 'custom_test',
    name: 'Custom Test',
    description: 'Fully customizable parameters, marks, and layout.',
    defaultMarks: 50,
    defaultDuration: '2 Hours',
    icon: Icons.tune_outlined,
    color: Color(0xFF64748B),
  ),
];
