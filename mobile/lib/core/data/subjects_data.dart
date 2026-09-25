import 'package:flutter/material.dart';

class SubjectItem {
  final String id;
  final String name;
  final IconData icon;
  final Color color;
  final String description;

  const SubjectItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    this.description = 'Standard Board Curriculum',
  });
}

const Map<String, List<SubjectItem>> classSubjects = {
  '9': [
    SubjectItem(id: 'maths', name: 'Mathematics', icon: Icons.calculate_outlined, color: Color(0xFF3B82F6)),
    SubjectItem(id: 'science', name: 'Science', icon: Icons.science_outlined, color: Color(0xFF10B981)),
    SubjectItem(id: 'english', name: 'English', icon: Icons.menu_book_outlined, color: Color(0xFFF59E0B)),
    SubjectItem(id: 'social', name: 'Social Science', icon: Icons.public, color: Color(0xFFA855F7)),
    SubjectItem(id: 'hindi', name: 'हिन्दी', icon: Icons.translate, color: Color(0xFFEF4444)),
    SubjectItem(id: 'it', name: 'Information Technology (402)', icon: Icons.laptop_mac, color: Color(0xFF06B6D4)),
    SubjectItem(id: 'ai', name: 'Artificial Intelligence (417)', icon: Icons.memory, color: Color(0xFF8B5CF6)),
  ],
  '10': [
    SubjectItem(id: 'maths', name: 'Mathematics', icon: Icons.calculate_outlined, color: Color(0xFF3B82F6)),
    SubjectItem(id: 'science', name: 'Science', icon: Icons.science_outlined, color: Color(0xFF10B981)),
    SubjectItem(id: 'english', name: 'English', icon: Icons.menu_book_outlined, color: Color(0xFFF59E0B)),
    SubjectItem(id: 'social', name: 'Social Science', icon: Icons.public, color: Color(0xFFA855F7)),
    SubjectItem(id: 'hindi', name: 'हिन्दी', icon: Icons.translate, color: Color(0xFFEF4444)),
    SubjectItem(id: 'it', name: 'Information Technology (402)', icon: Icons.laptop_mac, color: Color(0xFF06B6D4)),
    SubjectItem(id: 'ai', name: 'Artificial Intelligence (417)', icon: Icons.memory, color: Color(0xFF8B5CF6)),
  ],
  '11': [
    SubjectItem(id: 'physics', name: 'Physics', icon: Icons.bubble_chart_outlined, color: Color(0xFF06B6D4)),
    SubjectItem(id: 'chemistry', name: 'Chemistry', icon: Icons.biotech_outlined, color: Color(0xFF10B981)),
    SubjectItem(id: 'biology', name: 'Biology', icon: Icons.health_and_safety_outlined, color: Color(0xFFEC4899)),
    SubjectItem(id: 'maths', name: 'Mathematics', icon: Icons.calculate_outlined, color: Color(0xFF6366F1)),
    SubjectItem(id: 'cs', name: 'Computer Science (083)', icon: Icons.code, color: Color(0xFFD946EF)),
    SubjectItem(id: 'ip', name: 'Informatics Practices (065)', icon: Icons.storage, color: Color(0xFF14B8A6)),
    SubjectItem(id: 'english', name: 'English Core', icon: Icons.menu_book_outlined, color: Color(0xFFF59E0B)),
    SubjectItem(id: 'hindi_core', name: 'हिन्दी कोर', icon: Icons.translate, color: Color(0xFFEF4444)),
    SubjectItem(id: 'hindi_elective', name: 'हिन्दी ऐच्छिक', icon: Icons.translate, color: Color(0xFFF97316)),
    SubjectItem(id: 'business', name: 'Business Studies', icon: Icons.business_center_outlined, color: Color(0xFF8B5CF6)),
    SubjectItem(id: 'accounts', name: 'Accountancy', icon: Icons.trending_up, color: Color(0xFF10B981)),
    SubjectItem(id: 'economics', name: 'Economics', icon: Icons.attach_money, color: Color(0xFFF59E0B)),
    SubjectItem(id: 'history', name: 'History', icon: Icons.explore_outlined, color: Color(0xFFD97706)),
    SubjectItem(id: 'geography', name: 'Geography', icon: Icons.map_outlined, color: Color(0xFF059669)),
    SubjectItem(id: 'polscience', name: 'Political Science', icon: Icons.balance, color: Color(0xFF4F46E5)),
    SubjectItem(id: 'phyedu', name: 'Physical Education', icon: Icons.fitness_center, color: Color(0xFFF43F5E)),
    SubjectItem(id: 'finearts', name: 'Fine Arts', icon: Icons.palette_outlined, color: Color(0xFFEC4899)),
  ],
  '12': [
    SubjectItem(id: 'physics', name: 'Physics', icon: Icons.bubble_chart_outlined, color: Color(0xFF06B6D4)),
    SubjectItem(id: 'chemistry', name: 'Chemistry', icon: Icons.biotech_outlined, color: Color(0xFF10B981)),
    SubjectItem(id: 'biology', name: 'Biology', icon: Icons.health_and_safety_outlined, color: Color(0xFFEC4899)),
    SubjectItem(id: 'maths', name: 'Mathematics', icon: Icons.calculate_outlined, color: Color(0xFF6366F1)),
    SubjectItem(id: 'cs', name: 'Computer Science (083)', icon: Icons.code, color: Color(0xFFD946EF)),
    SubjectItem(id: 'ip', name: 'Informatics Practices (065)', icon: Icons.storage, color: Color(0xFF14B8A6)),
    SubjectItem(id: 'english', name: 'English Core', icon: Icons.menu_book_outlined, color: Color(0xFFF59E0B)),
    SubjectItem(id: 'hindi_core', name: 'हिन्दी कोर', icon: Icons.translate, color: Color(0xFFEF4444)),
    SubjectItem(id: 'hindi_elective', name: 'हिन्दी ऐच्छिक', icon: Icons.translate, color: Color(0xFFF97316)),
    SubjectItem(id: 'business', name: 'Business Studies', icon: Icons.business_center_outlined, color: Color(0xFF8B5CF6)),
    SubjectItem(id: 'accounts', name: 'Accountancy', icon: Icons.trending_up, color: Color(0xFF10B981)),
    SubjectItem(id: 'economics', name: 'Economics', icon: Icons.attach_money, color: Color(0xFFF59E0B)),
    SubjectItem(id: 'history', name: 'History', icon: Icons.explore_outlined, color: Color(0xFFD97706)),
    SubjectItem(id: 'geography', name: 'Geography', icon: Icons.map_outlined, color: Color(0xFF059669)),
    SubjectItem(id: 'polscience', name: 'Political Science', icon: Icons.balance, color: Color(0xFF4F46E5)),
    SubjectItem(id: 'phyedu', name: 'Physical Education', icon: Icons.fitness_center, color: Color(0xFFF43F5E)),
    SubjectItem(id: 'finearts', name: 'Fine Arts', icon: Icons.palette_outlined, color: Color(0xFFEC4899)),
  ],
};
