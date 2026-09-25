import 'package:flutter_test/flutter_test.dart';
import 'package:smart_paper_generator/features/generator/models/paper_config_model.dart';

void main() {
  group('PaperConfigModel Tests', () {
    test('toJson matches Next.js paperConfigSchema expectations', () {
      final config = PaperConfigModel(
        classId: '10',
        subject: 'maths',
        examType: 'periodic_test',
        difficulty: 'Medium',
        language: 'English',
        totalMarks: 40,
        duration: '1.5 Hours',
      );

      config.autoBalanceForMarks(40);
      final json = config.toJson();

      expect(json['classId'], '10');
      expect(json['subject'], 'maths');
      expect(json['examType'], 'periodic_test');
      expect(json['difficulty'], 'Medium');
      expect(json['language'], 'English');
      expect(json['totalMarks'], 40);
      expect(json['duration'], '1.5 Hours');

      // Check questionDistribution schema
      final dist = json['questionDistribution'] as Map<String, dynamic>;
      expect(dist.containsKey('mcq'), true);
      expect(dist.containsKey('assertionReason'), true);
      expect(dist.containsKey('vsa'), true);
      expect(dist.containsKey('sa'), true);
      expect(dist.containsKey('caseStudy'), true);
      expect(dist.containsKey('la'), true);
      expect(config.questionDistribution.totalMarks, 40);

      // Check options schema
      final options = json['options'] as Map<String, dynamic>;
      expect(options.containsKey('includeSchoolName'), true);
      expect(options.containsKey('includeInstructions'), true);
      expect(options.containsKey('includeAnswerKey'), true);
      expect(options.containsKey('numberOfSets'), true);
      expect(options['numberOfSets'], 1);
    });

    test('autoBalanceForMarks calculates correct total marks for standards', () {
      final config = PaperConfigModel();

      config.autoBalanceForMarks(20);
      expect(config.questionDistribution.totalMarks, 20);

      config.autoBalanceForMarks(25);
      expect(config.questionDistribution.totalMarks, 25);

      config.autoBalanceForMarks(30);
      expect(config.questionDistribution.totalMarks, 30);

      config.autoBalanceForMarks(40);
      expect(config.questionDistribution.totalMarks, 40);

      config.autoBalanceForMarks(50);
      expect(config.questionDistribution.totalMarks, 50);

      config.autoBalanceForMarks(70);
      expect(config.questionDistribution.totalMarks, 70);

      config.autoBalanceForMarks(80);
      expect(config.questionDistribution.totalMarks, 80);
    });
  });
}
