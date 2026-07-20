export interface SubjectCurriculum {
  chapters: string[];
  notes?: string;
}

export const CURRICULUM_DATA: Record<string, Record<string, SubjectCurriculum>> = {
  "9": {
    maths: {
      chapters: [
        "Number Systems",
        "Polynomials",
        "Coordinate Geometry",
        "Linear Equations in Two Variables",
        "Introduction to Euclid's Geometry",
        "Lines and Angles",
        "Triangles",
        "Quadrilaterals",
        "Circles",
        "Heron's Formula",
        "Surface Areas and Volumes",
        "Statistics"
      ],
      notes: "CBSE curriculum strictly focus on proofs, theorems, and mathematical applications."
    },
    science: {
      chapters: [
        "Matter in Our Surroundings",
        "Is Matter Around Us Pure",
        "Atoms and Molecules",
        "Structure of the Atom",
        "The Fundamental Unit of Life: Cell",
        "Tissues",
        "Motion",
        "Force and Laws of Motion",
        "Gravitation",
        "Work and Energy",
        "Sound",
        "Improvement in Food Resources"
      ],
      notes: "Equal weightage to Physics, Chemistry, and Biology sections."
    },
    it: {
      chapters: [
        "Part A: Communication Skills-I, Self-Management Skills-I, ICT Skills-I, Entrepreneurial Skills-I, Green Skills-I",
        "Part B: Introduction to IT-ITeS Industry",
        "Data Entry and Keyboarding Skills",
        "Digital Documentation (Elementary)",
        "Electronic Spreadsheet (Elementary)",
        "Digital Presentation"
      ],
      notes: "CBSE Subject Code 402."
    },
    ai: {
      chapters: [
        "Part A: Employability Skills (Communication, Self-Management, ICT, Entrepreneurial, Green Skills)",
        "Part B: Introduction to Artificial Intelligence (AI)",
        "AI Project Cycle",
        "Neural Networks",
        "Introduction to Python"
      ],
      notes: "CBSE Subject Code 417."
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
        "History: The French Revolution, Socialism in Europe and the Russian Revolution, Nazism and the Rise of Hitler",
        "Geography: India - Size and Location, Physical Features of India, Drainage, Climate, Natural Vegetation and Wildlife, Population",
        "Civics: What is Democracy? Why Democracy?, Constitutional Design, Electoral Politics, Working of Institutions, Democratic Rights",
        "Economics: The Story of Village Palampur, People as Resource, Poverty as a Challenge, Food Security in India"
      ]
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
        "Triangles",
        "Coordinate Geometry",
        "Introduction to Trigonometry",
        "Some Applications of Trigonometry",
        "Circles",
        "Areas Related to Circles",
        "Surface Areas and Volumes",
        "Statistics",
        "Probability"
      ],
      notes: "Focus on standard mathematical derivations, trigonometric proofs, and board exam patterns."
    },
    science: {
      chapters: [
        "Chemical Reactions and Equations",
        "Acids, Bases and Salts",
        "Metals and Non-metals",
        "Carbon and its Compounds",
        "Life Processes",
        "Control and Coordination",
        "How do Organisms Reproduce?",
        "Heredity and Evolution",
        "Light - Reflection and Refraction",
        "The Human Eye and the Colorful World",
        "Electricity",
        "Magnetic Effects of Electric Current",
        "Our Environment"
      ],
      notes: "Emphasize chemical equations, ray diagrams, electrical circuit diagrams, and biological processes."
    },
    it: {
      chapters: [
        "Part A: Employability Skills (Communication, Self-Management, ICT, Entrepreneurial, Green Skills)",
        "Part B: Digital Documentation (Advanced)",
        "Electronic Spreadsheet (Advanced)",
        "Database Management System",
        "Web Applications and Security"
      ],
      notes: "CBSE Subject Code 402."
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
        "History: The Rise of Nationalism in Europe, Nationalism in India, The Making of a Global World, The Age of Industrialization, Print Culture and the Modern World",
        "Geography: Resources and Development, Forest and Wildlife Resources, Water Resources, Agriculture, Minerals and Energy Resources, Manufacturing Industries, Lifelines of National Economy",
        "Civics: Power Sharing, Federalism, Gender, Religion and Caste, Political Parties, Outcomes of Democracy",
        "Economics: Development, Sectors of the Indian Economy, Money and Credit, Globalization and the Indian Economy, Consumer Rights"
      ]
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
      notes: "Heavy emphasis on derivations, mathematical numericals, and dimensional analysis."
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
        "Hydrocarbons"
      ],
      notes: "Strict organic reaction mechanisms, physical chemistry numericals, and inorganic bonding concepts."
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
        "Cell: The Unit of Life",
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
      ]
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
        "Sequences and Series",
        "Straight Lines",
        "Conic Sections",
        "Introduction to Three Dimensional Geometry",
        "Limits and Derivatives",
        "Statistics",
        "Probability"
      ]
    },
    cs: {
      chapters: [
        "Computer Systems and Organisation",
        "Computational Thinking and Programming - 1 (Python variables, operators, conditionals, loops, strings, lists, tuples, dictionaries)",
        "Society, Law and Ethics"
      ],
      notes: "CBSE Subject Code 083. Core Python coding, syntax structure."
    },
    ip: {
      chapters: [
        "Introduction to Computer System",
        "Introduction to Python (Basics, control flow)",
        "Database concepts and Structured Query Language (SQL)",
        "Emerging Trends"
      ],
      notes: "CBSE Subject Code 065. Focus on basic coding and SQL queries."
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
      notes: "Focus on board-style derivations, circuit analysis, numericals, and optics diagrams."
    },
    chemistry: {
      chapters: [
        "Solutions",
        "Electrochemistry",
        "Chemical Kinetics",
        "d and f Block Elements",
        "Coordination Compounds",
        "Haloalkanes and Haloarenes",
        "Alcohols, Phenols and Ethers",
        "Aldehydes, Ketones and Carboxylic Acids",
        "Amines",
        "Biomolecules"
      ],
      notes: "High weightage to name reactions, synthesis mechanisms, electrochemistry numericals, and coordination IUPAC names."
    },
    biology: {
      chapters: [
        "Sexual Reproduction in Flowering Plants",
        "Human Reproduction",
        "Reproductive Health",
        "Principles of Inheritance and Variation",
        "Molecular Basis of Inheritance",
        "Evolution",
        "Human Health and Disease",
        "Microbes in Human Welfare",
        "Biotechnology: Principles and Processes",
        "Biotechnology and its Applications",
        "Organisms and Populations",
        "Ecosystem",
        "Biodiversity and Conservation"
      ]
    },
    maths: {
      chapters: [
        "Relations and Functions",
        "Inverse Trigonometric Functions",
        "Matrices",
        "Determinants",
        "Continuity and Differentiability",
        "Application of Derivatives",
        "Integrals",
        "Application of Integrals",
        "Differential Equations",
        "Vector Algebra",
        "Three Dimensional Geometry",
        "Linear Programming",
        "Probability"
      ],
      notes: "Emphasize Calculus (differentiation and integration), 3D Geometry, and Probability."
    },
    cs: {
      chapters: [
        "Computational Thinking and Programming - 2 (Python Functions, File Handling: Text, Binary, CSV, Python libraries)",
        "Computer Networks (Topologies, Protocols, Web services)",
        "Database Management (SQL queries, Joins, Group By, interface of Python with SQL)"
      ],
      notes: "CBSE Subject Code 083. Highly technical SQL and Python integration coding questions."
    },
    ip: {
      chapters: [
        "Data Handling using Pandas and Data Visualization using Matplotlib",
        "Database Query using SQL (Functions, Group By, Joins)",
        "Introduction to Computer Networks",
        "Societal Impacts"
      ],
      notes: "CBSE Subject Code 065. Data analysis commands, SQL functions, and societal ethics."
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
