export interface Subject {
  id: string;
  name: string;
  iconName: string;
  color: string; // Gradient color class prefix
}

export const CLASS_SUBJECTS: Record<string, Subject[]> = {
  "9": [
    { id: "maths", name: "Mathematics", iconName: "Calculator", color: "from-blue-500 to-indigo-600" },
    { id: "science", name: "Science", iconName: "FlaskConical", color: "from-emerald-500 to-teal-600" },
    { id: "english", name: "English", iconName: "BookOpen", color: "from-amber-500 to-orange-600" },
    { id: "social", name: "Social Science", iconName: "Globe", color: "from-purple-500 to-pink-600" },
    { id: "hindi", name: "हिन्दी", iconName: "Languages", color: "from-red-500 to-rose-600" },
    { id: "it", name: "Information Technology (402)", iconName: "Laptop", color: "from-cyan-500 to-blue-600" },
    { id: "ai", name: "Artificial Intelligence (417)", iconName: "Cpu", color: "from-violet-500 to-fuchsia-600" },
  ],
  "10": [
    { id: "maths", name: "Mathematics", iconName: "Calculator", color: "from-blue-500 to-indigo-600" },
    { id: "science", name: "Science", iconName: "FlaskConical", color: "from-emerald-500 to-teal-600" },
    { id: "english", name: "English", iconName: "BookOpen", color: "from-amber-500 to-orange-600" },
    { id: "social", name: "Social Science", iconName: "Globe", color: "from-purple-500 to-pink-600" },
    { id: "hindi", name: "हिन्दी", iconName: "Languages", color: "from-red-500 to-rose-600" },
    { id: "it", name: "Information Technology (402)", iconName: "Laptop", color: "from-cyan-500 to-blue-600" },
    { id: "ai", name: "Artificial Intelligence (417)", iconName: "Cpu", color: "from-violet-500 to-fuchsia-600" },
  ],
  "11": [
    { id: "physics", name: "Physics", iconName: "Atom", color: "from-blue-500 to-cyan-600" },
    { id: "chemistry", name: "Chemistry", iconName: "Beaker", color: "from-emerald-500 to-teal-600" },
    { id: "biology", name: "Biology", iconName: "Dna", color: "from-rose-500 to-pink-600" },
    { id: "maths", name: "Mathematics", iconName: "Calculator", color: "from-indigo-500 to-purple-600" },
    { id: "cs", name: "Computer Science (083)", iconName: "Code", color: "from-fuchsia-500 to-pink-600" },
    { id: "ip", name: "Informatics Practices (065)", iconName: "Database", color: "from-cyan-500 to-teal-600" },
    { id: "english", name: "English Core", iconName: "BookOpen", color: "from-amber-500 to-orange-600" },
    { id: "hindi_core", name: "हिन्दी कोर", iconName: "Languages", color: "from-red-500 to-rose-600" },
    { id: "hindi_elective", name: "हिन्दी ऐच्छिक", iconName: "Languages", color: "from-orange-500 to-red-600" },
    { id: "business", name: "Business Studies", iconName: "Briefcase", color: "from-violet-500 to-indigo-600" },
    { id: "accounts", name: "Accountancy", iconName: "TrendingUp", color: "from-teal-500 to-emerald-600" },
    { id: "economics", name: "Economics", iconName: "DollarSign", color: "from-orange-500 to-amber-600" },
    { id: "history", name: "History", iconName: "Compass", color: "from-yellow-600 to-amber-700" },
    { id: "geography", name: "Geography", iconName: "Map", color: "from-green-500 to-emerald-600" },
    { id: "polscience", name: "Political Science", iconName: "Scale", color: "from-blue-600 to-indigo-700" },
    { id: "phyedu", name: "Physical Education", iconName: "Activity", color: "from-rose-500 to-red-600" },
  ],
  "12": [
    { id: "physics", name: "Physics", iconName: "Atom", color: "from-blue-500 to-cyan-600" },
    { id: "chemistry", name: "Chemistry", iconName: "Beaker", color: "from-emerald-500 to-teal-600" },
    { id: "biology", name: "Biology", iconName: "Dna", color: "from-rose-500 to-pink-600" },
    { id: "maths", name: "Mathematics", iconName: "Calculator", color: "from-indigo-500 to-purple-600" },
    { id: "cs", name: "Computer Science (083)", iconName: "Code", color: "from-fuchsia-500 to-pink-600" },
    { id: "ip", name: "Informatics Practices (065)", iconName: "Database", color: "from-cyan-500 to-teal-600" },
    { id: "english", name: "English Core", iconName: "BookOpen", color: "from-amber-500 to-orange-600" },
    { id: "hindi_core", name: "हिन्दी कोर", iconName: "Languages", color: "from-red-500 to-rose-600" },
    { id: "hindi_elective", name: "हिन्दी ऐच्छिक", iconName: "Languages", color: "from-orange-500 to-red-600" },
    { id: "business", name: "Business Studies", iconName: "Briefcase", color: "from-violet-500 to-indigo-600" },
    { id: "accounts", name: "Accountancy", iconName: "TrendingUp", color: "from-teal-500 to-emerald-600" },
    { id: "economics", name: "Economics", iconName: "DollarSign", color: "from-orange-500 to-amber-600" },
    { id: "history", name: "History", iconName: "Compass", color: "from-yellow-600 to-amber-700" },
    { id: "geography", name: "Geography", iconName: "Map", color: "from-green-500 to-emerald-600" },
    { id: "polscience", name: "Political Science", iconName: "Scale", color: "from-blue-600 to-indigo-700" },
    { id: "phyedu", name: "Physical Education", iconName: "Activity", color: "from-rose-500 to-red-600" },
  ]
};
