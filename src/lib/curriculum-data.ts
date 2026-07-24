export interface SubjectCurriculum {
  chapters: string[];
  notes?: string;
}

export const CURRICULUM_DATA: Record<string, Record<string, SubjectCurriculum>> = {
  "6": {
    maths: {
      chapters: [
        "Knowing Our Numbers",
        "Whole Numbers",
        "Playing with Numbers",
        "Basic Geometrical Ideas",
        "Understanding Elementary Shapes",
        "Integers",
        "Fractions",
        "Decimals",
        "Data Handling",
        "Mensuration",
        "Algebra",
        "Ratio and Proportion",
        "Symmetry"
      ],
      notes: "CBSE Class 6 Mathematics curriculum."
    },
    science: {
      chapters: [
        "Components of Food",
        "Sorting Materials into Groups",
        "Separation of Substances",
        "Getting to Know Plants",
        "Body Movements",
        "The Living Organisms — Characteristics and Habitats",
        "Motion and Measurement of Distances",
        "Light, Shadows and Reflections",
        "Electricity and Circuits",
        "Fun with Magnets"
      ],
      notes: "CBSE Class 6 Science curriculum."
    },
    social: {
      chapters: [
        "History: What, Where, How and When?",
        "History: From Gathering to Growing Food",
        "History: In the Earliest Cities",
        "History: What Books and Burials Tell Us",
        "History: Kingdoms, Kings and an Early Republic",
        "History: New Questions and Ideas",
        "History: Ashoka, The Emperor Who Gave Up War",
        "Geography: The Earth in the Solar System",
        "Geography: Globe - Latitudes and Longitudes",
        "Geography: Motions of the Earth",
        "Geography: Maps",
        "Geography: Major Domains of the Earth",
        "Geography: Major Landforms of the Earth",
        "Civics: Understanding Diversity",
        "Civics: Diversity and Discrimination",
        "Civics: What is Government?",
        "Civics: Key Elements of a Democratic Government",
        "Civics: Panchayati Raj",
        "Civics: Rural & Urban Administration"
      ],
      notes: "CBSE Class 6 Social Science (History, Geography, Civics)."
    },
    english: {
      chapters: [
        "Honeysuckle: A House, A Home / Who I Am",
        "Honeysuckle: How the Dog Found Himself a New Master",
        "Honeysuckle: Taro's Reward",
        "Honeysuckle: An Indian-American Woman in Space: Kalpana Chawla",
        "Honeysuckle: A Different Kind of School",
        "Honeysuckle: Fair Play",
        "A Pact with the Sun: The Friendly Mongoose, Tansen, The Shepherd's Treasure",
        "Grammar & Writing: Nouns, Pronouns, Verbs, Paragraph & Notice Writing"
      ],
      notes: "CBSE Class 6 English curriculum."
    },
    hindi: {
      chapters: [
        "वसंत: वह चिड़िया जो",
        "वसंत: बचपन",
        "वसंत: नादान दोस्त",
        "वसंत: चाँद से थोड़ी सी गप्पें",
        "वसंत: अक्षरों का महत्व",
        "वसंत: पार नज़र के",
        "वसंत: साथी हाथ बढ़ाना",
        "वसंत: ऐसे-ऐसे",
        "वसंत: टिकट अलबम",
        "वसंत: झाँसी की रानी",
        "व्याकरण: संज्ञा, सर्वनाम, विशेषण, वर्ण विचार, पत्र एवं निबंध लेखन"
      ],
      notes: "सीबीएसई कक्षा 6 हिन्दी पाठ्यपुस्तक वसंत भाग-1।"
    },
    sanskrit: {
      chapters: [
        "रुचिरा: प्रथमः पाठः - शब्दपरिचयः I",
        "रुचिरा: द्वितीयः पाठः - शब्दपरिचयः II",
        "रुचिरा: तृतीयः पाठः - शब्दपरिचयः III",
        "रुचिरा: चतुर्थः पाठः - विद्यालयः",
        "रुचिरा: पञ्चमः पाठः - वृक्षाः",
        "रुचिरा: षष्ठः पाठः - समुद्रतटः",
        "रुचिरा: सप्तमः पाठः - बकस्य प्रतीकारः",
        "रुचिरा: अष्टमः पाठः - सूक्तिस्तबकः",
        "व्याकरणम्: शब्दरूपाणि, धातुरूपाणि, अव्ययानि"
      ],
      notes: "सीबीएसई कक्षा 6 संस्कृत पाठ्यपुस्तक रुचिरा भाग-1।"
    }
  },
  "7": {
    maths: {
      chapters: [
        "Integers",
        "Fractions and Decimals",
        "Data Handling",
        "Simple Equations",
        "Lines and Angles",
        "The Triangle and its Properties",
        "Comparing Quantities",
        "Rational Numbers",
        "Perimeter and Area",
        "Algebraic Expressions",
        "Exponents and Powers",
        "Symmetry",
        "Visualising Solid Shapes"
      ],
      notes: "CBSE Class 7 Mathematics curriculum."
    },
    science: {
      chapters: [
        "Nutrition in Plants",
        "Nutrition in Animals",
        "Heat",
        "Acids, Bases and Salts",
        "Physical and Chemical Changes",
        "Respiration in Organisms",
        "Transportation in Animals and Plants",
        "Reproduction in Plants",
        "Motion and Time",
        "Electric Current and its Effects",
        "Light",
        "Forests: Our Lifeline",
        "Wastewater Story"
      ],
      notes: "CBSE Class 7 Science curriculum."
    },
    social: {
      chapters: [
        "History: Tracing Changes Through a Thousand Years",
        "History: New Kings and Kingdoms",
        "History: The Delhi Sultans",
        "History: The Mughal Empire",
        "History: Rulers and Buildings",
        "History: Towns, Traders and Craftspersons",
        "Geography: Environment",
        "Geography: Inside Our Earth",
        "Geography: Our Changing Earth",
        "Geography: Air",
        "Geography: Water",
        "Geography: Natural Vegetation and Wildlife",
        "Civics: On Equality",
        "Civics: Role of the Government in Health",
        "Civics: How the State Government Works",
        "Civics: Growing up as Boys and Girls",
        "Civics: Women Change the World"
      ],
      notes: "CBSE Class 7 Social Science (History, Geography, Civics)."
    },
    english: {
      chapters: [
        "Honeycomb: Three Questions",
        "Honeycomb: A Gift of Chappals",
        "Honeycomb: Gopal and the Hilsa Fish",
        "Honeycomb: The Ashes That Made Trees Bloom",
        "Honeycomb: Quality",
        "Honeycomb: Expert Detectives",
        "Honeycomb: The Invention of Vita-Wonk",
        "An Alien Hand: The Tiny Teacher, Bringing up Kari, The Desert",
        "Grammar & Writing: Tenses, Active/Passive Voice, Story Writing, Informal Letters"
      ],
      notes: "CBSE Class 7 English curriculum."
    },
    hindi: {
      chapters: [
        "वसंत: हम पंछी उन्मुक्त गगन के",
        "वसंत: हिमालय की बेटियाँ",
        "वसंत: कठपुतली",
        "वसंत: मिठाईवाला",
        "वसंत: पापा खो गए",
        "वसंत: शाम-एक किसान",
        "वसंत: अपूर्व अनुभव",
        "वसंत: रहीम के दोहे",
        "वसंत: एक तिनका",
        "वसंत: खानपान की बदलती तस्वीर",
        "बाल महाभारत कथा एवं हिंदी व्याकरण"
      ],
      notes: "सीबीएसई कक्षा 7 हिन्दी पाठ्यपुस्तक वसंत भाग-2।"
    },
    sanskrit: {
      chapters: [
        "रुचिरा: प्रथमः पाठः - सुभाषितानि",
        "रुचिरा: द्वितीयः पाठः - दुर्बुद्धिः विनश्यति",
        "रुचिरा: तृतीयः पाठः - स्वावलम्बनम्",
        "रुचिरा: चतुर्थः पाठः - हास्यबालकविसम्मेलनम्",
        "रुचिरा: पञ्चमः पाठः - पण्डिता रमाबाई",
        "रुचिरा: षष्ठः पाठः - सदाचारः",
        "रुचिरा: सप्तमः पाठः - सङ्कल्पः सिद्धिदायकः",
        "रुचिरा: अष्टमः पाठः - त्रिवर्णः ध्वजः",
        "व्याकरणम्: कारक-उपपदविभक्तयः, सन्धिः, शब्दरूपाणि"
      ],
      notes: "सीबीएसई कक्षा 7 संस्कृत पाठ्यपुस्तक रुचिरा भाग-2।"
    }
  },
  "8": {
    maths: {
      chapters: [
        "Rational Numbers",
        "Linear Equations in One Variable",
        "Understanding Quadrilaterals",
        "Data Handling",
        "Squares and Square Roots",
        "Cubes and Cube Roots",
        "Comparing Quantities",
        "Algebraic Expressions and Identities",
        "Mensuration",
        "Exponents and Powers",
        "Direct and Inverse Proportions",
        "Factorisation",
        "Introduction to Graphs"
      ],
      notes: "CBSE Class 8 Mathematics curriculum."
    },
    science: {
      chapters: [
        "Crop Production and Management",
        "Microorganisms: Friend and Foe",
        "Coal and Petroleum",
        "Combustion and Flame",
        "Conservation of Plants and Animals",
        "Reproduction in Animals",
        "Reaching the Age of Adolescence",
        "Force and Pressure",
        "Friction",
        "Sound",
        "Chemical Effects of Electric Current",
        "Some Natural Phenomena",
        "Light"
      ],
      notes: "CBSE Class 8 Science curriculum."
    },
    social: {
      chapters: [
        "History: How, When and Where",
        "History: From Trade to Territory",
        "History: Ruling the Countryside",
        "History: Tribals, Dikus and the Vision of a Golden Age",
        "History: When People Rebel 1857 and After",
        "Geography: Resources",
        "Geography: Land, Soil, Water, Natural Vegetation and Wildlife",
        "Geography: Mineral and Power Resources",
        "Geography: Agriculture",
        "Geography: Industries",
        "Geography: Human Resources",
        "Civics: The Indian Constitution",
        "Civics: Understanding Secularism",
        "Civics: Why Do We Need a Parliament?",
        "Civics: Understanding Laws",
        "Civics: Judiciary",
        "Civics: Understanding Marginalisation"
      ],
      notes: "CBSE Class 8 Social Science (History, Geography, Civics)."
    },
    english: {
      chapters: [
        "Honeydew: The Best Christmas Present in the World",
        "Honeydew: The Tsunami",
        "Honeydew: Glimpses of the Past",
        "Honeydew: Bepin Choudhury's Lapse of Memory",
        "Honeydew: The Summit Within",
        "Honeydew: This is Jody's Fawn",
        "It So Happened: How the Camel Got His Hump, Children at Work, The Selfish Giant",
        "Grammar & Writing: Reported Speech, Modals, Formal Letter Writing, Essay Writing"
      ],
      notes: "CBSE Class 8 English curriculum."
    },
    hindi: {
      chapters: [
        "वसंत: ध्वनि",
        "वसंत: बस की यात्रा",
        "वसंत: दीवानों की हस्ती",
        "वसंत: भगवान के डाकिए",
        "वसंत: क्या निराश हुआ जाए",
        "वसंत: यह सबसे कठिन समय नहीं",
        "वसंत: कबीर की साखियाँ",
        "वसंत: सुदामा चरित",
        "वसंत: जहाँ पहिया है",
        "वसंत: अकबरी लोटा",
        "भारत की खोज एवं हिंदी व्याकरण"
      ],
      notes: "सीबीएसई कक्षा 8 हिन्दी पाठ्यपुस्तक वसंत भाग-3।"
    },
    sanskrit: {
      chapters: [
        "रुचिरा: प्रथमः पाठः - सुभाषितानि",
        "रुचिरा: द्वितीयः पाठः - बिलस्य वाणी न कदापि मे श्रुता",
        "रुचिरा: तृतीयः पाठः - डिजीभारतम्",
        "रुचिरा: चतुर्थः पाठः - सदैव पुरतो निधेहि चरणम्",
        "रुचिरा: पञ्चमः पाठः - कण्टकेनैव कण्टकम्",
        "रुचिरा: षष्ठः पाठः - गृहं शून्यं सुतां बिना",
        "रुचिरा: सप्तमः पाठः - भारतजनताऽहम्",
        "रुचिरा: अष्टमः पाठः - संसारसागरस्य नायकाः",
        "व्याकरणम्: समासः, प्रत्ययाः, अपठित-गद्यांशः, चित्रवर्णनम्"
      ],
      notes: "सीबीएसई कक्षा 8 संस्कृत पाठ्यपुस्तक रुचिरा भाग-3।"
    }
  },
  "9": {
    maths: {
      chapters: [
        "Number System",
        "Introduction to Polynomials",
        "Sequences and Progressions",
        "Exploring Algebraic Identities",
        "Linear Equations in Two Variables",
        "Coordinate Geometry",
        "Introduction to Euclid's Geometry: Axioms and Postulates",
        "Lines and Angles",
        "Triangles – Congruence Theorems",
        "4-gons (Quadrilaterals)",
        "Circles",
        "Area and Perimeter",
        "Surface Area and Volume",
        "Statistics",
        "Introduction to Probability"
      ],
      notes: "CBSE Class 9 Mathematics curriculum."
    },
    science: {
      chapters: [
        "Cell (Chapter 2)",
        "Tissues (Chapter 3)",
        "Motion (Chapter 4)",
        "Exploring Mixtures and their Separation (Chapter 5)",
        "Force and Laws of Motion (Chapter 6)",
        "Work, Energy and Simple Machines (Chapter 7)",
        "Structure of an Atom (Chapter 8)",
        "Atoms and Molecules (Chapter 9)",
        "Sound (Chapter 10)",
        "Reproduction (Chapter 11)",
        "Diversity (Chapter 12)",
        "Earth as a System: Energy, Matter & Life (Chapter 13)"
      ],
      notes: "CBSE Class 9 Science 2026–27 curriculum covering World of Living, Matter: Its Nature & Behaviour, Motion/Force/Work/Sound, and Earth as a System."
    },
    it: {
      chapters: [
        "Part A: Communication Skills – I",
        "Part A: Self-Management Skills – I",
        "Part A: Basic Information and Communication Technology (ICT) Skills – I",
        "Part A: Entrepreneurial Skills – I",
        "Part A: Green Skills – I",
        "Part B: Introduction to IT–ITeS Industry",
        "Part B: Data Entry & Keyboarding Skills",
        "Part B: Digital Documentation",
        "Part B: Electronic Spreadsheet",
        "Part B: Digital Presentation"
      ],
      notes: "CBSE Information Technology Subject Code 402 for Class 9."
    },
    ai: {
      chapters: [
        "Part A: Communication Skills – I",
        "Part A: Self-Management Skills – I",
        "Part A: Information and Communication Technology (ICT) Skills – I",
        "Part A: Entrepreneurial Skills – I",
        "Part A: Green Skills – I",
        "Part B: AI Reflection, Project Cycle and Ethics",
        "Part B: Data Literacy",
        "Part B: Math for AI (Statistics & Probability)",
        "Part B: Introduction to Generative AI",
        "Part B: Introduction to Python"
      ],
      notes: "CBSE Artificial Intelligence Subject Code 417 for Class 9."
    },
    computer_applications: {
      chapters: [
        "Unit 1: Basics of Information Technology (CPU, RAM/ROM, Storage, I/O Devices, Software Types, Networks, Multimedia)",
        "Unit 2: Cyber-safety (Browsing Safety, Password Hygiene, Privacy, Cyber Stalking, Reporting Cybercrimes, Malware)",
        "Unit 3: Office Tools - Word Processor (Formatting, Images, Tables, Track Changes, Auto-Format)",
        "Unit 3: Office Tools - Presentation Tool (Slide Layouts, Views, Background, Animations, Sound Effects)",
        "Unit 3: Office Tools - Spreadsheets (Autofill, Formatting, Operators, Statistical Functions SUM/AVG/MAX/MIN/IF, Charts)"
      ],
      notes: "CBSE Computer Applications Subject Code 165 for Class 9. Theory: 50 Marks, Practical: 50 Marks."
    },
    english: {
      chapters: [
        "Beehive (Prose): The Fun They Had, The Sound of Music, The Little Girl, A Truly Beautiful Mind, The Snake and the Mirror, My Childhood, Reach for the Top, Kathmandu, If I Were You",
        "Beehive (Poetry): The Road Not Taken, Wind, Rain on the Roof, The Lake Isle of Innisfree, A Legend of the Northland, No Men Are Foreign, On Killing a Tree, A Slumber Did My Spirit Seal",
        "Moments (Supplementary Reader): The Lost Child, The Adventures of Toto, Iswaran the Storyteller, In the Kingdom of Fools, The Happy Prince, The Last Leaf, A House is Not a Home, The Beggar",
        "Writing & Grammar: Descriptive Paragraph, Story Writing, Diary Entry, Tenses, Modals, Subject-Verb Concord, Reported Speech"
      ]
    },
    social: {
      chapters: [
        "Part 1: 1. Understanding Social Science",
        "Part 1: 2. Shaping of the Earth's Surface",
        "Part 1: 3. Atmosphere and Climate",
        "Part 1: 4. Early Humans and Beginning of Civilisation",
        "Part 1: 5. State and Society (up to 1000 CE)",
        "Part 1: 6. Democracy",
        "Part 1: 7. Elections",
        "Part 1: 8. Building Blocks in Economics",
        "Part 1: 9. The Price Puzzle: What Drives the Market",
        "Part 2: 10. Oceans and Life",
        "Part 2: 11. Life on Earth",
        "Part 2: 12. Resistance and Resilience (1000 CE–1700 CE)",
        "Part 2: 13. India and the World-I (1900 BCE–1200 CE)",
        "Part 2: 14. Authority",
        "Part 2: 15. From Ideas to Startups",
        "Part 2: 16. Smart Ways to Manage Your Finances"
      ],
      notes: "CBSE Class 9 Social Science curriculum (Part 1 and Part 2)."
    },
    hindi: {
      chapters: [
        "क्षितिज - गद्य खंड: दो बैलों की कथा",
        "क्षितिज - गद्य खंड: ल्हासा की ओर",
        "क्षितिज - गद्य खंड: उपभोक्तावाद की संस्कृति",
        "क्षितिज - गद्य खंड: साँवले सपनों की याद",
        "क्षितिज - गद्य खंड: प्रेमचंद के फटे जूते",
        "क्षितिज - गद्य खंड: मेरे बचपन के दिन",
        "क्षितिज - काव्य खंड: साखियाँ एवं सबद",
        "क्षितिज - काव्य खंड: वाख",
        "क्षितिज - काव्य खंड: सवैये",
        "क्षितिज - काव्य खंड: कैदी और कोकिला",
        "क्षितिज - काव्य खंड: ग्राम श्री",
        "क्षितिज - काव्य खंड: मेघ आए",
        "क्षितिज - काव्य खंड: बच्चे काम पर जा रहे हैं",
        "कृतिका: इस जल प्रलय में",
        "कृतिका: मेरे संग की औरतें",
        "कृतिका: रीढ़ की हड्डी",
        "व्याकरण: शब्द निर्माण (उपसर्ग, प्रत्यय)",
        "व्याकरण: समास",
        "व्याकरण: अर्थ की दृष्टि से वाक्य भेद",
        "व्याकरण: अलंकार",
        "रचनात्मक लेखन: अनुच्छेद लेखन",
        "रचनात्मक लेखन: पत्र लेखन",
        "रचनात्मक लेखन: संवाद लेखन",
        "अपठित बोध: अपठित गद्यांश एवं काव्यांश"
      ],
      notes: "सीबीएसई कक्षा 9 हिन्दी पाठ्यक्रम। गद्य, काव्य, व्याकरण और रचनात्मक लेखन पर केंद्रित।"
    },
    sanskrit: {
      chapters: [
        "प्रथमः पाठः - भारतीवसन्तगीतिः",
        "द्वितीयः पाठः - स्वर्णकाकः",
        "तृतीयः पाठः - गोदोहनम्",
        "चतुर्थः पाठः - कल्पतरुः",
        "पञ्चमः पाठः - सूक्तिमौक्तिकम्",
        "षष्ठः पाठः - भ्रान्तो बालः",
        "सप्तमः पाठः - प्रत्यभिज्ञानम्",
        "अष्टमः पाठः - लौहतुला",
        "नवमः पाठः - सिकतासेतुः",
        "दशमः पाठः - जटायोः शौर्यम्",
        "एकादशः पाठः - पर्यावरणम्",
        "द्वादशः पाठः - वाङ्मनःप्राणस्वरूपम्",
        "खण्डः 'क' - अपठित-अवबोधनम्",
        "खण्डः 'ख' - रचनात्मक-कार्यम् (पत्रम्, चित्रवर्णनम्, अनुवादः)",
        "खण्डः 'ग' - अनुप्रयुक्त-व्याकरणम् (सन्धिः, शब्दरूपाणि, धातुरूपाणि, कारकम्)",
        "खण्डः 'घ' - पठित-अवबोधनम् (शेमुषी भाग-1)"
      ],
      notes: "सीबीएसई कक्षा 9 संस्कृत पाठ्यक्रम (विषय कोड 122)। शेमुषी भाग-1 एवं व्याकरणम्।"
    }
  },
  "10": {
    maths: {
      chapters: [
        "Real Numbers",
        "Polynomials",
        "Pair of Linear Equations in Two Variables",
        "Quadratic Equations",
        "Arithmetic Progressions",
        "Coordinate Geometry",
        "Triangles",
        "Circles",
        "Introduction to Trigonometry",
        "Trigonometric Identities",
        "Heights and Distances",
        "Areas Related to Circles",
        "Surface Areas and Volumes",
        "Statistics",
        "Probability"
      ],
      notes: "CBSE Class 10 Mathematics Standard Code 041 curriculum."
    },
    mathsbasic: {
      chapters: [
        "Real Numbers",
        "Polynomials",
        "Pair of Linear Equations in Two Variables",
        "Quadratic Equations",
        "Arithmetic Progressions",
        "Coordinate Geometry",
        "Triangles",
        "Circles",
        "Introduction to Trigonometry",
        "Trigonometric Identities",
        "Heights and Distances",
        "Areas Related to Circles",
        "Surface Areas and Volumes",
        "Statistics",
        "Probability"
      ],
      notes: "CBSE Class 10 Mathematics Basic Code 241 curriculum. Focuses 75% on Remembering/Understanding."
    },
    science: {
      chapters: [
        "Chemical Reactions and Equations",
        "Acids, Bases and Salts",
        "Metals and Non-metals",
        "Carbon and its Compounds",
        "Life Processes",
        "Control and Coordination",
        "Reproduction",
        "Heredity",
        "Light – Reflection and Refraction",
        "The Human Eye and the Colourful World",
        "Electricity",
        "Magnetic Effects of Electric Current",
        "Our Environment",
        "Periodic Classification of Elements (Formative)",
        "Evolution (Formative)",
        "Motor, Electromagnetic Induction and Electric Generator (Formative)"
      ],
      notes: "CBSE Class 10 Science curriculum covering Units I-V (Chemical Substances, World of Living, Natural Phenomena, Effects of Current, Natural Resources) and Formative Assessment topics."
    },
    it: {
      chapters: [
        "Part A: Unit 1: Communication Skills-II",
        "Part A: Unit 2: Self-Management Skills-II",
        "Part A: Unit 3: Information and Communication Technology (ICT) Skills-II",
        "Part A: Unit 4: Entrepreneurial Skills-II",
        "Part A: Unit 5: Green Skills-II",
        "Part B: Unit 1: Digital Documentation (Advanced) using LibreOffice Writer",
        "Part B: Unit 2: Electronic Spreadsheet (Advanced) using LibreOffice Calc",
        "Part B: Unit 3: Database Management System using LibreOffice Base",
        "Part B: Unit 4: Maintain Healthy, Safe and Secure Working Environment"
      ],
      notes: "CBSE Information Technology Subject Code 402 for Class 10 (Domestic Data Entry Operator). Theory: 50 Marks, Practical: 50 Marks."
    },
    ai: {
      chapters: [
        "Part A: Employability Skills",
        "Part B: Introduction to AI (Revision)",
        "AI Project Cycle (Revision)",
        "Advance Python (Numpy, Pandas, Matplotlib)",
        "Computer Vision",
        "Natural Language Processing (NLP)",
        "Evaluation"
      ],
      notes: "CBSE Subject Code 417."
    },
    english: {
      chapters: [
        "First Flight (Prose): A Letter to God, Nelson Mandela: Long Walk to Freedom, Two Stories about Flying, From the Diary of Anne Frank, Glimpses of India, Madam Rides the Bus, The Sermon at Benares, The Proposal",
        "First Flight (Poetry): Dust of Snow, Fire and Ice, A Tiger in the Zoo, How to Tell Wild Animals, The Ball Poem, Amanda!, Fog, The Tale of Custard the Dragon, For Anne Gregory",
        "Footprints Without Feet: A Triumph of Surgery, The Thief's Story, The Midnight Visitor, A Question of Trust, Footprints without Feet, The Making of a Scientist, The Necklace, Bholi, The Book That Saved the Earth",
        "Writing & Grammar: Formal Letter, Analytical Paragraph, Tenses, Modals, Subject-Verb Concord, Reported Speech"
      ]
    },
    social: {
      chapters: [
        "History: The Rise of Nationalism in Europe",
        "History: Nationalism in India",
        "History: The Making of a Global World (Subtopics 1 to 1.3 for Board Exam)",
        "History: The Age of Industrialisation (Periodic Assessment)",
        "History: Print Culture and the Modern World",
        "Geography: Resources and Development",
        "Geography: Forest and Wildlife Resources",
        "Geography: Water Resources",
        "Geography: Agriculture",
        "Geography: Minerals and Energy Resources",
        "Geography: Manufacturing Industries",
        "Geography: Lifelines of National Economy (Map Pointing)",
        "Political Science: Power-sharing",
        "Political Science: Federalism",
        "Political Science: Gender, Religion and Caste",
        "Political Science: Political Parties",
        "Political Science: Outcomes of Democracy",
        "Economics: Development",
        "Economics: Sectors of the Indian Economy",
        "Economics: Money and Credit",
        "Economics: Globalisation and the Indian Economy"
      ],
      notes: "CBSE Class 10 Social Science curriculum (History, Geography, Political Science, Economics)."
    },
    hindi: {
      chapters: [
        "क्षितिज - गद्य खंड: नेताजी का चश्मा",
        "क्षितिज - गद्य खंड: बालगोबिन भगत",
        "क्षितिज - गद्य खंड: लखनवी अंदाज़",
        "क्षितिज - गद्य खंड: एक कहानी यह भी",
        "क्षितिज - गद्य खंड: नौबतखाने में इबादत",
        "क्षितिज - गद्य खंड: संस्कृति",
        "क्षितिज - काव्य खंड: पद (सूरदास)",
        "क्षितिज - काव्य खंड: राम-लक्ष्मण-परशुराम संवाद",
        "क्षितिज - काव्य खंड: आत्मकथ्य",
        "क्षितिज - काव्य खंड: उत्साह और अट नहीं रही है",
        "क्षितिज - काव्य खंड: यह दंतुरित मुस्कान और फसल",
        "क्षितिज - काव्य खंड: संगतकार",
        "कृतिका: माता का अँचल",
        "कृतिका: साना-साना हाथ जोड़ि",
        "कृतिका: मैं क्यों लिखता हूँ",
        "व्याकरण: रचना के आधार पर वाक्य रूपांतरण",
        "व्याकरण: वाच्य",
        "व्याकरण: पद परिचय",
        "व्याकरण: अलंकार",
        "रचनात्मक लेखन: अनुच्छेद लेखन",
        "रचनात्मक लेखन: पत्र लेखन",
        "रचनात्मक लेखन: स्ववृत्त लेखन / ईमेल लेखन",
        "रचनात्मक लेखन: विज्ञापन लेखन / संदेश लेखन",
        "अपठित बोध: अपठित गद्यांश एवं काव्यांश"
      ],
      notes: "सीबीएसई कक्षा 10 हिन्दी पाठ्यक्रम। बोर्ड परीक्षा पैटर्न और व्याकरण मानकों के अनुरूप।"
    },
    sanskrit: {
      chapters: [
        "प्रथमः पाठः - शुचिपर्यावरणम्",
        "द्वितीयः पाठः - बुद्धिर्बलवती सदा",
        "तृतीयः पाठः - शिशुलालनाम्",
        "चतुर्थः पाठः - जननी तुल्यवत्सला",
        "पञ्चमः पाठः - सुभाषितानि",
        "षष्ठः पाठः - सौहार्दं प्रकृतेः शोभा",
        "सप्तमः पाठः - विचित्रः साक्षी",
        "अष्टमः पाठः - सूक्तयः",
        "दशमः पाठः - अन्योक्तयः",
        "खण्डः 'क' - अपठित-अवबोधनम् (गद्यांश 80-100 शब्द)",
        "खण्डः 'ख' - रचनात्मक-कार्यम् (पत्र-लेखनम्, चित्रवर्णनम्/अनुच्छेदः, अनुवादः)",
        "खण्डः 'ग' - अनुप्रयुक्त-व्याकरणम् (सन्धिः, समासः, प्रत्ययाः, वाच्यम्, समयः, अव्ययानि, संशोधनम्)",
        "खण्डः 'घ' - पठित-अवबोधनम् (शेमुषी भाग-2 गद्यांश/पद्यांश/नाट्यांश, प्रश्ननिर्माणम्, अन्वयः/भावार्थः, कथाक्रमः, अर्थलेखनम्)"
      ],
      notes: "सीबीएसई कक्षा 10 संस्कृत पाठ्यक्रम (विषय-कोड 122)। शेमुषी भाग-2, अभ्यासवान् भव भाग-2, व्याकरणवीथि।"
    },
    englishcommunicative: {
      chapters: [
        "Literature Reader - Fiction: Two Gentlemen of Verona, Mrs. Packletide's Tiger, The Letter, A Shady Plot, Patol Babu, Film Star, Virtually True",
        "Literature Reader - Poetry: The Frog and the Nightingale, Mirror, Not Marble nor the Gilded Monuments, Ozymandias, The Rime of the Ancient Mariner, Snake",
        "Literature Reader - Drama: The Dear Departed, Julius Caesar",
        "Main Course Book: Health and Medicine, Education, Science, Environment, Travel and Tourism, National Integration",
        "Section A: Reading Skills (2 Unseen Passages - Factual & Discursive 750 words)",
        "Section B: Writing Skills (Notice, Dialogue, Email, Application 3M, Description 4M, Formal Letter 7M, Article 8M)",
        "Section C: Grammar (Gap filling 3M, Editing/Omission 4M, Sentence Transformation 3M)"
      ],
      notes: "CBSE English Communicative Subject Code 101 for Class 10. Theory: 80 Marks."
    },
    computer_applications: {
      chapters: [
        "Unit 1: Networking (Internet, WWW, Web Server/Client, HTML/CSS Basics, Cyber Protocols, E-commerce)",
        "Unit 2: HTML (Head/Body tags, Font, Color, Images, Tables, Lists, Hyperlinks, Audio/Video embedding)",
        "Unit 3: Cyber-ethics (Net Etiquettes, Software Licenses, Open Source, Digital Property, Privacy, Malware, Spam)",
        "Unit 4: Lab Exercises (HTML Webpage Design with CSS & Multimedia)"
      ],
      notes: "CBSE Computer Applications Subject Code 165 for Class 10. Theory: 50 Marks, Practical: 50 Marks."
    }
  },
  "11": {
    physics: {
      chapters: [
        "Units and Measurements",
        "Motion in a Straight Line",
        "Motion in a Plane",
        "Laws of Motion",
        "Work, Energy and Power",
        "System of Particles and Rotational Motion",
        "Gravitation",
        "Mechanical Properties of Solids",
        "Mechanical Properties of Fluids",
        "Thermal Properties of Matter",
        "Thermodynamics",
        "Kinetic Theory",
        "Oscillations",
        "Waves"
      ],
      notes: "CBSE Physics Subject Code 042 for Class 11. Focus on kinematics, mechanics, thermodynamics, and waves."
    },
    chemistry: {
      chapters: [
        "Some Basic Concepts of Chemistry",
        "Structure of Atom",
        "Classification of Elements and Periodicity in Properties",
        "Chemical Bonding and Molecular Structure",
        "Chemical Thermodynamics",
        "Equilibrium",
        "Redox Reactions",
        "Organic Chemistry: Some Basic Principles and Techniques",
        "Hydrocarbons",
        "s & p Block Elements (Formative)",
        "The Gaseous State (Formative)"
      ],
      notes: "CBSE Chemistry Subject Code 043 for Class 11. Includes core syllabus chapters and Formative-only topics."
    },
    biology: {
      chapters: [
        "The Living World",
        "Biological Classification",
        "Plant Kingdom",
        "Animal Kingdom",
        "Morphology of Flowering Plants",
        "Anatomy of Flowering Plants",
        "Structural Organisation in Animals",
        "Cell – The Unit of Life",
        "Biomolecules",
        "Cell Cycle and Cell Division",
        "Photosynthesis in Higher Plants",
        "Respiration in Plants",
        "Plant Growth and Development",
        "Breathing and Exchange of Gases",
        "Body Fluids and Circulation",
        "Excretory Products and their Elimination",
        "Locomotion and Movement",
        "Neural Control and Coordination",
        "Chemical Coordination and Integration"
      ],
      notes: "CBSE Biology Subject Code 044 for Class 11."
    },
    maths: {
      chapters: [
        "Sets",
        "Relations and Functions",
        "Trigonometric Functions",
        "Complex Numbers and Quadratic Equations",
        "Linear Inequalities",
        "Permutations and Combinations",
        "Binomial Theorem",
        "Sequence and Series",
        "Straight Lines",
        "Conic Sections",
        "Introduction to Three-dimensional Geometry",
        "Limits and Derivatives",
        "Statistics",
        "Probability",
        "Principle of Mathematical Induction (Formative)",
        "Composition of Functions (Formative)",
        "General Solution of Trigonometric Equations (Formative)",
        "Polar Representation of Complex Numbers (Formative)",
        "Graphical Solution of Linear Inequalities in Two Variables (Formative)",
        "General and Middle Term in Binomial Expansion (Formative)",
        "Special Sums in Sequence & Series (Formative)",
        "Normal Form & General Equation of a Line (Formative)",
        "Section Formula (Formative)",
        "Chain Rule (Composite Functions) (Formative)",
        "Random Experiments and Sample Space (Formative)"
      ],
      notes: "CBSE Mathematics Code 041. Covers Units I-V (Sets & Functions, Algebra, Coordinate Geometry, Calculus, Statistics & Probability) and Formative-only topics."
    },
    cs: {
      chapters: [
        "Unit 1: Computer Systems and Organisation",
        "Unit 2: Computational Thinking and Programming – I",
        "Unit 3: Society, Law and Ethics",
        "Basic Computer Organisation & Software Types",
        "Operating System, Boolean Logic & Number System",
        "Encoding Schemes (ASCII, ISCII, Unicode)",
        "Basics of Python Programming & Problem Solving",
        "Python Operators, Expressions, Data Types & Input/Output",
        "Flow of Control: Conditional & Iterative Statements",
        "Python Sequences: Strings, Lists, Tuples & Dictionaries",
        "Introduction to Python Modules",
        "Digital Footprints, Netizen & Data Protection",
        "Cyber Crime, Cyber Safety, Malware & E-Waste Management",
        "Information Technology Act (IT Act) & Technology and Society"
      ],
      notes: "CBSE Computer Science Subject Code 083 for Class 11."
    },
    ip: {
      chapters: [
        "Unit 1: Introduction to Computer System (Hardware, Memory, Software Types)",
        "Unit 2: Introduction to Python (Basics, Control Statements, Lists, Dictionaries, NumPy)",
        "Unit 3: Database Concepts and SQL (DBMS, Relational Model, DDL, DQL, DML)",
        "Unit 4: Introduction to Emerging Trends (AI, ML, Cloud Computing, IoT, Blockchain)",
        "Introduction to Computer and Computing",
        "Evolution of Computing Devices",
        "Components of a Computer System (Input, Output, Memory)",
        "Computer Memory and Data Security",
        "Software: System, Application & Generic/Specific Software",
        "Basics of Python Programming",
        "Control Statements in Python (if-else, loops)",
        "Lists and Dictionaries in Python",
        "Introduction to NumPy Arrays",
        "Database Concepts and Relational Data Model",
        "SQL Data Definition Language (DDL - CREATE, DROP, ALTER)",
        "SQL Data Query Language (DQL - SELECT, WHERE, Operators)",
        "SQL Data Manipulation Language (DML - INSERT, UPDATE, DELETE)",
        "Emerging Trends: AI, ML, NLP, AR/VR, Robotics",
        "Emerging Trends: Cloud Computing, IoT, Smart Cities & Blockchain"
      ],
      notes: "CBSE Subject Code 065. Comprehensive coverage of Computer Systems, Python, NumPy, SQL, and Emerging Trends."
    },
    englishcore: {
      chapters: [
        "Hornbill - Prose: The Portrait of a Lady",
        "Hornbill - Prose: We're Not Afraid to Die... if We Can All Be Together",
        "Hornbill - Prose: Discovering Tut: the Saga Continues",
        "Hornbill - Prose: The Adventure",
        "Hornbill - Prose: Silk Road",
        "Hornbill - Poetry: A Photograph",
        "Hornbill - Poetry: The Laburnum Top",
        "Hornbill - Poetry: The Voice of the Rain",
        "Hornbill - Poetry: Childhood",
        "Hornbill - Poetry: Father to Son",
        "Snapshots - Supplementary: The Summer of the Beautiful White Horse",
        "Snapshots - Supplementary: The Address",
        "Snapshots - Supplementary: Mother's Day",
        "Snapshots - Supplementary: Birth",
        "Snapshots - Supplementary: The Tale of Melon City",
        "Grammar & Writing: Classified Advertisements & Posters",
        "Grammar & Writing: Speech & Debate Writing",
        "Reading Skills: Unseen Passages, Note-Making & Summarization"
      ],
      notes: "CBSE English Core Subject Code 301 for Class 11. Prescribed books: Hornbill & Snapshots."
    },
    englishelective: {
      chapters: [
        "Woven Words - Short Stories: The Lament",
        "Woven Words - Short Stories: A Pair of Mustachios",
        "Woven Words - Short Stories: The Rocking-horse Winner",
        "Woven Words - Short Stories: The Adventure of the Three Garridebs",
        "Woven Words - Short Stories: Pappachi's Moth",
        "Woven Words - Short Stories: The Third and Final Continent",
        "Woven Words - Poetry: The Peacock",
        "Woven Words - Poetry: Let me Not to the Marriage of True Minds",
        "Woven Words - Poetry: Coming",
        "Woven Words - Poetry: Telephone Conversation",
        "Woven Words - Poetry: The World is too Much with Us",
        "Woven Words - Poetry: Mother Tongue",
        "Woven Words - Poetry: Hawk Roosting",
        "Woven Words - Poetry: Ode to a Nightingale",
        "Woven Words - Essays: My Watch",
        "Woven Words - Essays: My Three Passions",
        "Woven Words - Essays: Patterns of Creativity",
        "Woven Words - Essays: Tribal Verse",
        "Woven Words - Essays: What is a Good Book?",
        "Woven Words - Essays: The Story",
        "Woven Words - Essays: Bridges",
        "Drama: Arms and the Man (George Bernard Shaw)",
        "Fiction: The Old Man and the Sea (Ernest Hemingway)"
      ],
      notes: "CBSE English Elective Subject Code 001 for Class 11. Prescribed books: Woven Words, Arms and the Man, The Old Man and the Sea."
    },
    hindi_core: {
      chapters: [
        "आरोह - गद्य खंड: नमक का दरोगा",
        "आरोह - गद्य खंड: मियाँ नसीरुद्दीन",
        "आरोह - गद्य खंड: अपू के साथ ढाई साल",
        "आरोह - गद्य खंड: विदाई-संभाषण",
        "आरोह - गद्य खंड: गलता लोहा",
        "आरोह - गद्य खंड: रजनी",
        "आरोह - गद्य खंड: जामुन का पेड़",
        "आरोह - गद्य खंड: भारत माता",
        "आरोह - काव्य खंड: हम तौ एक एक करि जांनां",
        "आरोह - काव्य खंड: मेरे तो गिरधर गोपाल",
        "आरोह - काव्य खंड: घर की याद",
        "आरोह - काव्य खंड: चंपा काले-काले अच्छर नहीं चीन्हती",
        "आरोह - काव्य खंड: गज़ल (दुष्यंत कुमार)",
        "आरोह - काव्य खंड: हे भूख! मत मचल",
        "आरोह - काव्य खंड: सबसे खतरनाक",
        "आरोह - काव्य खंड: आओ, मिलकर बचाएँ",
        "वितान: भारतीय गायिकाओं में बेजोड़: लता मंगेशकर",
        "वितान: राजस्थान की रजत बूँदें",
        "वितान: आलो-आँधारि",
        "अभिव्यक्ति और माध्यम: जनसंचार माध्यम और लेखन",
        "अभिव्यक्ति और माध्यम: रचनात्मक लेखन",
        "अपठित बोध: अपठित गद्यांश एवं काव्यांश"
      ],
      notes: "सीबीएसई कक्षा 11 हिन्दी कोर पाठ्यक्रम।"
    },
    hindi_elective: {
      chapters: [
        "अंतरा - गद्य खंड: ईदगाह",
        "अंतरा - गद्य खंड: दोपहर का भोजन",
        "अंतरा - गद्य खंड: टॉर्च बेचने वाले",
        "अंतरा - गद्य खंड: गूँगे",
        "अंतरा - गद्य खंड: ज्योतिबा फुले",
        "अंतरा - गद्य खंड: खानाबदोश",
        "अंतरा - गद्य खंड: नए की जन्म कुंडली: एक",
        "अंतरा - गद्य खंड: उसकी माँ",
        "अंतरा - गद्य खंड: भारतवर्ष की उन्नति कैसे हो सकती है?",
        "अंतरा - काव्य खंड: कबीर (अरे इन दोहुन राह न पाई / बालम आवो हमारे गेह रे)",
        "अंतरा - काव्य खंड: सूरदास (खेलन में को काको गुसैयाँ / मुरली तऊ गोपालहिं भावति)",
        "अंतरा - काव्य खंड: देव (हँसी की चोट / सपना / दरबार)",
        "अंतरा - काव्य खंड: पद्माकर (औरै भाँति कुंजन में गुंजरत / गोकुल के कुल के गली के गोप)",
        "अंतरा - काव्य खंड: सुमित्रानंदन पंत (संध्या के बाद)",
        "अंतरा - काव्य खंड: महादेवी वर्मा (जाग तुझको दूर जाना / सब आँखों के आँसू उजले)",
        "अंतरा - काव्य खंड: नरेंद्र शर्मा (नींद उचट जाती है)",
        "अंतरा - काव्य खंड: नागार्जुन (बादल को घिरते देखा है)",
        "अंतरा - काव्य खंड: श्रीकांत वर्मा (हस्तक्षेप)",
        "अंतरा - काव्य खंड: धूमिल (घर में वापसी)",
        "अंतराल: अंडे के छिलके",
        "अंतराल: हुसैन की कहानी अपनी ज़बानी",
        "अंतराल: आवारा मसीहा",
        "अभिव्यक्ति और माध्यम: जनसंचार माध्यम",
        "अभिव्यक्ति और माध्यम: रचनात्मक लेखन",
        "अपठित बोध: अपठित गद्यांश एवं काव्यांश"
      ],
      notes: "सीबीएसई कक्षा 11 हिन्दी ऐच्छिक पाठ्यक्रम।"
    },
    history: {
      chapters: [
        "Writing and City Life",
        "An Empire Across Three Continents",
        "Nomadic Empires",
        "The Three Orders",
        "Changing Cultural Traditions",
        "Displacing Indigenous Peoples",
        "Paths to Modernisation"
      ],
      notes: "CBSE History Subject Code 027 for Class 11. Themes in World History."
    },
    geography: {
      chapters: [
        "Part A - Fundamentals of Physical Geography: 1. Geography as a Discipline",
        "Part A - Fundamentals of Physical Geography: 2. The Origin and Evolution of the Earth",
        "Part A - Fundamentals of Physical Geography: 3. Interior of the Earth",
        "Part A - Fundamentals of Physical Geography: 4. Distribution of Oceans and Continents",
        "Part A - Fundamentals of Physical Geography: 5. Geomorphic Processes",
        "Part A - Fundamentals of Physical Geography: 6. Landforms and their Evolution",
        "Part A - Fundamentals of Physical Geography: 7. Composition and Structure of Atmosphere",
        "Part A - Fundamentals of Physical Geography: 8. Solar Radiation, Heat Balance and Temperature",
        "Part A - Fundamentals of Physical Geography: 9. Atmospheric Circulation and Weather Systems",
        "Part A - Fundamentals of Physical Geography: 10. Water in the Atmosphere",
        "Part A - Fundamentals of Physical Geography: 11. World Climate and Climate Change",
        "Part A - Fundamentals of Physical Geography: 12. Water (Oceans)",
        "Part A - Fundamentals of Physical Geography: 13. Movements of Ocean Water",
        "Part A - Fundamentals of Physical Geography: 14. Biodiversity and Conservation",
        "Part B - India Physical Environment: 1. India – Location",
        "Part B - India Physical Environment: 2. Structure and Physiography",
        "Part B - India Physical Environment: 3. Drainage System",
        "Part B - India Physical Environment: 4. Climate",
        "Part B - India Physical Environment: 5. Natural Vegetation",
        "Part B - India Physical Environment: 6. Natural Hazards and Disasters",
        "Practical - Geography Practical Part I: 1. Introduction to Maps",
        "Practical - Geography Practical Part I: 2. Map Scale",
        "Practical - Geography Practical Part I: 3. Latitude, Longitude and Time",
        "Practical - Geography Practical Part I: 4. Map Projections",
        "Practical - Geography Practical Part I: 5. Topographical Maps",
        "Practical - Geography Practical Part I: 6. Introduction to Remote Sensing",
        "Map Work"
      ],
      notes: "CBSE Geography Subject Code 029 for Class 11. Covers Fundamentals of Physical Geography, India Physical Environment, and Practical Part I."
    },
    economics: {
      chapters: [
        "Statistics for Economics",
        "Introduction",
        "Collection, Organisation and Presentation of Data",
        "Statistical Tools and Interpretation",
        "Introductory Microeconomics",
        "Introduction",
        "Consumer's Equilibrium and Demand",
        "Producer Behaviour and Supply",
        "Perfect Competition: Price Determination and Simple Applications"
      ],
      notes: "CBSE Economics Subject Code 030 for Class 11."
    },
    accounts: {
      chapters: [
        "Part A - Financial Accounting I: Unit 1: Theoretical Framework",
        "Part A - Financial Accounting I: Unit 2: Accounting Process",
        "Part B - Financial Accounting II: Unit 3: Financial Statements of Sole Proprietorship"
      ],
      notes: "CBSE Accountancy Subject Code 055 for Class 11."
    },
    polscience: {
      chapters: [
        "Part A: Indian Constitution at Work - 1. Constitution: Why and How?",
        "Part A: Indian Constitution at Work - 2. Rights in the Indian Constitution",
        "Part A: Indian Constitution at Work - 3. Election and Representation",
        "Part A: Indian Constitution at Work - 4. Executive",
        "Part A: Indian Constitution at Work - 5. Legislature",
        "Part A: Indian Constitution at Work - 6. Judiciary",
        "Part A: Indian Constitution at Work - 7. Federalism",
        "Part A: Indian Constitution at Work - 8. Local Governments",
        "Part A: Indian Constitution at Work - 9. Constitution as a Living Document",
        "Part A: Indian Constitution at Work - 10. The Philosophy of the Constitution",
        "Part B: Political Theory - 1. Political Theory: An Introduction",
        "Part B: Political Theory - 2. Freedom",
        "Part B: Political Theory - 3. Equality",
        "Part B: Political Theory - 4. Social Justice",
        "Part B: Political Theory - 5. Rights",
        "Part B: Political Theory - 6. Citizenship",
        "Part B: Political Theory - 7. Nationalism",
        "Part B: Political Theory - 8. Secularism"
      ],
      notes: "CBSE Political Science Subject Code 028 for Class 11. Covers Part A (Indian Constitution at Work) and Part B (Political Theory)."
    },
    phyedu: {
      chapters: [
        "Changing Trends & Career in Physical Education",
        "Olympic Value Education",
        "Yoga",
        "Physical Education & Sports for Children with Special Needs (CWSN)",
        "Physical Fitness, Wellness and Lifestyle",
        "Test, Measurement & Evaluation",
        "Fundamentals of Anatomy and Physiology in Sports",
        "Fundamentals of Kinesiology and Biomechanics in Sports",
        "Psychology and Sports",
        "Training & Doping in Sports"
      ],
      notes: "CBSE Physical Education Subject Code 048 for Class 11."
    },
    finearts: {
      chapters: [
        "Pre-Historic Rock Paintings",
        "Art of the Indus / Sindhu Saraswati Civilization (Indus Valley Civilization)",
        "Buddhist, Jain and Hindu Art",
        "Temple Sculptures",
        "Indian Bronzes",
        "Artistic Aspects of Indo-Islamic Architecture"
      ],
      notes: "CBSE Fine Arts / Visual Arts curriculum for Class 11."
    },
    business: {
      chapters: [
        "Nature and Purpose of Business",
        "Forms of Business Organisations",
        "Public, Private and Global Enterprises",
        "Business Services",
        "Emerging Modes of Business",
        "Social Responsibility of Business and Business Ethics",
        "Sources of Business Finance",
        "Small Business",
        "Internal Trade",
        "International Business"
      ],
      notes: "CBSE Business Studies Subject Code 054 for Class 11."
    },
    applied_maths: {
      chapters: [
        "Numbers, Quantification and Numerical Applications",
        "Algebra (Complex Numbers, Sequences and Series, Permutations & Combinations)",
        "Mathematical Reasoning & Logical Reasoning",
        "Calculus (Limits, Continuity, Differentiation)",
        "Probability",
        "Descriptive Statistics",
        "Basics of Financial Mathematics (Interest, Annuity, Taxation)",
        "Coordinate Geometry"
      ],
      notes: "CBSE Applied Mathematics Subject Code 241 for Class 11."
    },
    psychology: {
      chapters: [
        "What is Psychology?",
        "Methods of Enquiry in Psychology",
        "Human Development",
        "Sensory, Attentional and Perceptual Processes",
        "Learning",
        "Human Memory",
        "Thinking",
        "Motivation and Emotion"
      ],
      notes: "CBSE Psychology Subject Code 037 for Class 11."
    },
    sociology: {
      chapters: [
        "Introducing Sociology: Sociology and Society",
        "Introducing Sociology: Terms, Concepts and their Use in Sociology",
        "Introducing Sociology: Understanding Social Institutions",
        "Introducing Sociology: Culture and Socialisation",
        "Understanding Society: Social Structure, Stratification and Social Processes",
        "Understanding Society: Social Change and Social Order in Rural and Urban Society",
        "Understanding Society: Western Sociologists",
        "Understanding Society: Indian Sociologists"
      ],
      notes: "CBSE Sociology Subject Code 039 for Class 11."
    },
    entrepreneurship: {
      chapters: [
        "Entrepreneurship: What, Why and How",
        "An Entrepreneur",
        "Entrepreneurial Journey",
        "Entrepreneurship as Innovation and Problem Solving",
        "Concept of Market",
        "Business Finance and Arithmetic",
        "Resource Mobilization"
      ],
      notes: "CBSE Entrepreneurship Subject Code 066 for Class 11."
    },
    sanskrit_core: {
      chapters: [
        "भास्वती भाग-1: प्रथमः पाठः - कुशलप्रशासनम्",
        "भास्वती भाग-1: द्वितीयः पाठः - सौवर्णो नकुलः",
        "भास्वती भाग-1: तृतीयः पाठः - सूक्तिसुधा",
        "भास्वती भाग-1: चतुर्थः पाठः - कल्पतरुः",
        "भास्वती भाग-1: पञ्चमः पाठः - सुवर्णकाकः",
        "व्याकरणम् एवं संस्कृत साहित्य परिचयः"
      ],
      notes: "सीबीएसई संस्कृत कोर (विषय कोड 322) कक्षा 11।"
    }
  },
  "12": {
    physics: {
      chapters: [
        "Electric Charges and Fields",
        "Electrostatic Potential and Capacitance",
        "Current Electricity",
        "Moving Charges and Magnetism",
        "Magnetism and Matter",
        "Electromagnetic Induction",
        "Alternating Current",
        "Electromagnetic Waves",
        "Ray Optics and Optical Instruments",
        "Wave Optics",
        "Dual Nature of Radiation and Matter",
        "Atoms",
        "Nuclei",
        "Semiconductor Electronics: Materials, Devices and Simple Circuits"
      ],
      notes: "CBSE Physics Subject Code 042 for Class 12. Focus on electrodynamics, optics, modern physics, and electronics."
    },
    chemistry: {
      chapters: [
        "Solutions",
        "Electrochemistry",
        "Chemical Kinetics",
        "d- and f-Block Elements",
        "Coordination Compounds",
        "Haloalkanes and Haloarenes",
        "Alcohols, Phenols and Ethers",
        "Aldehydes, Ketones and Carboxylic Acids",
        "Amines",
        "Biomolecules"
      ],
      notes: "CBSE Chemistry Subject Code 043 for Class 12. Covers Physical, Organic, and Inorganic Chemistry."
    },
    biology: {
      chapters: [
        "Sexual Reproduction in Flowering Plants",
        "Human Reproduction",
        "Reproductive Health",
        "Principles of Inheritance and Variation",
        "Molecular Basis of Inheritance",
        "Evolution",
        "Human Health and Diseases",
        "Microbes in Human Welfare",
        "Biotechnology – Principles and Processes",
        "Biotechnology and its Applications",
        "Organisms and Populations",
        "Ecosystem",
        "Biodiversity and its Conservation"
      ],
      notes: "CBSE Biology Subject Code 044 for Class 12."
    },
    maths: {
      chapters: [
        "Relations and Functions",
        "Inverse Trigonometric Functions",
        "Matrices",
        "Determinants",
        "Continuity and Differentiability",
        "Applications of Derivatives",
        "Integrals",
        "Applications of Integrals",
        "Differential Equations",
        "Vectors",
        "Three-dimensional Geometry",
        "Linear Programming",
        "Probability"
      ],
      notes: "CBSE Mathematics Code 041. Covers Units I-VI (Relations & Functions, Algebra, Calculus, Vectors & 3D Geometry, Linear Programming, Probability)."
    },
    cs: {
      chapters: [
        "Unit 1: Computational Thinking and Programming – II",
        "Unit 2: Computer Networks",
        "Unit 3: Database Management",
        "Revision of Python (Class XI)",
        "Python Functions & Exception Handling",
        "File Handling (Text, Binary, and CSV Files)",
        "Data Structure: Stack",
        "Computer Networks: Evolution, Media & Devices",
        "Network Topologies, Types & Protocols",
        "Introduction to Web Services",
        "Database Concepts & Relational Data Model",
        "Structured Query Language (SQL)",
        "Python–SQL Connectivity"
      ],
      notes: "CBSE Computer Science Subject Code 083 for Class 12."
    },
    ip: {
      chapters: [
        "Unit 1: Data Handling using Pandas and Data Visualization (Series, DataFrames, CSV, Matplotlib)",
        "Unit 2: Database Query using SQL (Functions, Group By, Having, Order By, Joins)",
        "Unit 3: Introduction to Computer Networks (Topologies, Devices, WWW, Web Hosting)",
        "Unit 4: Societal Impacts (Digital Footprint, Cyber Laws, IPR, E-waste)",
        "Python Libraries: Pandas and Matplotlib",
        "Pandas Series and DataFrames Operations",
        "Importing and Exporting CSV Files in Pandas",
        "Data Visualization using Matplotlib (Line, Bar, Histogram)",
        "SQL Single Row Functions (Math, Text, Date Functions)",
        "SQL Aggregate Functions and Grouping (GROUP BY, HAVING, ORDER BY)",
        "SQL Joins (Equi Join across multiple tables)",
        "Types of Computer Networks (PAN, LAN, MAN, WAN)",
        "Network Devices and Topologies (Star, Bus, Tree, Mesh)",
        "Web Services, Browsers, Cookies and Hosting",
        "Digital Footprint, Net Etiquettes and Data Protection",
        "Intellectual Property Rights (IPR), Copyright & FOSS",
        "Cybercrime, Cyber Laws and Indian IT Act",
        "E-waste and Health Concerns Related to Technology"
      ],
      notes: "CBSE Subject Code 065. Data analysis with Pandas, SQL queries and joins, Computer Networks, and Societal Impacts."
    },
    englishcore: {
      chapters: [
        "Flamingo - Prose: The Last Lesson",
        "Flamingo - Prose: Lost Spring",
        "Flamingo - Prose: Deep Water",
        "Flamingo - Prose: The Rattrap",
        "Flamingo - Prose: Indigo",
        "Flamingo - Prose: Poets and Pancakes",
        "Flamingo - Prose: The Interview",
        "Flamingo - Prose: Going Places",
        "Flamingo - Poetry: My Mother at Sixty-Six",
        "Flamingo - Poetry: Keeping Quiet",
        "Flamingo - Poetry: A Thing of Beauty",
        "Flamingo - Poetry: A Roadside Stand",
        "Flamingo - Poetry: Aunt Jennifer's Tigers",
        "Vistas - Supplementary: The Third Level",
        "Vistas - Supplementary: The Tiger King",
        "Vistas - Supplementary: Journey to the End of the Earth",
        "Vistas - Supplementary: The Enemy",
        "Vistas - Supplementary: On the Face of It",
        "Vistas - Supplementary: Memories of Childhood",
        "Creative Writing: Notice, Formal/Informal Invitations & Replies",
        "Creative Writing: Job Application with Resume & Letter to Editor",
        "Creative Writing: Article & Report Writing",
        "Reading Skills: Discursive & Case-based Factual Passages"
      ],
      notes: "CBSE English Core Subject Code 301 for Class 12. Prescribed books: Flamingo & Vistas."
    },
    englishelective: {
      chapters: [
        "Kaleidoscope - Short Stories: I Sell my Dreams",
        "Kaleidoscope - Short Stories: Eveline",
        "Kaleidoscope - Short Stories: A Wedding in Brownsville",
        "Kaleidoscope - Poetry: A Lecture Upon the Shadow",
        "Kaleidoscope - Poetry: Poems by Milton",
        "Kaleidoscope - Poetry: Poems by Blake",
        "Kaleidoscope - Poetry: Kubla Khan",
        "Kaleidoscope - Poetry: Trees",
        "Kaleidoscope - Poetry: The Wild Swans of Coole",
        "Kaleidoscope - Poetry: Time and Time Again",
        "Kaleidoscope - Non-Fiction: Freedom",
        "Kaleidoscope - Non-Fiction: The Mark on the Wall",
        "Kaleidoscope - Non-Fiction: Film-making",
        "Kaleidoscope - Non-Fiction: Why the Novel Matters",
        "Kaleidoscope - Non-Fiction: The Argumentative Indian",
        "Kaleidoscope - Drama: Chandalika (Rabindranath Tagore)",
        "Fiction: A Tiger for Malgudi (R.K. Narayan)",
        "Fiction: The Financial Expert (R.K. Narayan)",
        "Applied Grammar: Sentence Transformation",
        "Creative Writing: Discursive Writing & Essay Writing"
      ],
      notes: "CBSE English Elective Subject Code 001 for Class 12. Prescribed books: Kaleidoscope, A Tiger for Malgudi / The Financial Expert."
    },
    hindi_core: {
      chapters: [
        "आरोह - गद्य खंड: भक्तिन",
        "आरोह - गद्य खंड: बाजार दर्शन",
        "आरोह - गद्य खंड: काले मेघा पानी दे",
        "आरोह - गद्य खंड: पहलवान की ढोलक",
        "आरोह - गद्य खंड: शिरीष के फूल",
        "आरोह - गद्य खंड: श्रम विभाजन और जाति प्रथा",
        "आरोह - काव्य खंड: आत्मपरिचय / एक गीत",
        "आरोह - काव्य खंड: पतंग",
        "आरोह - काव्य खंड: कविता के बहाने / बात सीधी थी पर",
        "आरोह - काव्य खंड: कैमरे में बंद अपाहिज",
        "आरोह - काव्य खंड: उषा",
        "आरोह - काव्य खंड: बादल राग",
        "आरोह - काव्य खंड: कवितावली / लक्ष्मण-मूच्छॉ और राम का विलाप",
        "आरोह - काव्य खंड: रुबाइयाँ",
        "आरोह - काव्य खंड: छोटा मेरा खेत / बगुलों के पंख",
        "वितान: सिल्वर वैडिंग",
        "वितान: जूझ",
        "वितान: अतीत में दबे पाँव",
        "अभिव्यक्ति और माध्यम: विभिन्न माध्यमों के लिए लेखन",
        "अभिव्यक्ति और माध्यम: पत्रकारीय लेखन के विभिन्न रूप",
        "अभिव्यक्ति और माध्यम: विशेष लेखन - स्वरूप और प्रकार",
        "अभिव्यक्ति और माध्यम: कैसे बनती है कविता",
        "अभिव्यक्ति और माध्यम: नाटक लिखने का व्याकरण",
        "अभिव्यक्ति और माध्यम: कैसे लिखें कहानी",
        "अभिव्यक्ति और माध्यम: नए और अप्रत्याशित विषयों पर लेखन",
        "अपठित बोध: अपठित गद्यांश एवं काव्यांश"
      ],
      notes: "सीबीएसई कक्षा 12 हिन्दी कोर पाठ्यक्रम।"
    },
    hindi_elective: {
      chapters: [
        "अंतरा - गद्य खंड: प्रेमघन की छाया-स्मृति",
        "अंतरा - गद्य खंड: सुमिरिनी के मनके",
        "अंतरा - गद्य खंड: कच्चा चिट्ठा",
        "अंतरा - गद्य खंड: संवदिया",
        "अंतरा - गद्य खंड: गांधी, नेहरू और यासर अराफ़ात",
        "अंतरा - गद्य खंड: शेर, पहचान, चार हाथ, साझा",
        "अंतरा - गद्य खंड: जहाँ कोई वापसी नहीं",
        "अंतरा - गद्य खंड: यथास्मै रोचते विश्वम्",
        "अंतरा - गद्य खंड: कुटज",
        "अंतरा - काव्य खंड: देवसेना का गीत / कार्नेलिया का गीत",
        "    अंतरा - काव्य खंड: गीत गाने दो मुझे / सरोज स्मृति",
        "अंतरा - काव्य खंड: यह दीप अकेला / मैंने देखा एक बूंद",
        "    अंतरा - काव्य खंड: बनारस / दिशा",
        "अंतरा - काव्य खंड: सत्य / एक कम",
        "    ... (रघुवीर सहाय: तोड़ो / वसंत आया)",
        "अंतरा - काव्य खंड: भरत-राम का प्रेम / पद",
        "    ... (मलिक मुहम्मद जायसी: बारहमासा)",
        "अंतरा - काव्य खंड: पद (विद्यापति)",
        "    ... (घनानंद: कवित्त / सवैया)",
        "अंतराल: सूरदास की झोंपड़ी",
        "    • अंतराल: आरोहण",
        "    • अंतराल: बिस्कोहर की माटी",
        "    • अंतराल: अपना मालवा-खाऊ-उजाड़ू सभ्यता में",
        "अभिव्यक्ति और माध्यम: सृजनात्मक लेखन और पत्रकारीय आयाम",
        "अपठित बोध: अपठित गद्यांश एवं काव्यांश"
      ],
      notes: "सीबीएसई कक्षा 12 हिन्दी ऐच्छिक पाठ्यक्रम।"
    },
    history: {
      chapters: [
        "Bricks, Beads and Bones (The Harappan Civilisation)",
        "Kings, Farmers and Towns (Early States and Economies)",
        "Kinship, Caste and Class (Early Societies)",
        "Thinkers, Beliefs and Buildings (Cultural Developments)",
        "Through the Eyes of Travellers (Perceptions of Society)",
        "Bhakti-Sufi Traditions",
        "An Imperial Capital: Vijayanagara",
        "Peasants, Zamindars and the State",
        "Colonialism and the Countryside",
        "Rebels and the Raj",
        "Mahatma Gandhi and the Nationalist Movement",
        "Framing the Constitution"
      ],
      notes: "CBSE History Subject Code 027 for Class 12. Themes in Indian History Parts I, II, and III."
    },
    geography: {
      chapters: [
        "Part A - Fundamentals of Human Geography: 1. Human Geography",
        "Part A - Fundamentals of Human Geography: 2. The World Population Density, Distribution and Growth",
        "Part A - Fundamentals of Human Geography: 3. Human Development",
        "Part A - Fundamentals of Human Geography: 4. Primary Activities",
        "Part A - Fundamentals of Human Geography: 5. Secondary Activities",
        "Part A - Fundamentals of Human Geography: 6. Tertiary and Quaternary Activities",
        "Part A - Fundamentals of Human Geography: 7. Transport and Communication",
        "Part A - Fundamentals of Human Geography: 8. International Trade",
        "Part B - India: People and Economy: 1. Population Distribution, Density, Growth and Composition",
        "Part B - India: People and Economy: 2. Human Settlements",
        "Part B - India: People and Economy: 3. Land Resources and Agriculture",
        "Part B - India: People and Economy: 4. Water Resources",
        "Part B - India: People and Economy: 5. Mineral and Energy Resources",
        "Part B - India: People and Economy: 6. Planning and Sustainable Development in Indian Context",
        "Part B - India: People and Economy: 7. Transport and Communication",
        "Part B - India: People and Economy: 8. International Trade",
        "Part B - India: People and Economy: 9. Geographical Perspective on Selected Issues and Problems",
        "Practical - Geography Practical Part II: 1. Data – Its Source and Compilation",
        "Practical - Geography Practical Part II: 2. Data Processing",
        "Practical - Geography Practical Part II: 3. Graphical Representation of Data",
        "Practical - Geography Practical Part II: 4. Spatial Information Technology"
      ],
      notes: "CBSE Geography Subject Code 029 for Class 12. Covers Fundamentals of Human Geography, India: People and Economy, and Practical Part II."
    },
    economics: {
      chapters: [
        "Introductory Macroeconomics",
        "National Income and Related Aggregates",
        "Money and Banking",
        "Determination of Income and Employment",
        "Government Budget and the Economy",
        "Balance of Payments",
        "Indian Economic Development",
        "Development Experience (1947–90) and Economic Reforms since 1991",
        "Current Challenges Facing Indian Economy",
        "Development Experience of India – A Comparison with Neighbours"
      ],
      notes: "CBSE Economics Subject Code 030 for Class 12."
    },
    accounts: {
      chapters: [
        "Part A - Accounting for Partnership Firms and Companies: Unit 1: Accounting for Partnership Firms",
        "Part A - Accounting for Partnership Firms and Companies: Unit 2: Accounting for Companies",
        "Part B - Financial Statement Analysis: Unit 3: Analysis of Financial Statements",
        "Part B - Financial Statement Analysis: Unit 4: Cash Flow Statement",
        "Part B - Computerized Accounting (Optional): Unit 4: Computerized Accounting"
      ],
      notes: "CBSE Accountancy Subject Code 055 for Class 12."
    },
    polscience: {
      chapters: [
        "Part A: Contemporary World Politics - 1. The End of Bipolarity",
        "Part A: Contemporary World Politics - 2. Contemporary Centres of Power",
        "Part A: Contemporary World Politics - 3. Contemporary South Asia",
        "Part A: Contemporary World Politics - 4. International Organizations",
        "Part A: Contemporary World Politics - 5. Security in the Contemporary World",
        "Part A: Contemporary World Politics - 6. Environment and Natural Resources",
        "Part A: Contemporary World Politics - 7. Globalisation",
        "Part B: Politics in India Since Independence - 1. Challenges of Nation-Building",
        "Part B: Politics in India Since Independence - 2. Era of One-Party Dominance",
        "Part B: Politics in India Since Independence - 3. Politics of Planned Development",
        "Part B: Politics in India Since Independence - 4. India's External Relations",
        "Part B: Politics in India Since Independence - 5. Challenges to and Restoration of the Congress System",
        "Part B: Politics in India Since Independence - 6. The Crisis of Democratic Order",
        "Part B: Politics in India Since Independence - 7. Regional Aspirations",
        "Part B: Politics in India Since Independence - 8. Recent Developments in Indian Politics"
      ],
      notes: "CBSE Political Science Subject Code 028 for Class 12. Covers Part A (Contemporary World Politics) and Part B (Politics in India Since Independence)."
    },
    phyedu: {
      chapters: [
        "Management of Sporting Events",
        "Children and Women in Sports",
        "Yoga as Preventive Measure for Lifestyle Diseases",
        "Physical Education & Sports for Children with Special Needs (CWSN)",
        "Sports & Nutrition",
        "Test & Measurement in Sports",
        "Physiology & Injuries in Sports",
        "Biomechanics and Sports",
        "Psychology and Sports",
        "Training in Sports"
      ],
      notes: "CBSE Physical Education Subject Code 048 for Class 12."
    },
    finearts: {
      chapters: [
        "The Rajasthani School of Miniature Painting",
        "The Pahari School of Miniature Painting",
        "The Mughal School of Miniature Painting",
        "The Deccan School of Miniature Painting",
        "Indian National Flag",
        "The Bengal School of Painting",
        "The Modern Trends in Indian Art (Paintings, Graphic Prints, Sculptures)"
      ],
      notes: "CBSE Fine Arts / Visual Arts curriculum for Class 12."
    },
    business: {
      chapters: [
        "Nature and Significance of Management",
        "Principles of Management",
        "Business Environment",
        "Planning",
        "Organising",
        "Staffing",
        "Directing",
        "Controlling",
        "Financial Management",
        "Financial Markets",
        "Marketing Management",
        "Consumer Protection"
      ],
      notes: "CBSE Business Studies Subject Code 054 for Class 12."
    },
    applied_maths: {
      chapters: [
        "Numbers, Quantification and Numerical Applications",
        "Algebra (Matrices and Determinants)",
        "Calculus (Higher Order Derivatives, Application of Derivatives, Integrals, Differential Equations)",
        "Probability Distributions (Binomial, Poisson, Normal)",
        "Inferential Statistics",
        "Index Numbers and Time-Based Data",
        "Financial Mathematics (Perpetuity, Sinking Funds, CAGR, EMI, Returns)",
        "Linear Programming"
      ],
      notes: "CBSE Applied Mathematics Subject Code 241 for Class 12."
    },
    psychology: {
      chapters: [
        "Variations in Psychological Attributes",
        "Self and Personality",
        "Meeting Life Challenges (Stress and Coping)",
        "Psychological Disorders",
        "Therapeutic Approaches",
        "Attitude and Social Cognition",
        "Social Influence and Group Processes"
      ],
      notes: "CBSE Psychology Subject Code 037 for Class 12."
    },
    sociology: {
      chapters: [
        "Indian Society: The Demographic Structure of the Indian Society",
        "Indian Society: Social Institutions: Continuity and Change",
        "Indian Society: Patterns of Social Inequality and Exclusion",
        "Indian Society: The Challenges of Cultural Diversity",
        "Social Change and Development in India: Structural Change",
        "Social Change and Development in India: Cultural Change",
        "Social Change and Development in India: Change and Development in Rural Society",
        "Social Change and Development in India: Change and Development in Industrial Society",
        "Social Change and Development in India: Social Movements"
      ],
      notes: "CBSE Sociology Subject Code 039 for Class 12."
    },
    entrepreneurship: {
      chapters: [
        "Entrepreneurial Opportunity",
        "Entrepreneurial Planning",
        "Enterprise Marketing",
        "Enterprise Growth Strategies",
        "Business Arithmetic",
        "Resource Mobilization"
      ],
      notes: "CBSE Entrepreneurship Subject Code 066 for Class 12."
    },
    sanskrit_core: {
      chapters: [
        "भास्वती भाग-2: प्रथमः पाठः - अनुशासनम्",
        "भास्वती भाग-2: द्वितीयः पाठः - न कापि क्षतिः",
        "भास्वती भाग-2: तृतीयः पाठः - मातुराज्ञा गरीयसी",
        "भास्वती भाग-2: चतुर्थः पाठः - प्रजानुरञ्जको नृपः",
        "भास्वती भाग-2: पञ्चमः पाठः - दौवारिकस्य निष्ठा",
        "व्याकरणम् एवं अपठित अवबोधनम्"
      ],
      notes: "सीबीएसई संस्कृत कोर (विषय कोड 322) कक्षा 12।"
    }
  }
};

export function getCurriculumContext(classId: string, subjectId: string): string {
  const classCurriculum = CURRICULUM_DATA[classId];
  if (!classCurriculum) return "";
  
  const subjectCurriculum = classCurriculum[subjectId];
  if (!subjectCurriculum) return "";
  
  let context = `CBSE Curriculum Chapters:\n${subjectCurriculum.chapters.map((ch, idx) => `${idx + 1}. ${ch}`).join("\n")}`;
  if (subjectCurriculum.notes) {
    context += `\nSpecial Notes: ${subjectCurriculum.notes}`;
  }
  return context;
}
