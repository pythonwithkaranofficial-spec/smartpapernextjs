export interface ExamType {
  id: string;
  name: string;
  description: string;
  defaultMarks: number;
  defaultDuration: string;
  iconName: string;
  color: string;
}

export const EXAM_TYPES: ExamType[] = [
  {
    id: "class_test",
    name: "Class Test",
    description: "Quick formative assessment for classrooms.",
    defaultMarks: 20,
    defaultDuration: "45 Minutes",
    iconName: "FileText",
    color: "from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30"
  },
  {
    id: "periodic_test",
    name: "Periodic Test",
    description: "Scheduled test for measuring chapter-wise progress.",
    defaultMarks: 40,
    defaultDuration: "1.5 Hours",
    iconName: "Clock",
    color: "from-teal-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },
  {
    id: "unit_test",
    name: "Unit Test",
    description: "Standard school test conducted after a unit is completed.",
    defaultMarks: 30,
    defaultDuration: "1 Hour",
    iconName: "Bookmark",
    color: "from-purple-500/20 to-pink-500/20 text-pink-400 border-pink-500/30"
  },
  {
    id: "half_yearly",
    name: "Half Yearly",
    description: "Summative assessment covering half of the curriculum.",
    defaultMarks: 80,
    defaultDuration: "3 Hours",
    iconName: "Layers",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "annual_exam",
    name: "Annual Exam",
    description: "Final school exam covering the entire year's curriculum.",
    defaultMarks: 80,
    defaultDuration: "3 Hours",
    iconName: "GraduationCap",
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30"
  },
  {
    id: "pre_board",
    name: "Pre-Board",
    description: "Preparatory board exam strictly aligning with CBSE guidelines.",
    defaultMarks: 80,
    defaultDuration: "3 Hours",
    iconName: "Award",
    color: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30"
  },
  {
    id: "revision_test",
    name: "Revision Test",
    description: "Mock test to check revision of specific modules.",
    defaultMarks: 25,
    defaultDuration: "1 Hour",
    iconName: "RotateCcw",
    color: "from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30"
  },
  {
    id: "practice_paper",
    name: "Practice Paper",
    description: "Curated questions for self-study and student practice.",
    defaultMarks: 50,
    defaultDuration: "2 Hours",
    iconName: "PenTool",
    color: "from-cyan-500/20 to-sky-500/20 text-sky-400 border-sky-500/30"
  },
  {
    id: "sample_paper",
    name: "Sample Paper",
    description: "Complete model question paper following CBSE layout.",
    defaultMarks: 80,
    defaultDuration: "3 Hours",
    iconName: "Sparkles",
    color: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30"
  },
  {
    id: "custom_test",
    name: "Custom Test",
    description: "Fully customizable parameters, marks, and layout.",
    defaultMarks: 50,
    defaultDuration: "2 Hours",
    iconName: "Settings",
    color: "from-gray-500/20 to-slate-500/20 text-slate-400 border-slate-500/30"
  }
];
