class QuestionDistribution {
  int mcq;
  int assertionReason;
  int vsa;
  int sa;
  int caseStudy;
  int la;

  QuestionDistribution({
    this.mcq = 10,
    this.assertionReason = 2,
    this.vsa = 4,
    this.sa = 4,
    this.caseStudy = 2,
    this.la = 0,
  });

  int get totalMarks =>
      (mcq * 1) +
      (assertionReason * 1) +
      (vsa * 2) +
      (sa * 3) +
      (caseStudy * 4) +
      (la * 5);

  int get totalQuestions => mcq + assertionReason + vsa + sa + caseStudy + la;

  Map<String, dynamic> toJson() => {
        'mcq': mcq,
        'assertionReason': assertionReason,
        'vsa': vsa,
        'sa': sa,
        'caseStudy': caseStudy,
        'la': la,
      };

  factory QuestionDistribution.fromJson(Map<String, dynamic> json) =>
      QuestionDistribution(
        mcq: json['mcq'] ?? 0,
        assertionReason: json['assertionReason'] ?? 0,
        vsa: json['vsa'] ?? 0,
        sa: json['sa'] ?? 0,
        caseStudy: json['caseStudy'] ?? 0,
        la: json['la'] ?? 0,
      );
}

class PaperOptionsModel {
  bool includeSchoolName;
  String schoolName;
  bool includeTeacherName;
  String teacherName;
  bool includeSchoolLogo;
  bool includeClass;
  bool includeSubject;
  bool includeTime;
  bool includeMaxMarks;
  bool includeInstructions;
  String instructionsText;
  bool includeInternalChoice;
  bool includeAnswerKey;
  int numberOfSets;

  PaperOptionsModel({
    this.includeSchoolName = false,
    this.schoolName = '',
    this.includeTeacherName = false,
    this.teacherName = '',
    this.includeSchoolLogo = false,
    this.includeClass = true,
    this.includeSubject = true,
    this.includeTime = true,
    this.includeMaxMarks = true,
    this.includeInstructions = true,
    this.instructionsText =
        '1. All questions are compulsory.\n2. The question paper consists of standard sections.\n3. Section A contains 1 mark questions, Section B contains 2 marks questions.\n4. Write answers clearly and support with diagrams where needed.',
    this.includeInternalChoice = false,
    this.includeAnswerKey = true,
    this.numberOfSets = 1,
  });

  Map<String, dynamic> toJson() => {
        'includeSchoolName': includeSchoolName,
        'schoolName': schoolName,
        'includeTeacherName': includeTeacherName,
        'teacherName': teacherName,
        'includeSchoolLogo': includeSchoolLogo,
        'includeClass': includeClass,
        'includeSubject': includeSubject,
        'includeTime': includeTime,
        'includeMaxMarks': includeMaxMarks,
        'includeInstructions': includeInstructions,
        'instructionsText': instructionsText,
        'includeInternalChoice': includeInternalChoice,
        'includeAnswerKey': includeAnswerKey,
        'numberOfSets': numberOfSets,
      };

  factory PaperOptionsModel.fromJson(Map<String, dynamic> json) =>
      PaperOptionsModel(
        includeSchoolName: json['includeSchoolName'] ?? false,
        schoolName: json['schoolName'] ?? '',
        includeTeacherName: json['includeTeacherName'] ?? false,
        teacherName: json['teacherName'] ?? '',
        includeSchoolLogo: json['includeSchoolLogo'] ?? false,
        includeClass: json['includeClass'] ?? true,
        includeSubject: json['includeSubject'] ?? true,
        includeTime: json['includeTime'] ?? true,
        includeMaxMarks: json['includeMaxMarks'] ?? true,
        includeInstructions: json['includeInstructions'] ?? true,
        instructionsText: json['instructionsText'] ?? '',
        includeInternalChoice: json['includeInternalChoice'] ?? false,
        includeAnswerKey: json['includeAnswerKey'] ?? true,
        numberOfSets: json['numberOfSets'] ?? 1,
      );
}

class PaperConfigModel {
  String classId;
  String subject;
  String examType;
  String difficulty; // "Easy" | "Medium" | "Hard"
  String language; // "English" | "Hindi" | "Bilingual"
  int totalMarks;
  String duration;
  QuestionDistribution questionDistribution;
  PaperOptionsModel options;
  List<String> selectedChapters;
  bool isCustom;
  String? customClass;
  String? customSubject;
  String? customChapters;

