class PaperConfigModel {
  String examType;
  String classId;
  String subject;
  List<String> chapters;
  bool isCustom;
  String? customSubject;
  String? customClass;
  List<String> customChapters;
  int totalMarks;
  String duration;
  String? schoolName;
  String? teacherName;
  int numberOfSets;
  bool includeInstructions;
  String? instructionsText;
  bool includeAnswerKey;

  // Question distribution counts
  int mcqCount;
  int mcqMarks;
  int vsaCount;
  int vsaMarks;
  int saCount;
  int saMarks;
  int caseCount;
  int caseMarks;
  int laCount;
  int laMarks;

  // Difficulty percentage split
  int easyPercentage;
  int mediumPercentage;
  int hardPercentage;

  PaperConfigModel({
    this.examType = 'annual_exam',
    this.classId = '10',
    this.subject = 'mathematics',
    this.chapters = const [],
    this.isCustom = false,
    this.customSubject,
    this.customClass,
    this.customChapters = const [],
    this.totalMarks = 80,
    this.duration = '3 Hours',
    this.schoolName = '',
    this.teacherName = '',
    this.numberOfSets = 1,
    this.includeInstructions = true,
    this.instructionsText,
    this.includeAnswerKey = true,
    this.mcqCount = 20,
    this.mcqMarks = 1,
    this.vsaCount = 5,
    this.vsaMarks = 2,
    this.saCount = 6,
    this.saMarks = 3,
    this.caseCount = 3,
    this.caseMarks = 4,
    this.laCount = 4,
    this.laMarks = 5,
    this.easyPercentage = 30,
    this.mediumPercentage = 50,
    this.hardPercentage = 20,
  });

  Map<String, dynamic> toJson() {
    return {
      'examType': examType,
      'classId': classId,
      'subject': subject,
      'chapters': chapters,
      'isCustom': isCustom,
      if (customSubject != null && customSubject!.isNotEmpty) 'customSubject': customSubject,
      if (customClass != null && customClass!.isNotEmpty) 'customClass': customClass,
      if (customChapters.isNotEmpty) 'customChapters': customChapters,
      'totalMarks': totalMarks,
      'duration': duration,
      'options': {
        'includeSchoolName': schoolName != null && schoolName!.isNotEmpty,
        'schoolName': schoolName,
        'includeTeacherName': teacherName != null && teacherName!.isNotEmpty,
        'teacherName': teacherName,
        'numberOfSets': numberOfSets,
        'includeInstructions': includeInstructions,
        if (instructionsText != null) 'instructionsText': instructionsText,
        'includeAnswerKey': includeAnswerKey,
      },
      'questionTypes': {
        'mcq': {'count': mcqCount, 'marksPerQuestion': mcqMarks},
        'very_short': {'count': vsaCount, 'marksPerQuestion': vsaMarks},
        'short': {'count': saCount, 'marksPerQuestion': saMarks},
        'case_study': {'count': caseCount, 'marksPerQuestion': caseMarks},
        'long': {'count': laCount, 'marksPerQuestion': laMarks},
      },
      'difficulty': {
        'easy': easyPercentage,
        'medium': mediumPercentage,
        'hard': hardPercentage,
      },
    };
  }
}
