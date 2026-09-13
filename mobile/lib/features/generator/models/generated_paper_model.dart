class QuestionModel {
  final String id;
  int number;
  String text;
  String? orQuestion;
  List<String>? choices;
  String type;
  int marks;
  String? solution;
  String? orSolution;

  QuestionModel({
    required this.id,
    required this.number,
    required this.text,
    this.orQuestion,
    this.choices,
    required this.type,
    required this.marks,
    this.solution,
    this.orSolution,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      id: json['id'] ?? 'q_${DateTime.now().microsecondsSinceEpoch}',
      number: json['number'] ?? 1,
      text: json['text'] ?? '',
      orQuestion: json['orQuestion'],
      choices: json['choices'] != null ? List<String>.from(json['choices']) : null,
      type: json['type'] ?? 'short',
      marks: json['marks'] ?? 1,
      solution: json['solution'],
      orSolution: json['orSolution'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'number': number,
      'text': text,
      'orQuestion': orQuestion,
      'choices': choices,
      'type': type,
      'marks': marks,
      'solution': solution,
      'orSolution': orSolution,
    };
  }
}

class SectionModel {
  final String id;
  final String name;
  final String description;
  final List<QuestionModel> questions;

  SectionModel({
    required this.id,
    required this.name,
    required this.description,
    required this.questions,
  });

  factory SectionModel.fromJson(Map<String, dynamic> json) {
    return SectionModel(
      id: json['id'] ?? 'sec_${DateTime.now().microsecondsSinceEpoch}',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      questions: (json['questions'] as List? ?? [])
          .map((q) => QuestionModel.fromJson(q))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'questions': questions.map((q) => q.toJson()).toList(),
    };
  }
}

class GeneratedPaperModel {
  final String? schoolName;
  final String? teacherName;
  final String examName;
  final String subject;
  final String classText;
  final String timeText;
  final String maxMarksText;
  final List<String> instructions;
  final List<SectionModel> sections;
  final int totalQuestions;
  final int totalMarks;
  final bool hasAnswerKey;
  final List<GeneratedPaperModel>? sets;
  final String? setName;

  GeneratedPaperModel({
    this.schoolName,
    this.teacherName,
    required this.examName,
    required this.subject,
    required this.classText,
    required this.timeText,
    required this.maxMarksText,
    required this.instructions,
    required this.sections,
    required this.totalQuestions,
    required this.totalMarks,
    required this.hasAnswerKey,
    this.sets,
    this.setName,
  });

  factory GeneratedPaperModel.fromJson(Map<String, dynamic> json) {
    return GeneratedPaperModel(
      schoolName: json['schoolName'],
      teacherName: json['teacherName'],
      examName: json['examName'] ?? 'EXAMINATION',
      subject: json['subject'] ?? 'Subject',
      classText: json['classText'] ?? 'Class 10',
      timeText: json['timeText'] ?? '3 Hours',
      maxMarksText: json['maxMarksText'] ?? '80 Marks',
      instructions: List<String>.from(json['instructions'] ?? []),
      sections: (json['sections'] as List? ?? [])
          .map((s) => SectionModel.fromJson(s))
          .toList(),
      totalQuestions: json['totalQuestions'] ?? 0,
      totalMarks: json['totalMarks'] ?? 80,
      hasAnswerKey: json['hasAnswerKey'] ?? true,
      setName: json['setName'],
      sets: json['sets'] != null
          ? (json['sets'] as List).map((setJson) => GeneratedPaperModel.fromJson(setJson)).toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (schoolName != null) 'schoolName': schoolName,
      if (teacherName != null) 'teacherName': teacherName,
      'examName': examName,
      'subject': subject,
      'classText': classText,
      'timeText': timeText,
      'maxMarksText': maxMarksText,
      'instructions': instructions,
      'sections': sections.map((s) => s.toJson()).toList(),
      'totalQuestions': totalQuestions,
      'totalMarks': totalMarks,
      'hasAnswerKey': hasAnswerKey,
      if (setName != null) 'setName': setName,
      if (sets != null) 'sets': sets!.map((set) => set.toJson()).toList(),
    };
  }
}