  PaperConfigModel({
    this.classId = '10',
    this.subject = 'maths',
    this.examType = 'periodic_test',
    this.difficulty = 'Medium',
    this.language = 'English',
    this.totalMarks = 40,
    this.duration = '1.5 Hours',
    QuestionDistribution? questionDistribution,
    PaperOptionsModel? options,
    List<String>? selectedChapters,
    this.isCustom = false,
    this.customClass,
    this.customSubject,
    this.customChapters,
  })  : questionDistribution = questionDistribution ?? QuestionDistribution(),
        options = options ?? PaperOptionsModel(),
        selectedChapters = selectedChapters ?? [];

  // Convenience getters/setters for legacy UI bindings
  String? get schoolName => options.schoolName;
  set schoolName(String? val) {
    options.schoolName = val ?? '';
    options.includeSchoolName = val != null && val.trim().isNotEmpty;
  }

  String? get teacherName => options.teacherName;
  set teacherName(String? val) {
    options.teacherName = val ?? '';
    options.includeTeacherName = val != null && val.trim().isNotEmpty;
  }

  int get numberOfSets => options.numberOfSets;
  set numberOfSets(int val) => options.numberOfSets = val;

  bool get includeInstructions => options.includeInstructions;
  set includeInstructions(bool val) => options.includeInstructions = val;

  String? get instructionsText => options.instructionsText;
  set instructionsText(String? val) => options.instructionsText = val ?? '';

  bool get includeAnswerKey => options.includeAnswerKey;
  set includeAnswerKey(bool val) => options.includeAnswerKey = val;

  List<String> get chapters => selectedChapters;
  set chapters(List<String> val) => selectedChapters = val;

  void autoBalanceForMarks(int targetMarks) {
    totalMarks = targetMarks;
    if (targetMarks == 20) {
      questionDistribution = QuestionDistribution(
        mcq: 8,
        assertionReason: 2,
        vsa: 2,
        sa: 2,
        caseStudy: 0,
        la: 0,
      );
    } else if (targetMarks == 25) {
      questionDistribution = QuestionDistribution(
        mcq: 9,
        assertionReason: 2,
        vsa: 2,
        sa: 2,
        caseStudy: 1,
        la: 0,
      );
    } else if (targetMarks == 30) {
      questionDistribution = QuestionDistribution(
        mcq: 10,
        assertionReason: 2,
        vsa: 3,
        sa: 4,
        caseStudy: 0,
        la: 0,
      );
    } else if (targetMarks == 40) {
      questionDistribution = QuestionDistribution(
        mcq: 10,
        assertionReason: 2,
        vsa: 4,
        sa: 4,
        caseStudy: 2,
        la: 0,
      );
    } else if (targetMarks == 50) {
      questionDistribution = QuestionDistribution(
        mcq: 12,
        assertionReason: 2,
        vsa: 3,
        sa: 4,
        caseStudy: 2,
        la: 2,
      );
    } else if (targetMarks == 70) {
      questionDistribution = QuestionDistribution(
        mcq: 16,
        assertionReason: 4,
        vsa: 6,
        sa: 5,
        caseStudy: 2,
        la: 3,
      );
    } else if (targetMarks == 80) {
      questionDistribution = QuestionDistribution(
        mcq: 20,
        assertionReason: 4,
        vsa: 5,
        sa: 6,
        caseStudy: 2,
        la: 4,
      );
    } else {
      // Proportional fallback for custom total marks
      final mcqCount = (targetMarks * 0.35).floor();
      final remaining = targetMarks - mcqCount;
      final saCount = (remaining / 3).floor();
      final remAfterSa = remaining % 3;
      questionDistribution = QuestionDistribution(
        mcq: mcqCount,
        assertionReason: 0,
        vsa: remAfterSa,
        sa: saCount,
        caseStudy: 0,
        la: 0,
      );
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'classId': classId,
      'subject': subject,
      'examType': examType,
      'difficulty': difficulty,
      'language': language,
      'totalMarks': totalMarks,
      'duration': duration,
      'questionDistribution': questionDistribution.toJson(),
      'options': options.toJson(),
      'selectedChapters': selectedChapters,
      'isCustom': isCustom,
      if (customClass != null && customClass!.isNotEmpty) 'customClass': customClass,
      if (customSubject != null && customSubject!.isNotEmpty) 'customSubject': customSubject,
      if (customChapters != null && customChapters!.isNotEmpty) 'customChapters': customChapters,
    };
  }
}
