import { PaperConfig } from "@/types";
import { getCurriculumContext } from "./curriculum-data";

export function buildGeminiPrompt(config: PaperConfig): string {
  const curriculumContext = getCurriculumContext(config.classId, config.subject);

  const isHindiSubject = 
    config.subject === "hindi" || 
    config.subject === "hindi_core" || 
    config.subject === "hindi_elective" || 
    config.subject === "हिन्दी" || 
    config.subject === "हिन्दी कोर" || 
    config.subject === "हिन्दी ऐच्छिक";

  // Parse distribution counts
  const dist = config.questionDistribution;
  const distributionDetails = `
  - Multiple Choice Questions (MCQ): ${dist.mcq} questions (1 mark each)
  - Assertion-Reason (AR): ${dist.assertionReason} questions (1 mark each)
  - Very Short Answer (VSA): ${dist.vsa} questions (2 marks each)
  - Short Answer (SA): ${dist.sa} questions (3 marks each)
  - Case Study / Source-Based (CS): ${dist.caseStudy} questions (4 marks each)
  - Long Answer (LA): ${dist.la} questions (5 marks each)
  `;

  // Language instructions
  let languagePrompt = "";
  if (config.language === "English") {
    languagePrompt = "All questions must be written strictly in the English language.";
  } else if (config.language === "Hindi") {
    languagePrompt = "All questions must be written strictly in the Hindi language (Devanagari script).";
  } else {
    languagePrompt = `Each question and its choices must be written bilingually: first write the English version, then write the Hindi translation directly below it (separated by a newline). 
    Example question text:
    "Evaluate the expression x^2 + 5x + 6 when x = 2.\nव्यंजक x^2 + 5x + 6 का मान ज्ञात कीजिए जब x = 2."`;
  }

  // Internal choice instructions
  const internalChoicePrompt = config.options.includeInternalChoice
    ? `For Short Answer (SA) and Long Answer (LA) questions, provide a choice option for at least 1 question in each section. Set the "orQuestion" field with the choice question text. If no choice is provided, set "orQuestion" to null.`
    : `Do not include any choice options. Set "orQuestion" to null for all questions.`;

  const unitWeightagePrompt = config.unitWeightage && config.unitWeightage.length > 0
    ? `--- OFFICIAL UNIT MARK ALLOCATION CONSTRAINT ---
The question paper MUST strictly respect the following official CBSE Unit Mark Allocations:
${config.unitWeightage.map((u) => `- Unit ${u.unit} (${u.topic}): ${u.marks} Marks`).join("\n")}
Ensure the questions generated across all sections roughly total these exact mark weightages per unit topic!`
    : "";

  const rawSubject = (config.isCustom ? (config.customSubject || config.subject) : config.subject) || "";
  const normSubject = rawSubject.toLowerCase().trim();
  const classStr = (config.isCustom ? (config.customClass || config.classId) : config.classId) || "";
  const isClass12 = classStr === "12" || classStr.toLowerCase().includes("12");
  const isEnglish = normSubject === "english" || normSubject === "englishcore" || normSubject.includes("english");
  const isClass12English = isClass12 && isEnglish;

  const isFullClass12EnglishExam =
    isClass12English &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 70);

  const isClass10 = classStr === "10" || classStr.toLowerCase().includes("10");
  const isHindi = normSubject === "hindi" || normSubject.includes("hindi") || normSubject.includes("हिन्दी");
  const isClass10Hindi = isClass10 && isHindi;

  const isFullClass10HindiExam =
    isClass10Hindi &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 70);

  const isPhysics = normSubject === "physics" || normSubject.includes("physics");
  const isClass12Physics = isClass12 && isPhysics;

  const isFullClass12PhysicsExam =
    isClass12Physics &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 65);

  const isCS = normSubject === "cs" || normSubject.includes("computer") || normSubject === "computerscience";
  const isClass12CS = isClass12 && isCS;

  const isFullClass12CSExam =
    isClass12CS &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 65);

  const isBiology = normSubject === "biology" || normSubject.includes("biology") || normSubject === "bio";
  const isClass12Biology = isClass12 && isBiology;

  const isFullClass12BiologyExam =
    isClass12Biology &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 65);

  const isEconomics =
    normSubject === "economics" ||
    normSubject.includes("economics") ||
    normSubject === "eco";
  const isClass12Economics = isClass12 && isEconomics;

  const isFullClass12EconomicsExam =
    isClass12Economics &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 70);

  const isGeography =
    normSubject === "geography" ||
    normSubject.includes("geography") ||
    normSubject === "geo";
  const isClass12Geography = isClass12 && isGeography;

  const isFullClass12GeographyExam =
    isClass12Geography &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 65);

  const englishClass12Constraint = isClass12English
    ? `--- CBSE CLASS 12 ENGLISH CORE (SUBJECT CODE 301) PRESCRIBED BOOKS DIRECTIVE ---
Prescribed NCERT Books & Chapters:
1. FLAMINGO (English Reader):
   - Prose: The Last Lesson, Lost Spring, Deep Water, The Rattrap, Indigo, Poets and Pancakes, The Interview, Going Places
   - Poetry: My Mother at Sixty-Six, Keeping Quiet, A Thing of Beauty, A Roadside Stand, Aunt Jennifer's Tigers
2. VISTAS (Supplementary Reader):
   - The Third Level, The Tiger King, Journey to the End of the Earth, The Enemy, On the Face of It, Memories of Childhood (The Cutting of My Long Hair & We Too are Human Beings)
3. CREATIVE WRITING SKILLS:
   - Notice (up to 50 words), Formal/Informal Invitations & Replies (up to 50 words), Letters (Job Application with bio-data/resume, Letter to Editor), Article/Report Writing (120-150 words)
4. READING SKILLS:
   - Unseen Passage (Factual, Descriptive or Literary) & Unseen Case-Based Factual Passage (with statistical data/charts)
All literature questions MUST strictly adhere to these prescribed books and chapters. Never invent questions from outside texts.`
    : "";

  const hindiClass10Constraint = isClass10Hindi
    ? `--- CBSE CLASS 10 HINDI 'A' (CODE 002) PRESCRIBED SYLLABUS DIRECTIVE ---
Prescribed NCERT Books & Chapters (Latest Edition):
1. क्षितिज भाग-2 (Kshitij Part 2):
   - काव्य खंड (Poetry): पद (सूरदास), राम-लक्ष्मण-परशुराम संवाद (तुलसीदास), आत्मकथ्य (जयशंकर प्रसाद), उत्साह और अट नहीं रही (सूर्यकांत त्रिपाठी 'निराला'), यह दंतुरित मुस्कान और फसल (नागार्जुन), संगतकार (मंगलेश डबराल)
   - गद्य खंड (Prose): नेताजी का चश्मा (स्वयं प्रकाश), बालगोबिन भगत (रामवृक्ष बेनीपुरी), लखनवी अंदाज़ (यशपाल), एक कहानी यह भी (मन्नू भंडारी), नौबतखाने में इबादत (यतींद्र मिश्र), संस्कृति (भदंत आनंद कौसल्यायन)
2. कृतिका भाग-2 (Kritika Part 2 - Supplementary Reader):
   - माता का आँचल (शिवपूजन सहाय), साना-साना हाथ जोड़ि (मधु कांकरिया), मैं क्यों लिखता हूँ? (अज्ञेय)
3. व्यावहारिक व्याकरण (Applied Grammar - 16 Marks):
   - रचना के आधार पर वाक्य भेद (सरल, संयुक्त, मिश्र वाक्य)
   - वाच्य (कर्तृवाच्य, कर्मवाच्य, भाववाच्य)
   - पद परिचय (संज्ञा, सर्वनाम, विशेषण, क्रिया, अव्यय)
   - अलंकार (अर्थालंकार: उपमा, रूपक, उत्प्रेक्षा, अतिशयोक्ति, मानवीकरण)
4. रचनात्मक लेखन (Creative Writing - 20 Marks):
   - अनुच्छेद लेखन (लगभग 120 शब्द, संकेत-बिंदुओं पर आधारित)
   - पत्र लेखन (औपचारिक अथवा अनौपचारिक, लगभग 100 शब्द)
   - स्ववृत्त लेखन अथवा ई-मेल लेखन (लगभग 80 शब्द)
   - विज्ञापन लेखन अथवा संदेश लेखन (लगभग 40 शब्द)
5. अपठित बोध (Reading Comprehension - 14 Marks):
   - अपठित गद्यांश (लगभग 250 शब्द, 7 अंक: 3 MCQs + 2 लघु उत्तरीय प्रश्न)
   - अपठित काव्यांश (लगभग 120 शब्द, 7 अंक: 3 MCQs + 2 लघु उत्तरीय प्रश्न)

STRICTLY DELETED / EXCLUDED CHAPTERS (NEVER GENERATE QUESTIONS FROM THESE):
- क्षितिज भाग-2 काव्य खंड: देव (सवैया, कवित्त), गिरिजाकुमार माथुर (छाया मत छूना), ऋतुराज (कन्यादान)
- क्षितिज भाग-2 गद्य खंड: महावीर प्रसाद द्विवेदी (स्त्री-शिक्षा के विरोधी कुतर्कों का खंडन), सर्वेश्वर दयाल सक्सेना (मानवीय करुणा की दिव्य चमक)
- कृतिका भाग-2: जॉर्ज पंचम की नाक, एही ठैयाँ झुलनी हेरानी हो रामा!
All generated questions MUST strictly adhere to these prescribed books and chapters. Never include deleted chapters.`
    : "";

  const physicsClass12Constraint = isClass12Physics
    ? `--- CBSE CLASS 12 PHYSICS (SUBJECT CODE 042) CURRICULUM & SYLLABUS DIRECTIVE ---
Prescribed NCERT Units & Chapters (Latest 2025-26 Curriculum):
1. Unit I: Electrostatics
   - Chapter-1: Electric Charges and Fields (Conservation of charge, Coulomb's law, superposition principle, continuous charge distribution, electric field, electric dipole, torque on dipole, electric flux, Gauss's theorem and applications: infinitely long wire, uniformly charged infinite plane sheet, thin spherical shell inside and outside)
   - Chapter-2: Electrostatic Potential and Capacitance (Electric potential, potential difference, potential due to point charge/dipole/system, equipotential surfaces, potential energy of 2 charges and dipole, conductors and dielectrics, capacitors in series and parallel, capacitance with/without dielectric, energy stored in capacitor - formula only)
2. Unit II: Current Electricity
   - Chapter-3: Current Electricity (Electric current, drift velocity, mobility, Ohm's law, V-I characteristics, electrical energy and power, resistivity, conductivity, temperature dependence, internal resistance, emf, combination of cells, Kirchhoff's rules, Wheatstone bridge)
3. Unit III: Magnetic Effects of Current and Magnetism
   - Chapter-4: Moving Charges and Magnetism (Biot-Savart law and circular loop, Ampere's law and infinitely long wire, straight solenoid qualitative, force on moving charge in E & B fields, force on current-carrying conductor, force between parallel conductors - definition of ampere, torque on current loop, moving coil galvanometer - sensitivity and conversion to ammeter/voltmeter)
   - Chapter-5: Magnetism and Matter (Bar magnet as equivalent solenoid, magnetic field intensity along axis & perpendicular to axis qualitative, torque on bar magnet qualitative, magnetic field lines, Para-, dia- and ferro-magnetic substances with examples, magnetization, temperature effect)
4. Unit IV: Electromagnetic Induction and Alternating Currents
   - Chapter-6: Electromagnetic Induction (Faraday's laws, induced EMF and current, Lenz's Law, self and mutual induction)
   - Chapter-7: Alternating Current (Peak and RMS value, reactance and impedance, LCR series circuit phasors, resonance, power in AC, power factor, wattless current, AC generator, Transformer)
5. Unit V: Electromagnetic Waves
   - Chapter-8: Electromagnetic Waves (Displacement current basic idea, characteristics, transverse nature qualitative, EM spectrum: radio, microwaves, infrared, visible, UV, X-rays, gamma rays and their uses)
6. Unit VI: Optics
   - Chapter-9: Ray Optics and Optical Instruments (Reflection, spherical mirrors, mirror formula, refraction, total internal reflection and optical fibers, spherical surface refraction, lens maker's formula, thin lenses in contact, prism refraction, microscopes and astronomical telescopes - reflecting & refracting, magnifying powers)
   - Chapter-10: Wave Optics (Wave front, Huygen's principle, reflection and refraction proof, Young's double slit experiment fringe width - formula only, coherent sources, single slit diffraction, width of central maxima qualitative)
7. Unit VII: Dual Nature of Radiation and Matter
   - Chapter-11: Dual Nature of Radiation and Matter (Photoelectric effect, Hertz & Lenard's observations, Einstein's photoelectric equation, de-Broglie relation)
8. Unit VIII: Atoms and Nuclei
   - Chapter-12: Atoms (Alpha-particle scattering, Rutherford model, Bohr model of H-atom, radius of nth orbit, velocity and energy of electron, hydrogen line spectra qualitative)
   - Chapter-13: Nuclei (Composition and size, nuclear force, mass-energy relation, mass defect, binding energy per nucleon and variation with mass number, nuclear fission and fusion)
9. Unit IX: Electronic Devices
   - Chapter-14: Semiconductor Electronics: Materials, Devices and Simple Circuits (Energy bands in conductors, semiconductors, insulators qualitative; intrinsic and extrinsic p & n type, p-n junction, I-V characteristics in forward and reverse bias, junction diode as rectifier)

STRICTLY DELETED / EXCLUDED TOPICS (NEVER GENERATE QUESTIONS ON THESE):
- Van de Graaff generator
- Colour code for carbon resistors, Meter Bridge, Potentiometer
- Cyclotron
- Magnetic dipole moment of revolving electron, Earth's magnetism elements (declination, dip, horizontal component)
- Eddy currents
- LC oscillations
- Human eye, defects of vision (myopia, hypermetropia, astigmatism, presbyopia), microscope/telescope resolving power, Brewster's law, polarisation
- Davisson-Germer experiment
- Radioactive decay law, alpha/beta/gamma decay, half-life and decay constant
- Zener diode, LED, Photodiode, Solar cell, Junction Transistor (all configurations), Transistor as amplifier/switch/oscillator, Logic gates

PHYSICS SPECIFIC RIGOR & QUALITY REQUIREMENTS:
- Proper balance between Conceptual questions (~50%) and Numerical problems (~30-35%), and Derivations (~15-20%).
- Competency-based, application-oriented, and diagram/graph-based questions must be incorporated where appropriate.`
    : "";

  const csClass12Constraint = isClass12CS
    ? `--- CBSE CLASS 12 COMPUTER SCIENCE (SUBJECT CODE 083) CURRICULUM & SYLLABUS DIRECTIVE ---
Prescribed Units & Topics (Latest 2025-26 Curriculum):
1. Unit 1: Computational Thinking and Programming - 2 (40 Marks)
   - Revision of Python topics covered in Class XI:
     * Python basics, tokens, keywords, identifiers, literals, operators, data types (mutable vs immutable: lists, tuples, strings, dictionaries, sets).
     * Conditional statements (if-elif-else), loops (for, while, range()), jump statements (break, continue, pass).
     * String methods and slicing; list operations and nested lists; tuple packing/unpacking; dictionary key-value operations.
   - Functions:
     * Types: built-in functions (len, type, id, min, max, sum, eval), functions defined in module (math: ceil, floor, pow, sqrt; random: random, randint, randrange), user-defined functions.
     * Creating functions using 'def', return statement(s).
     * Arguments & Parameters: positional arguments, default arguments, keyword arguments.
     * Scope of variables: local vs global scope, 'global' statement.
     * Flow of execution and call stack.
   - Exception Handling:
     * Handling exceptions using try-except-finally blocks, built-in exception types (ValueError, ZeroDivisionError, IndexError, KeyError, TypeError, FileNotFoundError).
   - File Handling:
     * Types of files: Text files, Binary files, CSV files. Relative vs absolute file paths.
     * Text Files: opening modes (r, r+, w, w+, a, a+), closing, opening using 'with' statement. Writing using write() and writelines(). Reading using read(), readline(), and readlines(). Using seek() and tell() methods. Data manipulation (counting vowels, consonants, specific words, uppercase/lowercase letters, lines starting with specific characters).
     * Binary Files: file open modes (rb, rb+, wb, wb+, ab, ab+), pickle module (dump() and load() methods). File operations: write/create, read, search records by primary key (roll no, employee id), append records, update records.
     * CSV Files: import csv module, opening modes, csv.writer() with writerow() and writerows(), csv.reader(), reading, writing, and searching tabular records.
   - Data Structures - Stack:
     * Stack concept (LIFO - Last In First Out).
     * Operations: Push (adding element), Pop (removing top element with underflow check), Peek/Display.
     * Implementation of stack using Python list.

2. Unit 2: Computer Networks (10 Marks)
   - Evolution of Networking: ARPANET, NSFNET, INTERNET.
   - Data Communication Terminologies: Concept of communication, sender, receiver, message, medium, protocols. Bandwidth, data transfer rates (bps, kbps, Mbps, Gbps). IP address, MAC address, packet switching vs circuit switching.
   - Transmission Media:
     * Wired/Guided: Twisted pair cable (UTP, STP), Co-axial cable, Fiber-optic cable.
     * Wireless/Unguided: Radio waves, Micro waves, Infrared waves.
   - Network Devices: Modem, Ethernet card, RJ45 connector, Repeater, Hub (active/passive), Switch, Router, Gateway, Wi-Fi card.
   - Network Topologies & Network Types:
     * Topologies: Bus, Star, Tree topologies.
     * Network Types: PAN, LAN, MAN, WAN.
   - Network Protocols: HTTP, HTTPS, FTP, PPP, SMTP, POP3, TCP/IP, TELNET, VoIP.
   - Web Services: WWW, HTML, XML, domain name system (DNS), URL, website, web browser, web servers, web hosting.

3. Unit 3: Database Management (20 Marks)
   - Database Concepts & Relational Data Model:
     * Relational model: relation (table), attribute (column), tuple (row), domain, degree (number of attributes), cardinality (number of tuples).
     * Keys: Candidate key, Primary key, Alternate key, Foreign key (referential integrity).
   - Structured Query Language (SQL):
     * DDL vs DML commands.
     * Data types: char(n), varchar(n), int, float, date (YYYY-MM-DD).
     * Constraints: NOT NULL, UNIQUE, PRIMARY KEY, DEFAULT.
     * SQL Commands:
       - CREATE DATABASE, USE, SHOW DATABASES, DROP DATABASE.
       - SHOW TABLES, CREATE TABLE, DESCRIBE / DESC, ALTER TABLE (ADD column, DROP column, MODIFY datatype, ADD PRIMARY KEY), DROP TABLE.
       - INSERT INTO ... VALUES ..., SELECT ... FROM ... WHERE ...
       - Operators: mathematical (+, -, *, /, %), relational (=, <, >, <=, >=, <>, !=), logical (AND, OR, NOT).
       - Clauses: alias (AS), DISTINCT, WHERE, IN, BETWEEN ... AND ..., ORDER BY (ASC, DESC), IS NULL, IS NOT NULL, LIKE (% and _).
       - UPDATE ... SET ... WHERE ..., DELETE FROM ... WHERE ...
       - Aggregate Functions: MAX(), MIN(), AVG(), SUM(), COUNT(), COUNT(*).
       - GROUP BY and HAVING clauses.
       - Joins: Cartesian product (Degree = deg1 + deg2, Cardinality = card1 * card2), Equi-join, Natural join.
   - Python-SQL Database Connectivity:
     * mysql.connector module.
     * Steps: connect(host, user, password, database), cursor(), execute(query), commit(), fetchone(), fetchall(), rowcount.
     * Parameterized queries using %s format specifier or format().

CRITICAL COMPUTER SCIENCE QUALITY & CODE ACCURACY DIRECTIVE:
1. Python Code Validity: All Python code in questions and solutions MUST be 100% syntactically valid Python 3.x code.
2. Determinate Outputs: All output-predicting questions must yield exact, deterministic outputs (check string indexing, loop bounds, and end=" " / sep=" " parameters carefully).
3. SQL Queries: Must use standard ANSI/MySQL syntax, matching provided table schemas and data.
4. Backslash Escaping: Always double-escape backslashes in JSON (write \\\\n instead of \\n).`
    : "";

  const biologyClass12Constraint = isClass12Biology
    ? `--- CBSE CLASS 12 BIOLOGY (SUBJECT CODE 044) CURRICULUM & SYLLABUS DIRECTIVE ---
Prescribed Units & Chapters (Latest 2025-26 Curriculum):
1. Unit I: Reproduction (15 Marks)
   - Chapter-1: Sexual Reproduction in Flowering Plants (Flower structure; development of male and female gametophytes; pollination - types, agencies and examples; outbreeding devices; pollen-pistil interaction; double fertilization; post fertilization events - development of endosperm and embryo, development of seed and formation of fruit; special modes - apomixis, parthenocarpy, polyembryony; Significance of seed dispersal and fruit formation).
   - Chapter-2: Human Reproduction (Male and female reproductive systems; microscopic anatomy of testis and ovary; gametogenesis - spermatogenesis and oogenesis; menstrual cycle; fertilisation, embryo development upto blastocyst formation, implantation; pregnancy and placenta formation; parturition; lactation).
   - Chapter-3: Reproductive Health (Need for reproductive health and prevention of STDs; birth control - need and methods, contraception and medical termination of pregnancy - MTP; amniocentesis; infertility and assisted reproductive technologies - IVF, ZIFT, GIFT).
2. Unit II: Genetics and Evolution (20 Marks)
   - Chapter-4: Principles of Inheritance and Variation (Heredity and variation, Mendelian inheritance; deviations from Mendelism - incomplete dominance, co-dominance, multiple alleles and inheritance of blood groups, pleiotropy; elementary idea of polygenic inheritance; chromosome theory of inheritance; chromosomes and genes; Sex determination in humans, birds and honey bee, linkage and crossing over; sex-linked inheritance - haemophilia, colour blindness; Mendelian disorders in humans - thalassemias; chromosomal disorders in humans - Down's syndrome, Turner's and Klinefelter's syndromes).
   - Chapter-5: Molecular Basis of Inheritance (Search for genetic material and DNA as genetic material; Structure of DNA and RNA; DNA packaging; DNA replication; Central Dogma; transcription, genetic code, translation; gene expression and regulation - lac operon; Genome, Human and rice genome project; DNA fingerprinting).
   - Chapter-6: Evolution (Origin of life; biological evolution and evidences for biological evolution: paleontology, comparative anatomy, embryology and molecular evidences; Darwin's contribution, modern synthetic theory of evolution; mechanism of evolution - variation by mutation and recombination and natural selection with examples, types of natural selection; Gene flow and genetic drift; Hardy-Weinberg's principle; adaptive radiation; human evolution).
3. Unit III: Biology and Human Welfare (14 Marks)
   - Chapter-7: Human Health and Diseases (Pathogens; parasites causing human diseases: malaria, dengue, chikungunya, filariasis, ascariasis, typhoid, pneumonia, common cold, amoebiasis, ring worm and their control; Basic concepts of immunology - vaccines; cancer, HIV and AIDS; Adolescence - drug and alcohol abuse).
   - Chapter-8: Microbes in Human Welfare (Microbes in food processing, industrial production, sewage treatment, energy generation - biogas, and microbes as bio-control agents and bio-fertilizers; Antibiotics - production and judicious use).
4. Unit IV: Biotechnology and its Applications (11 Marks)
   - Chapter-9: Biotechnology - Principles and Processes (Genetic Engineering - Recombinant DNA Technology, tools: restriction enzymes, DNA ligase, cloning vectors pBR322, competent hosts; processes of recombinant DNA technology: isolation of DNA, PCR, insertion, bioreactors, downstream processing).
   - Chapter-10: Biotechnology and its Applications (Applications of biotechnology in health and agriculture: Human insulin production, vaccine production, stem cell technology, gene therapy - ADA deficiency; genetically modified organisms - Bt crops: Bt cotton, pest-resistant tobacco; transgenic animals; biosafety issues, biopiracy and patents).
5. Unit V: Ecology and Environment (10 Marks)
   - Chapter-11: Organisms and Populations (Population interactions - mutualism, competition, predation, parasitism; population attributes - growth models: exponential and logistic growth, birth rate, death rate, age distribution pyramids).
   - Chapter-12: Ecosystem (Ecosystem patterns, components, productivity: primary and secondary, decomposition; energy flow, 10% law; ecological pyramids: pyramids of number, biomass, energy).
   - Chapter-13: Biodiversity and Conservation (Biodiversity: concept, patterns - latitudinal gradients and species-area relationship, importance and rivet popper hypothesis; loss of biodiversity - evil quartet; biodiversity conservation: in-situ and ex-situ; hotspots, endangered organisms, extinction, Red Data Book, Sacred Groves, biosphere reserves, national parks, wildlife sanctuaries, Ramsar sites).

STRICTLY DELETED / EXCLUDED TOPICS (NEVER GENERATE QUESTIONS FROM THESE):
- Chapter Reproduction in Organisms (old Chapter 1) is completely DELETED.
- Chapter Strategies for Enhancement in Food Production (old Chapter 9) is completely DELETED.
- Chapter Environmental Issues (old Chapter 16) is completely DELETED.
- In Chapter 11 (Organisms and Populations): "Organism and its Environment", "Major Abiotic Factors (temperature, water, light, soil)", "Responses to Abiotic Factors (regulate, conform, migrate, suspend)", and "Adaptations" are EXCLUDED.
- In Chapter 12 (Ecosystem): "Ecological Succession" (hydrarch and xerarch) and "Nutrient Cycles" (carbon cycle and phosphorus cycle) are EXCLUDED.

CRITICAL BIOLOGY QUALITY & ACCURACY DIRECTIVE:
1. Biological Terminology: Use standard, precise biological terminology and correct binomial nomenclature conventions (e.g. Escherichia coli, Pisum sativum, Plasmodium vivax, Haemophilus influenzae).
2. Genetic Crosses: Represent genotypes, alleles, gametes, and Punnett squares clearly with accurate phenotypic and genotypic ratios.
3. Diagrams & Processes: Questions requiring diagrams (e.g., human reproductive anatomy, anther/ovule, antibody molecule, lac operon, cloning vector, PCR cycles, biogas plant) must clearly describe the required labels and steps.
4. Competency & Application: Incorporate case-based scenarios, experimental observations, and pedigree/data analysis where required by the blueprint.`
    : "";

  const economicsClass12Constraint = isClass12Economics
    ? `--- CBSE CLASS 12 ECONOMICS (SUBJECT CODE 030) CURRICULUM & SYLLABUS DIRECTIVE ---
Prescribed Books, Units & Topics (Latest 2025-26 Curriculum, Theory: 80 Marks, 3 Hours):

PART-A: INTRODUCTORY MACROECONOMICS (40 Marks)
1. Unit 1: National Income and Related Aggregates (10 Marks, 30 Periods)
   - What is Macroeconomics?
   - Basic concepts in macroeconomics: consumption goods, capital goods, final goods, intermediate goods; stocks and flows; gross investment and depreciation.
   - Circular flow of income (two sector model).
   - Methods of calculating National Income: Value Added or Product method, Expenditure method, Income method.
   - Aggregates related to National Income: Gross National Product (GNP), Net National Product (NNP), Gross Domestic Product (GDP) and Net Domestic Product (NDP) - at market price and factor cost; Real and Nominal GDP.
   - GDP Deflator, GDP and Welfare.

2. Unit 2: Money and Banking (06 Marks, 15 Periods)
   - Money: meaning and functions, supply of money - Currency held by the public and net demand deposits held by commercial banks.
   - Money creation by the commercial banking system (credit multiplier process).
   - Central bank and its functions (Reserve Bank of India): Bank of issue, Government's Bank, Banker's Bank, Control of Credit through Bank Rate, Cash Reserve Ratio (CRR), Statutory Liquidity Ratio (SLR), Repo Rate and Reverse Repo Rate, Open Market Operations, Margin requirement.

3. Unit 3: Determination of Income and Employment (12 Marks, 30 Periods)
   - Aggregate demand and its components.
   - Propensity to consume and propensity to save (average and marginal).
   - Short-run equilibrium output; investment multiplier and its mechanism.
   - Meaning of full employment and involuntary unemployment.
   - Problems of excess demand and deficient demand; measures to correct them - changes in government spending, taxes and money supply.

4. Unit 4: Government Budget and the Economy (06 Marks, 17 Periods)
   - Government budget: meaning, objectives and components.
   - Classification of receipts: revenue receipts and capital receipts.
   - Classification of expenditure: revenue expenditure and capital expenditure.
   - Balanced, Surplus and Deficit Budget: measures of government deficit (revenue deficit, fiscal deficit, primary deficit).

5. Unit 5: Balance of Payments (06 Marks, 18 Periods)
   - Balance of payments account: meaning and components (Current account, Capital account).
   - Balance of payments: Surplus and Deficit.
   - Foreign exchange rate: meaning of fixed and flexible rates and managed floating.
   - Determination of exchange rate in a free market, Merits and demerits of flexible and fixed exchange rate.
   - Managed Floating exchange rate system.

PART-B: INDIAN ECONOMIC DEVELOPMENT (40 Marks)
6. Unit 6: Development Experience (1947-90) and Economic Reforms since 1991 (12 Marks, 28 Periods)
   - State of Indian economy on the eve of independence. Indian economic system and common goals of Five Year Plans.
   - Main features, problems and policies of agriculture (institutional aspects and new agricultural strategy / Green Revolution), industry (IPR 1956; SSI - role & importance) and foreign trade (import substitution policy).
   - Economic Reforms since 1991: Features and appraisals of liberalisation, globalisation and privatisation (LPG policy); Concepts of demonetization and GST (Goods and Services Tax).

7. Unit 7: Current Challenges Facing Indian Economy (20 Marks, 60 Periods)
   - Human Capital Formation: How people become resource; Role of human capital in economic development; Growth of Education Sector in India.
   - Rural development: Key issues - credit and marketing - role of cooperatives; agricultural diversification; alternative farming - organic farming.
   - Employment: Growth and changes in work force participation rate in formal and informal sectors; problems and policies of unemployment.
   - Sustainable Economic Development: Meaning, Effects of Economic Development on Resources and Environment, including global warming.

8. Unit 8: Development Experience of India: A Comparison with Neighbours (08 Marks, 12 Periods)
   - India and Pakistan, India and China.
   - Issues: economic growth, population, sectoral development (agriculture, industry, services), and other Human Development Indicators (HDI).

CRITICAL ASSESSMENT FRAMEWORK & TYPOLOGY (IMAGES 3 & 4):
1. Remembering & Understanding (32-44 Marks, 40%-55%): Definitions, economic concepts, distinctions (e.g. intermediate vs final goods, stock vs flow, revenue vs capital expenditure, current vs capital account, formal vs informal employment), comparisons, and explanations.
2. Applying (18-24 Marks, 22.5%-30%): Numerical problems on National Income calculation (Income, Expenditure, Value-Added methods), Multiplier, MPC/MPS, Deficits; diagram-based AD-AS and S-I equilibrium questions; monetary policy tools applications.
3. Analysing, Evaluating & Creating (18-24 Marks, 22.5%-30%): Case studies, comparative data interpretation tables (India vs China vs Pakistan HDI data), policy appraisals (LPG, Demonetization, GST), critical evaluation essays.

CRITICAL ECONOMICS ACCURACY & CALCULATION DIRECTIVE:
1. Complete & Consistent Numerical Data: All calculation questions (National Income aggregates, Multiplier, Equilibrium Income, Fiscal Deficit) must provide logically consistent data with all required components clearly defined.
2. Correct Arithmetic & Units: Solutions must show complete formula, substitution, calculation, and final answer in ₹ Crores or appropriate units.
3. Assertion-Reasoning & Statements: When generating Assertion-Reason or Statement 1 & 2 questions, ensure the factual statements and causal connections are economically sound and accurately tested.`
    : "";

  const geographyClass12Constraint = isClass12Geography
    ? `--- CBSE CLASS 12 GEOGRAPHY (SUBJECT CODE 029) CURRICULUM & SYLLABUS DIRECTIVE ---
Prescribed NCERT Textbooks & Syllabus (Latest 2025-26 Curriculum, Theory: 70 Marks, 3 Hours):

BOOK 1: FUNDAMENTALS OF HUMAN GEOGRAPHY (35 Marks Total)
1. Unit I: Human Geography: Nature and Scope (Chapter 1) - 3 Marks
   - Introduction to Human Geography, approaches to study (regional, systematic, dualism), nature of human geography, naturalisation of humans and humanisation of nature, schools of thought (environmental determinism, possibilism, neo-determinism / stop-and-go determinism), fields and sub-fields.
2. Unit II: People (Chapters 2 & 3) - 8 Marks
   - Chapter 2: The World Population Distribution, Density and Growth (Distribution, density, factors influencing distribution, population growth, components of change: CBR, CDR, migration push-pull factors, demographic transition 3 stages, population control measures).
   - Chapter 3: Human Development (Concept, growth vs development, four pillars: equity, sustainability, productivity, empowerment; approaches: income, welfare, basic needs, capability; measuring human development: HDI, HPI, GNH; international comparisons).
3. Unit III: Human Activities, Transport, Communication and Trade (Chapters 4 to 8) - 19 Marks
   - Chapter 4: Primary Activities (Hunting and gathering, pastoralism: nomadic herding, commercial livestock rearing; agriculture types: primitive subsistence, intensive subsistence, plantation, extensive commercial grain, mixed farming, dairy farming, Mediterranean, market gardening/horticulture, cooperative, collective farming; mining: factors and methods - surface vs underground).
   - Chapter 5: Secondary Activities (Manufacturing characteristics, location factors, classification by size: household, small-scale, large-scale; by inputs: agro, mineral, chemical, forest, animal-based; by output: basic, consumer; by ownership: public, private, joint; concept of high-tech industries / technopolies).
   - Chapter 6: Tertiary and Quaternary Activities (Tertiary concept, trade & commerce: retail and wholesale, rural/urban marketing centres; transport factors and networks; communication services; tourism and medical tourism in India; quaternary and quinary activities, the digital divide).
   - Chapter 7: Transport, Communication and Trade (Land transport: roadways, highways, border roads; transcontinental railways: Trans-Siberian, Trans-Canadian, Australian Trans-Continental; water transport: major sea routes, shipping canals - Suez, Panama, inland waterways - Rhine, Danube, Volga, St. Lawrence Seaways; air transport; pipelines - Big Inch; satellite communication and cyberspace).
   - Chapter 8: International Trade (Basis of international trade, balance of trade, bilateral and multilateral trade, free trade, dumping, WTO, regional trade blocs, gateways of trade: ports and types).
4. Map Work: World Political Map (Identification of 5 features) - 5 Marks

BOOK 2: INDIA: PEOPLE AND ECONOMY (35 Marks Total)
1. Unit I: Population: Distribution, Density, Growth and Composition (Chapter 1) - 5 Marks
   - Distribution, density, growth (four distinct phases: 1901-21, 1921-51, 1951-81, 1981-present), regional variation in growth, composition: rural-urban, linguistic, religious, working population (main, marginal, non-workers), 'Beti Bachao-Beti Padhao' campaign.
2. Unit II: Human Settlements (Chapter 2) - 3 Marks
   - Rural settlement types (clustered, semi-clustered, hamleted, dispersed); urban settlements: evolution of towns (ancient, medieval, modern), urbanisation in India, functional classification of towns, Smart Cities Mission.
3. Unit III: Resources and Development (Chapters 3 to 6) - 10 Marks
   - Chapter 3: Land Resources and Agriculture (Land-use categories and changes, common property resources, agricultural land use, cropping seasons: Kharif, Rabi, Zaid; types of farming: wetland, dryland; major crops: rice, wheat, tea, coffee, cotton, jute, sugarcane, rubber; agricultural development, Green Revolution, problems of Indian agriculture).
   - Chapter 4: Water Resources (Surface and groundwater resources, lagoons, water demand/utilisation, water quality deterioration, conservation and watershed management: Haryali, Neeru-Meeru, Arvary Pani Sansad; rainwater harvesting).
   - Chapter 5: Mineral and Energy Resources (Types: metallic ferrous/non-ferrous, non-metallic; major mineral belts; iron ore, manganese, bauxite, copper, mica; conventional energy: coal - Gondwana/Tertiary, petroleum, natural gas; non-conventional energy: nuclear, solar, wind, tidal, geothermal, bio-energy; conservation).
   - Chapter 6: Planning and Sustainable Development in Indian Context (Target area planning: Hill Area, Drought Prone Area programmes; concept of sustainable development - Brundtland Report; Case studies: Bharmaur ITDP, Indira Gandhi Canal Command Area).
4. Unit IV: Transport, Communication and International Trade (Chapters 7 & 8) - 7 Marks
   - Chapter 7: Transport and Communication (Roads: Golden Quadrilateral, corridors; railways, Dedicated Freight Corridors; pipelines; water transport: National Waterways NW-1, NW-2, NW-3, oceanic; air transport; communication networks).
   - Chapter 8: International Trade (Changing pattern of exports/imports, direction of trade, sea ports and their hinterlands: Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia; major international airports).
5. Unit V: Geographical Perspective on Selected Issues and Problems (Chapter 9) - 5 Marks
   - Environmental pollution (air, water, land, noise), urban-waste disposal, rural-urban migration case study, problems of slums (Dharavi), land degradation.
6. Map Work: India Political Map (Locating and Labelling 5 features) - 5 Marks

FORMATIVE-ONLY TOPICS (DO NOT TEST IN SUMMATIVE BOARD/ANNUAL EXAM PAPERS):
- Book 1: "Population Composition" (Sex Composition, Age Structure, Age-Sex Pyramid, Rural-Urban, Literacy, Occupation) and "Human Settlements" (Classification, Rural Patterns, Problems, Urban Classification) are assessed formatively only.
- Book 2: "Migration" (Types, Causes, Consequences) is assessed formatively only.

OFFICIAL PRESCRIBED MAP WORK ITEMS (PAGE 5, 7, 9 OF PDF):
- World Map (Identification):
  * Transcontinental Railways Terminals: Trans-Siberian (St. Petersburg to Vladivostok), Trans-Canadian (Halifax to Vancouver), Australian Trans-Continental (Perth to Sydney).
  * Major Sea Ports: Europe (North Cape, London, Hamburg), North America (Vancouver, San Francisco, New Orleans), South America (Rio de Janeiro, Colon, Valparaiso), Africa (Suez, Cape Town), Asia (Yokohama, Shanghai, Hong Kong, Aden, Karachi, Kolkata), Australia (Perth, Sydney, Melbourne).
  * Major Airports: Tokyo, Beijing, Mumbai, Jeddah, Aden, Johannesburg, Nairobi, Moscow, London, Paris, Berlin, Rome, Chicago, New Orleans, Mexico City, Buenos Aires, Santiago, Darwin, Wellington.
  * Canals & Waterways: Suez Canal, Panama Canal, Rhine waterways, St. Lawrence Seaways.
  * Primary Agricultural Regions: Subsistence gathering, nomadic herding, commercial livestock rearing, extensive commercial grain farming, mixed farming.
- India Map (Locating & Labelling):
  * State with highest population density (Bihar) & lowest population density (Arunachal Pradesh).
  * Leading crop producing states: Rice (West Bengal/UP), Wheat (UP/Punjab), Cotton (Gujarat/Maharashtra), Jute (West Bengal), Sugarcane (UP), Tea (Assam), Coffee (Karnataka).
  * Mines & Refineries: Iron-ore (Mayurbhanj, Bailadila, Ratnagiri, Bellary), Manganese (Balaghat, Shimoga), Copper (Hazaribagh, Singhbhum, Khetri), Bauxite (Katni, Bilaspur, Koraput), Coal (Jharia, Bokaro, Raniganj, Neyveli), Oil Refineries (Mathura, Jamnagar, Barauni).
  * Major Sea Ports: Kandla, Mumbai, Marmagao, Kochi, Mangalore, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia.
  * Major Airports: Ahmedabad, Mumbai, Bengaluru, Chennai, Kolkata, Guwahati, Delhi, Amritsar, Thiruvananthapuram, Hyderabad.

COGNITIVE DOMAINS & ASSESSMENT TYPOLOGY (PAGE 8 OF PDF):
1. Remembering and Understanding: 41% (~29 Marks) - Recalling facts, terms, concepts, data; comparisons, descriptions.
2. Application: 37% (~26 Marks) - Applying geographical concepts to new scenarios, interpreting maps, policy implementations.
3. Analysing, Evaluating and Creating: 22% (~15 Marks) - Source analysis, case studies, evaluating sustainable development, synthesis.

CRITICAL GEOGRAPHY ACCURACY DIRECTIVE:
1. Map Questions: Map questions must explicitly name geographical features, states, ports, mines, and terminals strictly from the official CBSE prescribed syllabus list above.
2. Source/Case Studies: Source-based questions must provide realistic passages/data from NCERT context followed by 3 sub-questions (1 mark each).
3. Precision: Use standard geographical terms (e.g. demographic transition, carrying capacity, hinterland, watershed, non-metallic minerals, technopolies).`
    : "";

  const hindiConstraint = isHindiSubject
    ? `9. HINDI SUBJECT SPECIAL DIRECTIVE: The entire output MUST be generated in formal, standard CBSE Hindi (Devanagari script).
       - Section names MUST be in Devanagari (e.g. "खण्ड क", "खण्ड ख", "खण्ड ग", "खण्ड घ", "खण्ड ङ").
       - Section descriptions MUST be in Devanagari (e.g. "बहुविकल्पीय प्रश्न", "अति लघु उत्तरीय प्रश्न", "केस स्टडी प्रश्न").
       - All question text, reading comprehensions, passages, poem verses, multiple-choice options, and choices must be written in natural, grammatically correct, and official CBSE Hindi language. Do not use English translations or english subtitles.
       - Assertion-Reason options must be translated to standard Hindi:
         (A) A और R दोनों सत्य हैं और R, A की सही व्याख्या करता है।
         (B) A और R दोनों सत्य हैं लेकिन R, A की सही व्याख्या नहीं करता है।
         (C) A सत्य है लेकिन R असत्य है।
         (D) A असत्य है लेकिन R सत्य है。`
    : "";

  const solutionDirective = config.options.includeAnswerKey !== false
    ? `3. DETAILED SOLUTIONS & MARKING SCHEME: For EVERY question, you MUST populate the "solution" field with a complete, curriculum-compliant solution:
       - For MCQs & Assertion-Reason: State the correct option letter (e.g. "(A) Option Text") followed by a 1-2 sentence explanation.
       - For VSA, SA, LA, and Case Study: Provide step-by-step working/answers along with official CBSE marking scheme allocations (e.g. "[1 Mark for formula, 2 Marks for derivation, 1 Mark for final answer]").
       - If an internal choice ("orQuestion") is present, also populate "orSolution" with the step-by-step solution for the choice question.`
    : `3. ANSWERS INSTRUCTION: Do NOT generate answers. Set "solution" and "orSolution" to null.`;

  // Specialized prompt for Full Class 12 English Board / Pre-Board / Sample / Half-Yearly Papers (80 Marks, 3 Sections, 13 Questions)
  if (isFullClass12EnglishExam) {
    return buildClass12EnglishFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 10 Hindi Board / Pre-Board / Sample / Half-Yearly Papers (80 Marks, 4 Sections, 15 Questions)
  if (isFullClass10HindiExam) {
    return buildClass10HindiFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Physics Board / Pre-Board / Sample / Half-Yearly Papers (70 Marks, 5 Sections, 33 Questions)
  if (isFullClass12PhysicsExam) {
    return buildClass12PhysicsFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Computer Science Board / Pre-Board / Sample / Half-Yearly Papers (70 Marks, 5 Sections, 36 Questions)
  if (isFullClass12CSExam) {
    return buildClass12CSFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Biology Board / Pre-Board / Sample / Half-Yearly Papers (70 Marks, 5 Sections, 33 Questions)
  if (isFullClass12BiologyExam) {
    return buildClass12BiologyFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Economics Board / Pre-Board / Sample / Half-Yearly Papers (80 Marks, 2 Sections, 34 Questions)
  if (isFullClass12EconomicsExam) {
    return buildClass12EconomicsFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Geography Board / Pre-Board / Sample / Half-Yearly Papers (70 Marks, 5 Sections, 30 Questions)
  if (isFullClass12GeographyExam) {
    return buildClass12GeographyFullExamPrompt(config, solutionDirective);
  }

  if (config.isCustom) {
    const customClassStr = config.customClass || config.classId;
    const customSubjectStr = config.customSubject || config.subject;
    const customChaptersStr = config.customChapters || (config.selectedChapters ? config.selectedChapters.join(", ") : "");
    const totalQuestionsCount = dist.mcq + dist.assertionReason + dist.vsa + dist.sa + dist.caseStudy + dist.la;

    const selectedTypesList: string[] = [];
    if (dist.mcq > 0) selectedTypesList.push(`MCQ (${dist.mcq})`);
    if (dist.assertionReason > 0) selectedTypesList.push(`Assertion-Reason (${dist.assertionReason})`);
    if (dist.vsa > 0) selectedTypesList.push(`Very Short Answer (${dist.vsa})`);
    if (dist.sa > 0) selectedTypesList.push(`Short Answer (${dist.sa})`);
    if (dist.caseStudy > 0) selectedTypesList.push(`Case Study (${dist.caseStudy})`);
    if (dist.la > 0) selectedTypesList.push(`Long Answer (${dist.la})`);

    return `
You are a Senior CBSE Examination Paper Setter with 20+ years of experience.
Your task is to generate a professional, curriculum-compliant question paper strictly according to the exact user-specified inputs below.

Generate a CBSE Question Paper for:

Class:
${customClassStr}

Subject:
${customSubjectStr}

Chapters:
${customChaptersStr}

Paper Type:
${config.examType}

Difficulty:
${config.difficulty}

Marks:
${config.totalMarks}

Question Types:
${selectedTypesList.join(", ")}

Number of Questions:
${totalQuestionsCount}

Time:
${config.duration}

--- CRITICAL VALIDATION & BOUNDARY DIRECTIVES ---
1. STRICT SUBJECT & CLASS BOUNDARY: Generate questions ONLY for the exact Class "${customClassStr}" and Subject "${customSubjectStr}".
   - Generate ONLY for the above class and subject.
   - Do NOT substitute another subject (e.g. if Subject is "${customSubjectStr}", NEVER generate Physics, Chemistry, Biology, Mathematics, History, or Science questions instead).
   - Do NOT substitute another class.
   - Do NOT infer a different curriculum.
   - Do NOT assume another stream.
   - Strictly follow the provided inputs.

2. STRICT CHAPTER BOUNDARY: Generate questions ONLY from the chapters entered by the user: "${customChaptersStr}". Do not introduce questions from other chapters or extra units.

3. QUESTION DISTRIBUTION:
${distributionDetails}

4. LANGUAGE INSTRUCTIONS:
${languagePrompt}

5. INTERNAL CHOICE OPTIONS:
${internalChoicePrompt}

6. ${solutionDirective}
7. MCQ FORMAT: MCQs must have exactly 4 plausible choices. Only generate choices for MCQs (the "choices" array must be null or empty for all other types).
8. ASSERTION REASON FORMAT: Assertion-Reason questions must follow the standard 4 option structure. Set these 4 options in the "choices" array.
9. JSON ESCAPING: Every backslash character (\\) in mathematical formulas or LaTeX MUST be double-escaped as (\\\\).
10. FORMAT OUTPUT: You must output strictly a single valid JSON object following the schema defined below. Do not wrap the JSON in markdown code blocks.
${hindiConstraint}
${hindiClass10Constraint}
${physicsClass12Constraint}
${csClass12Constraint}
${biologyClass12Constraint}
${economicsClass12Constraint}
${geographyClass12Constraint}

--- JSON SCHEMA FORMAT ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions (1 Mark each)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "uq_1",
          "text": "Question text here...",
          "marks": 1,
          "type": "mcq",
          "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "orQuestion": null,
          "solution": "Step-by-step solution / correct option explanation and marking scheme breakdown",
          "orSolution": null
        }
      ]
    }
  ]
}
`;
  }

  return `
You are a Senior CBSE Examination Paper Setter with 20+ years of experience.
Your task is to generate a professional, curriculum-compliant question paper based on the following configurations.

--- CONFIGURATION ---
- Class: CBSE Class ${config.classId}
- Subject: ${config.subject}
- Exam Type: ${config.examType}
- Target Difficulty Level: ${config.difficulty} (Note: questions must match this cognitive load standard)
- Language: ${config.language}
- Target Total Marks: ${config.totalMarks}

--- HYBRID BLUEPRINT & CURRICULUM VERIFICATION DIRECTIVE ---
You are acting as a Senior Board Examination Paper Setter for CBSE Class ${config.classId} (${config.subject}).
1. FIRST, inspect the reference database blueprint and unit weightages provided below.
2. SECOND, cross-verify this reference blueprint against your authoritative knowledge of the latest official CBSE 2026 curriculum, syllabus guidelines, and marking schemes for Class ${config.classId} ${config.subject} (${config.examType}).
3. IF ANY REVISIONS OR UPDATES ARE DETECTED (e.g. deleted chapters, updated unit mark allocations, or revised section structures), AUTOMATICALLY ADAPT AND UPDATE THE BLUEPRINT ON THE FLY to ensure 100% compliance with the newest 2026 board guidelines.
4. Ensure all generated questions strictly reflect the verified, up-to-date board standards.

--- QUESTION DISTRIBUTION LIST ---
${distributionDetails}

--- CURRICULUM SYLLABUS BACKGROUND ---
${curriculumContext}

--- TARGET CHAPTERS FOR GENERATION ---
You must generate questions ONLY from the following selected chapters:
${config.selectedChapters && config.selectedChapters.length > 0
  ? config.selectedChapters.map(c => `- ${c}`).join("\n")
  : "All chapters in the curriculum background above"
}

--- LANGUAGE INSTRUCTIONS ---
${languagePrompt}

--- INTERNAL CHOICE OPTIONS ---
${internalChoicePrompt}

${unitWeightagePrompt}

${englishClass12Constraint}
${hindiClass10Constraint}
${physicsClass12Constraint}
${csClass12Constraint}
${biologyClass12Constraint}
${economicsClass12Constraint}
${geographyClass12Constraint}

--- CRITICAL CONSTRAINTS ---
1. STRICT CHAPTER ALIGNMENT: Only generate questions from the chapters listed in the target chapters section above. Never generate questions from any other chapters or topics.
2. UNIQUE QUESTIONS: There must be no repetition of concepts or questions across sections.
3. ${solutionDirective}
4. MCQ FORMAT: MCQs must have exactly 4 plausible choices. Only generate choices for MCQs (the "choices" array must be null or empty for all other types).
5. CASE STUDY FORMAT: Case Study / Source-based questions must consist of a reading passage (or description) followed by 2 sub-questions (2 marks each, totaling 4 marks). Compile the sub-questions directly into the text field (e.g. "Read the passage and answer... \n\n(i) Subquestion 1 \n(ii) Subquestion 2").
6. JSON ESCAPING: Every backslash character (\) in mathematical formulas, LaTeX, or other texts MUST be double-escaped as (\\\\). For example, write \\\\theta instead of \\theta, and \\\\Delta instead of \\Delta. Failure to double-escape backslashes will break JSON parsing. Do not output invalid escape sequences like \\u unless followed by 4 hexadecimal digits.
6. ASSERTION REASON FORMAT: Assertion-Reason questions must follow the standard CBSE format with 4 options:
   (A) Both A and R are true and R is the correct explanation of A.
   (B) Both A and R are true but R is not the correct explanation of A.
   (C) A is true but R is false.
   (D) A is false but R is true.
   Set these 4 options in the "choices" array for Assertion-Reason questions.
7. NUMBERING: Keep question indices sequential (1, 2, 3...) globally across sections.
8. FORMAT OUTPUT: You must output strictly a single valid JSON object following the schema defined below. Do not wrap the JSON in markdown code blocks, do not write markdown descriptions, just output raw JSON text.
${hindiConstraint}

--- JSON SCHEMA FORMAT ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions (1 Mark each)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "uq_1", // unique string identifier
          "text": "Question text here...",
          "marks": 1,
          "type": "mcq", // "mcq" | "assertionReason" | "vsa" | "sa" | "caseStudy" | "la"
          "choices": ["Option 1", "Option 2", "Option 3", "Option 4"], // string[] for MCQs and ARs, null for others
          "orQuestion": null, // string if internal choice is enabled, null otherwise
          "solution": "Step-by-step solution / correct option explanation and marking scheme breakdown",
          "orSolution": null
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 80-Mark, 3-Section, 13-Question examination paper prompt for CBSE Class 12 English Core (Code 301).
 * Strictly mirrors the official CBSE NCERT Prescribed Books (Flamingo & Vistas) and blueprint.
 */
function buildClass12EnglishFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChapters = config.selectedChapters && config.selectedChapters.length > 0 && !config.selectedChapters.includes("all")
    ? config.selectedChapters.map(c => `- ${c}`).join("\n")
    : "All prescribed chapters from Flamingo (Prose & Poetry), Vistas, Creative Writing Skills, and Reading Skills.";

  return `
You are a Senior CBSE Examination Paper Setter and Chief Moderator for CBSE Class 12 English Core (Subject Code 301) with 25+ years of board examination experience.
Your task is to generate the OFFICIAL CBSE Class 12 English Core Examination Paper (80 Marks, 3 Hours) strictly according to the latest official CBSE Blueprint, Examination Design, and Prescribed NCERT Books.

--- PRESCRIBED NCERT CURRICULUM & BOOKS ---
1. FLAMINGO (English Reader):
   - Prose: The Last Lesson, Lost Spring, Deep Water, The Rattrap, Indigo, Poets and Pancakes, The Interview, Going Places
   - Poetry: My Mother at Sixty-Six, Keeping Quiet, A Thing of Beauty, A Roadside Stand, Aunt Jennifer's Tigers
2. VISTAS (Supplementary Reader):
   - The Third Level, The Tiger King, Journey to the End of the Earth, The Enemy, On the Face of It, Memories of Childhood (The Cutting of My Long Hair & We Too are Human Beings)
3. CREATIVE WRITING SKILLS:
   - Notice (up to 50 words), Formal/Informal Invitations & Replies (up to 50 words), Letters (Job Application with bio-data/resume, Letter to Editor), Article/Report Writing (120-150 words)
4. READING SKILLS:
   - Unseen Passage (Factual, Descriptive or Literary) & Unseen Case-Based Factual Passage (with statistical data/charts)

--- TARGET CHAPTERS FILTER ---
${targetChapters}

--- OFFICIAL 3-SECTION & 13-QUESTION BLUEPRINT STRUCTURE (TOTAL: 80 MARKS) ---
You MUST structure the paper into PRECISELY 3 sections with PRECISELY 13 main questions as follows:

======================================================================
### SECTION A: READING SKILLS (Total: 22 Marks)
======================================================================
- Question 1 (12 Marks):
  * Provide an authentic, high-quality unseen passage (factual, descriptive or literary, approx. 400-450 words) on a relevant contemporary, philosophical, or educational theme.
  * Follow with sub-questions totaling 12 marks assessing comprehension, interpretation, analysis, inference, and vocabulary.
  * Sub-questions should include a mix of 1-mark objective questions/MCQs and 2-mark short inference questions.
  * Set "marks": 12, "type": "caseStudy".

- Question 2 (10 Marks):
  * Provide an authentic case-based factual unseen passage (approx. 300-350 words) with verbal/visual inputs like statistical data, survey percentages, or charts.
  * (The combined word limit of Passage 1 and Passage 2 must be approx. 700-750 words).
  * Follow with sub-questions totaling 10 marks assessing comprehension, interpretation, analysis, inference, and evaluation.
  * Set "marks": 10, "type": "caseStudy".

======================================================================
### SECTION B: CREATIVE WRITING SKILLS (Total: 18 Marks)
======================================================================
- Question 3 (4 Marks) - NOTICE WRITING:
  * Draft a Notice (up to 50 words) based on verbal/visual input.
  * MUST provide an internal choice in "orQuestion" (One out of two given questions to be answered).
  * Marking Scheme: Format: 1 Mark, Content: 2 Marks, Accuracy of Spelling and Grammar: 1 Mark.
  * Set "marks": 4, "type": "caseStudy".

- Question 4 (4 Marks) - FORMAL / INFORMAL INVITATION & REPLY:
  * Draft a Formal or Informal Invitation, or formal/informal reply to an invitation (up to 50 words).
  * MUST provide an internal choice in "orQuestion" (One out of two given questions to be answered).
  * Marking Scheme: Format: 1 Mark, Content: 2 Marks, Accuracy of Spelling and Grammar: 1 Mark.
  * Set "marks": 4, "type": "caseStudy".

- Question 5 (5 Marks) - LETTER WRITING:
  * Letters based on verbal/visual input, to be answered in 120-150 words.
  * Types: Application for a job with bio-data or resume OR Letters to the Editor (giving suggestions or opinions on issues of public interest).
  * MUST provide an internal choice in "orQuestion" (One out of two given questions to be answered).
  * Marking Scheme: Format: 1 Mark, Organisation of Ideas: 1 Mark, Content: 2 Marks, Accuracy: 1 Mark.
  * Set "marks": 5, "type": "la".

- Question 6 (5 Marks) - ARTICLE / REPORT WRITING:
  * Article or Report Writing, descriptive and analytical in nature, based on verbal inputs (120-150 words).
  * MUST provide an internal choice in "orQuestion" (One out of two given questions to be answered).
  * Marking Scheme: Format: 1 Mark, Organisation of Ideas: 1 Mark, Content: 2 Marks, Accuracy: 1 Mark.
  * Set "marks": 5, "type": "la".

======================================================================
### SECTION C: LITERATURE TEXTBOOK & SUPPLEMENTARY READING TEXT (Total: 40 Marks)
======================================================================
- Question 7 (6 Marks) - FLAMINGO POETRY EXTRACT:
  * One poetry extract out of two from the prescribed poems in FLAMINGO (My Mother at Sixty-Six, Keeping Quiet, A Thing of Beauty, A Roadside Stand, Aunt Jennifer's Tigers).
  * Put Extract 1 in "text" followed by 6 sub-questions (1 mark each).
  * Put Extract 2 in "orQuestion" followed by 6 alternative sub-questions (1 mark each).
  * Sub-questions should assess comprehension, interpretation, analysis, poetic devices, inference and appreciation.
  * Set "marks": 6, "type": "caseStudy".

- Question 8 (4 Marks) - VISTAS PROSE EXTRACT:
  * One prose extract out of two from chapters in VISTAS (The Third Level, The Tiger King, Journey to the End of the Earth, The Enemy, On the Face of It, Memories of Childhood).
  * Put Extract 1 in "text" followed by 4 sub-questions (1 mark each).
  * Put Extract 2 in "orQuestion" followed by 4 alternative sub-questions (1 mark each).
  * Sub-questions should assess comprehension, interpretation, analysis, evaluation, and character appreciation.
  * Set "marks": 4, "type": "caseStudy".

- Question 9 (6 Marks) - FLAMINGO PROSE EXTRACT:
  * One prose extract out of two from chapters in FLAMINGO (The Last Lesson, Lost Spring, Deep Water, The Rattrap, Indigo, Poets and Pancakes, The Interview, Going Places).
  * Put Extract 1 in "text" followed by 6 sub-questions (1 mark each).
  * Put Extract 2 in "orQuestion" followed by 6 alternative sub-questions (1 mark each).
  * Sub-questions should assess comprehension, interpretation, analysis, inference, and evaluation.
  * Set "marks": 6, "type": "caseStudy".

- Question 10 (10 Marks) - FLAMINGO SHORT ANSWER QUESTIONS (5 x 2 = 10 Marks):
  * Short answer type questions from Prose and Poetry from the book FLAMINGO, to be answered in 40-50 words each.
  * Questions should elicit inferential responses through critical thinking.
  * Provide 6 numbered questions (i to vi), with instructions: "Answer any FIVE of the following six questions in 40-50 words each".
  * Set "marks": 10, "type": "sa".

- Question 11 (4 Marks) - VISTAS SHORT ANSWER QUESTIONS (2 x 2 = 4 Marks):
  * Short answer type questions from Prose from the book VISTAS, to be answered in 40-50 words each.
  * Questions should elicit inferential responses through critical thinking.
  * Provide 3 numbered questions (i to iii), with instructions: "Answer any TWO of the following three questions in 40-50 words each".
  * Set "marks": 4, "type": "sa".

- Question 12 (5 Marks) - FLAMINGO LONG ANSWER QUESTION (1 x 5 = 5 Marks):
  * One Long answer type question from Prose/Poetry from FLAMINGO, to be answered in 120-150 words.
  * Questions can be based on incident / theme / passage / extract / event as reference points to assess extrapolation beyond and across the text, analytical and evaluative response.
  * MUST provide an internal choice in "orQuestion" (Any one out of two questions to be done).
  * Set "marks": 5, "type": "la".

- Question 13 (5 Marks) - VISTAS LONG ANSWER QUESTION (1 x 5 = 5 Marks):
  * One Long answer type question based on the chapters from the book VISTAS, to be answered in 120-150 words.
  * To assess global comprehension and extrapolation beyond the text using incidents, events, themes as reference points.
  * MUST provide an internal choice in "orQuestion" (Any one out of two questions to be done).
  * Set "marks": 5, "type": "la".

--- GENERAL RULES & MARKING SCHEME ---
1. All 13 questions MUST be sequentially numbered 1 to 13.
2. ${solutionDirective}
3. Maintain accurate CBSE word limits: Notice/Invitation: up to 50 words; Letter/Article/Report: 120-150 words; Short Answer: 40-50 words; Long Answer: 120-150 words.
4. Total marks across the 3 sections MUST sum up to exactly 80 marks (22 + 18 + 40 = 80).
5. FORMAT OUTPUT: Output strictly a single valid JSON object matching the JSON schema below. Do not wrap the JSON in markdown code blocks.

--- JSON SCHEMA FORMAT ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Reading Skills (22 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. Read the following passage carefully and answer the questions that follow: ... \\n\\nBased on your understanding of the passage, answer the following questions: \\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n...",
          "marks": 12,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "Complete solution and marking scheme for Question 1...",
          "orSolution": null
        },
        {
          "id": "q2",
          "text": "2. Read the case-based factual passage with data below and answer the questions that follow: ... \\n\\nBased on the data and passage, answer the following questions: \\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n...",
          "marks": 10,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "Complete solution and marking scheme for Question 2...",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Creative Writing Skills (18 Marks)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q3",
          "text": "3. [Notice Writing task up to 50 words]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": "[Alternative Notice Writing task up to 50 words]",
          "solution": "Format: 1M, Content: 2M, Accuracy: 1M.\\n[Sample Notice Box & Draft]",
          "orSolution": "Format: 1M, Content: 2M, Accuracy: 1M.\\n[Alternative Sample Notice Box & Draft]"
        },
        {
          "id": "q4",
          "text": "4. [Formal/Informal Invitation or Reply task up to 50 words]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": "[Alternative Invitation or Reply task up to 50 words]",
          "solution": "Format: 1M, Content: 2M, Accuracy: 1M.\\n[Sample Draft]",
          "orSolution": "Format: 1M, Content: 2M, Accuracy: 1M.\\n[Alternative Draft]"
        },
        {
          "id": "q5",
          "text": "5. [Letter Writing - Application for Job with Bio-data/Resume OR Letter to Editor, 120-150 words]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Letter Writing task, 120-150 words]",
          "solution": "Format: 1M, Organisation: 1M, Content: 2M, Accuracy: 1M.\\n[Complete Letter with Resume/Body]",
          "orSolution": "Format: 1M, Organisation: 1M, Content: 2M, Accuracy: 1M.\\n[Alternative Complete Letter]"
        },
        {
          "id": "q6",
          "text": "6. [Article or Report Writing on current educational/social issue, 120-150 words]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Article or Report Writing task, 120-150 words]",
          "solution": "Format: 1M, Organisation: 1M, Content: 2M, Accuracy: 1M.\\n[Complete Draft]",
          "orSolution": "Format: 1M, Organisation: 1M, Content: 2M, Accuracy: 1M.\\n[Alternative Complete Draft]"
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Literature Textbook and Supplementary Reading Text (40 Marks)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q7",
          "text": "7. Read the following extract from Flamingo (Poetry) and answer the questions that follow: ... \\n\\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n(iii) ... (1 Mark)\\n(iv) ... (1 Mark)\\n(v) ... (1 Mark)\\n(vi) ... (1 Mark)",
          "marks": 6,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": "Read the following alternate extract from Flamingo (Poetry) and answer the questions that follow: ... \\n\\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n(iii) ... (1 Mark)\\n(iv) ... (1 Mark)\\n(v) ... (1 Mark)\\n(vi) ... (1 Mark)",
          "solution": "Answers to Extract 1 sub-questions (i to vi)...",
          "orSolution": "Answers to Extract 2 sub-questions (i to vi)..."
        },
        {
          "id": "q8",
          "text": "8. Read the following extract from Vistas (Prose) and answer the questions that follow: ... \\n\\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n(iii) ... (1 Mark)\\n(iv) ... (1 Mark)",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": "Read the following alternate extract from Vistas (Prose) and answer the questions that follow: ... \\n\\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n(iii) ... (1 Mark)\\n(iv) ... (1 Mark)",
          "solution": "Answers to Extract 1 sub-questions (i to iv)...",
          "orSolution": "Answers to Extract 2 sub-questions (i to iv)..."
        },
        {
          "id": "q9",
          "text": "9. Read the following extract from Flamingo (Prose) and answer the questions that follow: ... \\n\\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n(iii) ... (1 Mark)\\n(iv) ... (1 Mark)\\n(v) ... (1 Mark)\\n(vi) ... (1 Mark)",
          "marks": 6,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": "Read the following alternate extract from Flamingo (Prose) and answer the questions that follow: ... \\n\\n(i) ... (1 Mark)\\n(ii) ... (1 Mark)\\n(iii) ... (1 Mark)\\n(iv) ... (1 Mark)\\n(v) ... (1 Mark)\\n(vi) ... (1 Mark)",
          "solution": "Answers to Extract 1 sub-questions (i to vi)...",
          "orSolution": "Answers to Extract 2 sub-questions (i to vi)..."
        },
        {
          "id": "q10",
          "text": "10. Answer any FIVE of the following six questions in 40-50 words each (from Flamingo Prose & Poetry):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...\\n(vi) ...",
          "marks": 10,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "Detailed answers and marking points for all 6 questions...",
          "orSolution": null
        },
        {
          "id": "q11",
          "text": "11. Answer any TWO of the following three questions in 40-50 words each (from Vistas):\\n(i) ...\\n(ii) ...\\n(iii) ...",
          "marks": 4,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "Detailed answers and marking points for all 3 questions...",
          "orSolution": null
        },
        {
          "id": "q12",
          "text": "12. Answer any ONE of the following questions in 120-150 words (from Flamingo Prose/Poetry):\\n[Theme / Incident / Character analytical question]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Theme / Incident / Character analytical question from Flamingo]",
          "solution": "Comprehensive 120-150 word model answer with marking points...",
          "orSolution": "Comprehensive 120-150 word model answer for choice question..."
        },
        {
          "id": "q13",
          "text": "13. Answer any ONE of the following questions in 120-150 words (from Vistas):\\n[Global comprehension / Extrapolation question]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Global comprehension / Extrapolation question from Vistas]",
          "solution": "Comprehensive 120-150 word model answer with marking points...",
          "orSolution": "Comprehensive 120-150 word model answer for choice question..."
        }
      ]
    }
  ]
}
`;
}

function buildClass10HindiFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED CHAPTER FOCUS ---
When selecting content for literature (क्षितिज भाग-2 एवं कृतिका भाग-2) and grammar topics, strictly prioritize these selected chapters/topics chosen by the user:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated literature questions originate strictly from these chosen chapters.`
      : `--- FULL SYLLABUS COVERAGE ---
Cover all prescribed chapters across क्षितिज भाग-2 (काव्य व गद्य खंड) and कृतिका भाग-2 evenly as per the official CBSE blueprint.`;

  return `
You are a Senior CBSE Examination Paper Setter and Head Examiner for Class 10 Hindi 'A' (Course Code 002) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 10 Hindi 'A' Question Paper for 2026.

Total Marks: 80
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: हिन्दी 'अ' (Course A - Code 002)
Class: कक्षा 10 (Class 10)

======================================================================
CRITICAL CBSE SYLLABUS & PRESCRIBED BOOKS COMPLIANCE DIRECTIVE
======================================================================
The paper MUST strictly adhere to the official NCERT prescribed books and syllabus for Class 10 Hindi 'A':
1. क्षितिज भाग-2 (एन.सी.ई.आर.टी. नवीनतम संस्करण):
   - काव्य खंड:
     1. पद (सूरदास)
     2. राम-लक्ष्मण-परशुराम संवाद (तुलसीदास)
     3. आत्मकथ्य (जयशंकर प्रसाद)
     4. उत्साह और अट नहीं रही (सूर्यकांत त्रिपाठी 'निराला')
     5. यह दंतुरित मुस्कान और फसल (नागार्जुन)
     6. संगतकार (मंगलेश डबराल)
   - गद्य खंड:
     1. नेताजी का चश्मा (स्वयं प्रकाश)
     2. बालगोबिन भगत (रामवृक्ष बेनीपुरी)
     3. लखनवी अंदाज़ (यशपाल)
     4. एक कहानी यह भी (मन्नू भंडारी)
     5. नौबतखाने में इबादत (यतींद्र मिश्र)
     6. संस्कृति (भदंत आनंद कौसल्यायन)
2. कृतिका भाग-2 (पूरक पाठ्यपुस्तक - नवीनतम संस्करण):
     1. माता का आँचल (शिवपूजन सहाय)
     2. साना-साना हाथ जोड़ि (मधु कांकरिया)
     3. मैं क्यों लिखता हूँ? (अज्ञेय)

STRICTLY DELETED / EXCLUDED CHAPTERS - NEVER INCLUDE QUESTIONS OR EXTRACTS FROM THESE:
- क्षितिज भाग-2 (काव्य खंड): देव - सवैया, कवित्त; गिरिजाकुमार माथुर - छाया मत छूना; ऋतुराज - कन्यादान
- क्षितिज भाग-2 (गद्य खंड): महावीर प्रसाद द्विवेदी - स्त्री-शिक्षा के विरोधी कुतर्कों का खंडन; सर्वेश्वर दयाल सक्सेना - मानवीय करुणा की दिव्य चमक
- कृतिका भाग-2: जॉर्ज पंचम की नाक; एही ठैयाँ झुलनी हेरानी हो रामा!

${targetChaptersDirective}

======================================================================
MANDATORY 4-SECTION, 15-QUESTION BLUEPRINT STRUCTURE (EXACTLY 80 MARKS)
======================================================================
The paper consists of exactly 4 sections and exactly 15 sequentially numbered questions (Q1 to Q15):

----------------------------------------------------------------------
खण्ड – क : अपठित बोध (कुल अंक: 14)
----------------------------------------------------------------------
- प्रश्न 1 (7 अंक) - अपठित गद्यांश:
  * लगभग 250 शब्दों का एक ज्ञानवर्धक एवं चिंतनपरक अपठित गद्यांश प्रस्तुत करें।
  * गद्यांश के आधार पर निम्नलिखित 5 उप-प्रश्न पूछें:
    - (i) बहुविकल्पीय प्रश्न (MCQ) - 1 अंक [चार विकल्प A, B, C, D सहित]
    - (ii) बहुविकल्पीय प्रश्न (MCQ) - 1 अंक [चार विकल्प A, B, C, D सहित]
    - (iii) बहुविकल्पीय प्रश्न (MCQ) - 1 अंक [चार विकल्प A, B, C, D सहित]
    - (iv) अतिलघूत्तरात्मक / लघूत्तरात्मक प्रश्न - 2 अंक
    - (v) लघूत्तरात्मक प्रश्न (उपयुक्त शीर्षक / केंद्रीय भाव) - 2 अंक
  * कुल अंक: 1+1+1+2+2 = 7 अंक।
  * Set "marks": 7, "type": "caseStudy".

- प्रश्न 2 (7 अंक) - अपठित काव्यांश:
  * लगभग 120 शब्दों का एक भावपूर्ण एवं विचारोत्तेजक अपठित काव्यांश प्रस्तुत करें।
  * काव्यांश के आधार पर निम्नलिखित 5 उप-प्रश्न पूछें:
    - (i) बहुविकल्पीय प्रश्न (MCQ) - 1 अंक [चार विकल्प A, B, C, D सहित]
    - (ii) बहुविकल्पीय प्रश्न (MCQ) - 1 अंक [चार विकल्प A, B, C, D सहित]
    - (iii) बहुविकल्पीय प्रश्न (MCQ) - 1 अंक [चार विकल्प A, B, C, D सहित]
    - (iv) अतिलघूत्तरात्मक / लघूत्तरात्मक प्रश्न - 2 अंक
    - (v) लघूत्तरात्मक प्रश्न (काव्य-सौंदर्य / भाव-सौंदर्य / संदेश) - 2 अंक
  * कुल अंक: 1+1+1+2+2 = 7 अंक।
  * Set "marks": 7, "type": "caseStudy".

----------------------------------------------------------------------
खण्ड – ख : व्यावहारिक व्याकरण (कुल अंक: 16)
----------------------------------------------------------------------
व्याकरण के कुल 20 प्रश्न पूछे जाएँगे, जिनमें से परीक्षार्थियों को केवल 16 प्रश्नों के उत्तर देने होंगे (प्रत्येक विषय में 5 में से 4 प्रश्न):

- प्रश्न 3 (4 अंक) - रचना के आधार पर वाक्य भेद:
  * 5 उप-प्रश्न दीजिए (i, ii, iii, iv, v), निर्देशानुसार वाक्य रूपांतरण (सरल, संयुक्त, मिश्र) व पहचान पर आधारित।
  * निर्देश: "निम्नलिखित 5 प्रश्नों में से किन्हीं 4 प्रश्नों के उत्तर दीजिए (1×4=4):"
  * Set "marks": 4, "type": "vsa".

- प्रश्न 4 (4 अंक) - वाच्य:
  * 5 उप-प्रश्न दीजिए (i, ii, iii, iv, v), वाच्य पहचान (कर्तृवाच्य, कर्मवाच्य, भाववाच्य) व वाच्य परिवर्तन पर आधारित।
  * निर्देश: "निम्नलिखित 5 प्रश्नों में से किन्हीं 4 प्रश्नों के उत्तर दीजिए (1×4=4):"
  * Set "marks": 4, "type": "vsa".

- प्रश्न 5 (4 अंक) - पद परिचय:
  * 5 उप-प्रश्न दीजिए (i, ii, iii, iv, v), वाक्यों में रेखांकित पदों का व्याकरणिक पद परिचय देने पर आधारित।
  * निर्देश: "निम्नलिखित 5 प्रश्नों में से किन्हीं 4 प्रश्नों में रेखांकित पदों का सही पद-परिचय दीजिए (1×4=4):"
  * Set "marks": 4, "type": "vsa".

- प्रश्न 6 (4 अंक) - अलंकार:
  * 5 उप-प्रश्न दीजिए (i, ii, iii, iv, v), अर्थालंकार (उपमा, रूपक, उत्प्रेक्षा, अतिशयोक्ति, मानवीकरण) की पहचान व उदाहरण पर आधारित।
  * निर्देश: "निम्नलिखित 5 प्रश्नों में से किन्हीं 4 प्रश्नों के उत्तर दीजिए (1×4=4):"
  * Set "marks": 4, "type": "vsa".

----------------------------------------------------------------------
खण्ड – ग : पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक (कुल अंक: 30)
----------------------------------------------------------------------
- प्रश्न 7 (5 अंक) - क्षितिज गद्य खंड पठित गद्यांश (बहुविकल्पीय):
  * क्षितिज भाग-2 के निर्धारित गद्य पाठों (नेताजी का चश्मा, बालगोबिन भगत, लखनवी अंदाज़, एक कहानी यह भी, नौबतखाने में इबादत, संस्कृति) में से एक उपयुक्त गद्यांश प्रस्तुत करें।
  * गद्यांश के आधार पर 5 बहुविकल्पीय प्रश्न (MCQs) पूछें (प्रत्येक 1 अंक): (i), (ii), (iii), (iv), (v) प्रत्येक के चार विकल्प (क, ख, ग, घ)।
  * Set "marks": 5, "type": "caseStudy".

- प्रश्न 8 (6 अंक) - क्षितिज गद्य खंड लघूत्तरात्मक प्रश्न (3 × 2 = 6 अंक):
  * क्षितिज भाग-2 के गद्य पाठों पर आधारित 4 प्रश्न दीजिए (शब्द सीमा: 25-30 शब्द)।
  * निर्देश: "क्षितिज के निर्धारित गद्य पाठों के आधार पर निम्नलिखित 4 प्रश्नों में से किन्हीं 3 प्रश्नों के उत्तर लगभग 25-30 शब्दों में दीजिए (2×3=6):"
  * उप-प्रश्न: (i), (ii), (iii), (iv).
  * Set "marks": 6, "type": "sa".

- प्रश्न 9 (5 अंक) - क्षितिज काव्य खंड पठित काव्यांश (बहुविकल्पीय):
  * क्षितिज भाग-2 की निर्धारित कविताओं (पद, राम-लक्ष्मण-परशुराम संवाद, आत्मकथ्य, उत्साह/अट नहीं रही, यह दंतुरित मुस्कान/फसल, संगतकार) में से एक काव्यांश प्रस्तुत करें।
  * काव्यांश के आधार पर 5 बहुविकल्पीय प्रश्न (MCQs) पूछें (प्रत्येक 1 अंक): (i), (ii), (iii), (iv), (v) प्रत्येक के चार विकल्प (क, ख, ग, घ)।
  * Set "marks": 5, "type": "caseStudy".

- प्रश्न 10 (6 अंक) - क्षितिज काव्य खंड काव्यबोध प्रश्न (3 × 2 = 6 अंक):
  * विद्यार्थियों का काव्यबोध परखने हेतु क्षितिज की कविताओं पर आधारित 4 प्रश्न दीजिए (शब्द सीमा: 25-30 शब्द)।
  * निर्देश: "क्षितिज की निर्धारित कविताओं के आधार पर विद्यार्थियों का काव्यबोध परखने हेतु निम्नलिखित 4 प्रश्नों में से किन्हीं 3 प्रश्नों के उत्तर लगभग 25-30 शब्दों में दीजिए (2×3=6):"
  * उप-प्रश्न: (i), (ii), (iii), (iv).
  * Set "marks": 6, "type": "sa".

- प्रश्न 11 (8 अंक) - कृतिका भाग-2 पूरक पाठ्यपुस्तक प्रश्न (2 × 4 = 8 अंक):
  * कृतिका भाग-2 के निर्धारित पाठों (माता का आँचल, साना-साना हाथ जोड़ि, मैं क्यों लिखता हूँ?) पर आधारित 3 प्रश्न दीजिए (शब्द सीमा: 50-60 शब्द)।
  * निर्देश: "पूरक पाठ्यपुस्तक 'कृतिका भाग-2' के पाठों पर आधारित निम्नलिखित 3 प्रश्नों में से किन्हीं 2 प्रश्नों के उत्तर लगभग 50-60 शब्दों में दीजिए (4×2=8):"
  * उप-प्रश्न: (i), (ii), (iii).
  * Set "marks": 8, "type": "caseStudy".

----------------------------------------------------------------------
खण्ड – घ : रचनात्मक लेखन (कुल अंक: 20)
----------------------------------------------------------------------
- प्रश्न 12 (6 अंक) - अनुच्छेद लेखन (लगभग 120 शब्द):
  * समसामयिक एवं व्यावहारिक जीवन से जुड़े हुए 3 विभिन्न विषयों पर संकेत-बिंदुओं सहित विकल्प दीजिए।
  * परीक्षार्थियों को किसी 1 विषय पर लगभग 120 शब्दों में सारगर्भित अनुच्छेद लिखना है।
  * Set "marks": 6, "type": "la".

- प्रश्न 13 (5 अंक) - पत्र लेखन (लगभग 100 शब्द):
  * व्यावहारिक/दैनिक जीवन से जुड़ा औपचारिक अथवा अनौपचारिक पत्र लेखन कार्य दें (लगभग 100 शब्द)।
  * आंतरिक विकल्प (orQuestion) अनिवार्य रूप से दें (एक औपचारिक और एक अनौपचारिक पत्र)।
  * Set "marks": 5, "type": "la".

- प्रश्न 14 (5 अंक) - स्ववृत्त लेखन अथवा ई-मेल लेखन (लगभग 80 शब्द):
  * मुख्य प्रश्न ("text") में रोजगार से संबंधित किसी रिक्ति हेतु लगभग 80 शब्दों में स्ववृत्त (Bio-data/Resume) लेखन का कार्य दें।
  * आंतरिक विकल्प ("orQuestion") में किसी समसामयिक अथवा व्यावहारिक विषय पर लगभग 80 शब्दों में ई-मेल लेखन का कार्य दें।
  * Set "marks": 5, "type": "la".

- प्रश्न 15 (4 अंक) - विज्ञापन लेखन अथवा संदेश लेखन (लगभग 40 शब्द):
  * मुख्य प्रश्न ("text") में किसी उत्पाद, सेवा या सामाजिक जागरूकता से संबंधित लगभग 40 शब्दों में आकर्षक विज्ञापन लेखन का कार्य दें।
  * आंतरिक विकल्प ("orQuestion") में शुभकामना, पर्व-त्योहार अथवा विशेष अवसर पर लगभग 40 शब्दों में संदेश लेखन का कार्य दें।
  * Set "marks": 4, "type": "vsa".

======================================================================
LANGUAGE & PRESENTATION MANDATE
======================================================================
- The entire output MUST be in pure, standard, literary Hindi (Devanagari script).
- Do NOT use English subtitles or transliterated Hindi in section titles, questions, or solutions.
- Section names: "खण्ड – क", "खण्ड – ख", "खण्ड – ग", "खण्ड – घ".
- ${solutionDirective}
- Every solution must provide complete, step-by-step marking criteria (e.g. "प्रारूप: 1 अंक, विषय-वस्तु: 2 अंक, भाषा शुद्धता: 1 अंक").
- Total marks must be exactly 80 (14 + 16 + 30 + 20 = 80).
- Output strictly a single valid JSON object adhering to the schema below. Do not wrap in markdown quotes.

--- JSON SCHEMA FORMAT ---
{
  "sections": [
    {
      "name": "खण्ड – क",
      "description": "अपठित बोध (14 अंक)",
      "marksPerQuestion": 7,
      "questions": [
        {
          "id": "q1",
          "text": "1. निम्नलिखित अपठित गद्यांश को ध्यानपूर्वक पढ़कर उस पर आधारित प्रश्नों के उत्तर दीजिए:\\n\\n[लगभग 250 शब्दों का अपठित गद्यांश]\\n\\n(i) [बहुविकल्पीय प्रश्न 1] (1 अंक)\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n\\n(ii) [बहुविकल्पीय प्रश्न 2] (1 अंक)\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n\\n(iii) [बहुविकल्पीय प्रश्न 3] (1 अंक)\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n\\n(iv) [अतिलघूत्तरात्मक प्रश्न] (2 अंक)\\n\\n(v) [लघूत्तरात्मक प्रश्न] (2 अंक)",
          "marks": 7,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 1 का संपूर्ण समाधान एवं अंक विभाजन:\\n(i) सही उत्तर: (A) ...\\n(ii) सही उत्तर: (B) ...\\n(iii) सही उत्तर: (C) ...\\n(iv) उत्तर: ... [2 अंक]\\n(v) उत्तर: ... [2 अंक]",
          "orSolution": null
        },
        {
          "id": "q2",
          "text": "2. निम्नलिखित अपठित काव्यांश को ध्यानपूर्वक पढ़कर उस पर आधारित प्रश्नों के उत्तर दीजिए:\\n\\n[लगभग 120 शब्दों का अपठित काव्यांश]\\n\\n(i) [बहुविकल्पीय प्रश्न 1] (1 अंक)\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n\\n(ii) [बहुविकल्पीय प्रश्न 2] (1 अंक)\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n\\n(iii) [बहुविकल्पीय प्रश्न 3] (1 अंक)\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n\\n(iv) [अतिलघूत्तरात्मक प्रश्न] (2 अंक)\\n\\n(v) [लघूत्तरात्मक प्रश्न] (2 अंक)",
          "marks": 7,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 2 का संपूर्ण समाधान एवं अंक विभाजन:\\n(i) सही उत्तर: ...\\n(ii) सही उत्तर: ...\\n(iii) सही उत्तर: ...\\n(iv) उत्तर: ... [2 अंक]\\n(v) उत्तर: ... [2 अंक]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "खण्ड – ख",
      "description": "व्यावहारिक व्याकरण (16 अंक)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q3",
          "text": "3. निर्देशानुसार 'रचना के आधार पर वाक्य भेद' पर आधारित किन्हीं चार प्रश्नों के उत्तर दीजिए (1×4=4):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "marks": 4,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 3 का आदर्श उत्तर व व्याख्या:\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "orSolution": null
        },
        {
          "id": "q4",
          "text": "4. निर्देशानुसार 'वाच्य' पर आधारित किन्हीं चार प्रश्नों के उत्तर दीजिए (1×4=4):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "marks": 4,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 4 का आदर्श उत्तर व व्याख्या:\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "orSolution": null
        },
        {
          "id": "q5",
          "text": "5. निर्देशानुसार किन्हीं चार वाक्यों में रेखांकित पदों का 'पद-परिचय' दीजिए (1×4=4):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "marks": 4,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 5 का आदर्श उत्तर व व्याकरणिक पद-परिचय:\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "orSolution": null
        },
        {
          "id": "q6",
          "text": "6. निर्देशानुसार 'अलंकार' पर आधारित किन्हीं चार प्रश्नों के उत्तर दीजिए (1×4=4):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "marks": 4,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 6 का आदर्श उत्तर व अलंकार भेद पहचान:\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "orSolution": null
        }
      ]
    },
    {
      "name": "खण्ड – ग",
      "description": "पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक (30 अंक)",
      "marksPerQuestion": 6,
      "questions": [
        {
          "id": "q7",
          "text": "7. क्षितिज भाग-2 के निर्धारित गद्य पाठों में से निम्नलिखित पठित गद्यांश को पढ़कर पूछे गए प्रश्नों के सर्वाधिक उपयुक्त विकल्प चुनिए (1×5=5):\\n\\n[पठित गद्यांश पाठ से]\\n\\n(i) ...\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "marks": 5,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 7 का सही विकल्प व स्पष्टीकरण:\\n(i) (A) ...\\n(ii) (B) ...\\n(iii) (C) ...\\n(iv) (A) ...\\n(v) (D) ...",
          "orSolution": null
        },
        {
          "id": "q8",
          "text": "8. क्षितिज भाग-2 के गद्य पाठों के आधार पर निम्नलिखित चार प्रश्नों में से किन्हीं तीन प्रश्नों के उत्तर लगभग 25-30 शब्दों में दीजिए (2×3=6):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...",
          "marks": 6,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 8 के आदर्श उत्तर व अंक योजना (प्रत्येक उत्तर हेतु 2 अंक):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...",
          "orSolution": null
        },
        {
          "id": "q9",
          "text": "9. क्षितिज भाग-2 की निर्धारित कविताओं में से निम्नलिखित पठित काव्यांश को पढ़कर पूछे गए प्रश्नों के सर्वाधिक उपयुक्त विकल्प चुनिए (1×5=5):\\n\\n[पठित काव्यांश कविता से]\\n\\n(i) ...\\n(A) ...\\n(B) ...\\n(C) ...\\n(D) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...\\n(v) ...",
          "marks": 5,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 9 का सही विकल्प व स्पष्टीकरण:\\n(i) (A) ...\\n(ii) (B) ...\\n(iii) (C) ...\\n(iv) (A) ...\\n(v) (D) ...",
          "orSolution": null
        },
        {
          "id": "q10",
          "text": "10. क्षितिज भाग-2 की कविताओं के आधार पर विद्यार्थियों का काव्यबोध परखने हेतु निम्नलिखित चार प्रश्नों में से किन्हीं तीन प्रश्नों के उत्तर लगभग 25-30 शब्दों में दीजिए (2×3=6):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...",
          "marks": 6,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 10 के आदर्श उत्तर व काव्यबोध विश्लेषण (प्रत्येक उत्तर हेतु 2 अंक):\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...",
          "orSolution": null
        },
        {
          "id": "q11",
          "text": "11. पूरक पाठ्यपुस्तक 'कृतिका भाग-2' के पाठों पर आधारित निम्नलिखित तीन प्रश्नों में से किन्हीं दो प्रश्नों के उत्तर लगभग 50-60 शब्दों में दीजिए (4×2=8):\\n(i) ...\\n(ii) ...\\n(iii) ...",
          "marks": 8,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "प्रश्न 11 के विस्तृत उत्तर व अंक विभाजन (विषय-वस्तु: 3 अंक, अभिव्यक्ति: 1 अंक = 4 अंक प्रत्येक):\\n(i) ...\\n(ii) ...\\n(iii) ...",
          "orSolution": null
        }
      ]
    },
    {
      "name": "खण्ड – घ",
      "description": "रचनात्मक लेखन (20 अंक)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q12",
          "text": "12. निम्नलिखित तीन विषयों में से किसी एक विषय पर दिए गए संकेत-बिंदुओं के आधार पर लगभग 120 शब्दों में सारगर्भित अनुच्छेद लिखिए (6 अंक):\\n\\n(क) [विषय 1]\\n• संकेत बिंदु: ...\\n\\n(ख) [विषय 2]\\n• संकेत बिंदु: ...\\n\\n(ग) [विषय 3]\\n• संकेत बिंदु: ...",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "अनुच्छेद लेखन अंक योजना (भूमिका: 1 अंक, विषय-वस्तु: 3 अंक, भाषा व प्रस्तुति: 2 अंक = 6 अंक):\\n[आदर्श अनुच्छेद प्रारूप व मुख्य बिंदु]",
          "orSolution": null
        },
        {
          "id": "q13",
          "text": "13. [औपचारिक पत्र लेखन का विषय, लगभग 100 शब्द] (5 अंक)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[अनौपचारिक पत्र लेखन का वैकल्पिक विषय, लगभग 100 शब्द] (5 अंक)",
          "solution": "पत्र लेखन अंक योजना (प्रारूप: 1 अंक, विषय-वस्तु: 2 अंक, भाषा शुद्धता: 2 अंक = 5 अंक):\\n[आदर्श पत्र का प्रारूप व पाठ]",
          "orSolution": "वैकल्पिक पत्र लेखन अंक योजना:\\n[आदर्श वैकल्पिक पत्र का प्रारूप व पाठ]"
        },
        {
          "id": "q14",
          "text": "14. [रोजगार से संबंधित किसी पद हेतु लगभग 80 शब्दों में स्ववृत्त (बायोडाटा) लेखन] (5 अंक)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[किसी समसामयिक अथवा व्यावहारिक विषय पर लगभग 80 शब्दों में ई-मेल लेखन] (5 अंक)",
          "solution": "स्ववृत्त लेखन अंक योजना (प्रारूप: 1 अंक, व्यक्तिगत विवरण व योग्यता: 3 अंक, भाषा: 1 अंक = 5 अंक):\\n[आदर्श स्ववृत्त प्रारूप]",
          "orSolution": "ई-मेल लेखन अंक योजना (प्रारूप: 1 अंक, विषय-वस्तु: 3 अंक, भाषा: 1 अंक = 5 अंक):\\n[आदर्श ई-मेल प्रारूप]"
        },
        {
          "id": "q15",
          "text": "15. [किसी उत्पाद/सेवा अथवा सामाजिक चेतना पर लगभग 40 शब्दों में आकर्षक विज्ञापन लेखन] (4 अंक)",
          "marks": 4,
          "type": "vsa",
          "choices": null,
          "orQuestion": "[शुभकामना, पर्व-त्योहार अथवा विशेष अवसर पर लगभग 40 शब्दों में संदेश लेखन] (4 अंक)",
          "solution": "विज्ञापन लेखन अंक योजना (प्रारूप व बॉक्स: 1 अंक, विषय-वस्तु/स्लोगन: 2 अंक, प्रस्तुति: 1 अंक = 4 अंक):\\n[आदर्श विज्ञापन सामग्री]",
          "orSolution": "संदेश लेखन अंक योजना (प्रारूप व बॉक्स: 1 अंक, विषय-वस्तु: 2 अंक, भाषा: 1 अंक = 4 अंक):\\n[आदर्श संदेश सामग्री]"
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 70-Mark, 5-Section, 33-Question examination paper prompt for CBSE Class 12 Physics (Subject Code 042).
 * Strictly adheres to the 2025-26 Course Structure, 9 Units, 14 Chapters, and official CBSE Examination Blueprint.
 */
function buildClass12PhysicsFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED CHAPTER FOCUS ---
When generating questions across all 5 sections, strictly prioritize and select content from these selected chapters/units chosen by the user:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated questions originate strictly from these chosen chapters. Distribute the 33 questions and 70 marks proportionally among the selected chapters.`
      : `--- FULL SYLLABUS UNIT-WISE MARKS DISTRIBUTION ---
Follow the official CBSE 2025-26 Course Structure and Unit Weightage strictly:
- Unit I (Electrostatics: Ch 1 & 2) + Unit II (Current Electricity: Ch 3) => 16 Marks
- Unit III (Magnetic Effects: Ch 4 & 5) + Unit IV (EMI & AC: Ch 6 & 7) => 17 Marks
- Unit V (EM Waves: Ch 8) + Unit VI (Optics: Ch 9 & 10) => 18 Marks
- Unit VII (Dual Nature: Ch 11) + Unit VIII (Atoms & Nuclei: Ch 12 & 13) => 12 Marks
- Unit IX (Electronic Devices: Ch 14) => 7 Marks
Total = 16 + 17 + 18 + 12 + 7 = 70 Marks.`;

  return `
You are a Senior CBSE Examination Paper Setter and Chief Examiner for Class 12 Physics (Subject Code 042) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 12 Physics Theory Question Paper for 2025-26.

Total Marks: 70
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: Physics (Subject Code 042)
Class: Class 12 (CBSE Senior Secondary)

======================================================================
CRITICAL CBSE SYLLABUS & PRESCRIBED UNITS DIRECTIVE (2025-26)
======================================================================
Prescribed Units & Chapters:
1. Unit I: Electrostatics
   - Chapter-1: Electric Charges and Fields (Electric charges, conservation of charge, Coulomb's law, superposition principle, continuous charge distribution, electric field, electric field lines, electric dipole, electric field due to a dipole, torque on a dipole in uniform electric field, electric flux, Gauss's theorem and applications: infinitely long straight wire, uniformly charged infinite plane sheet, uniformly charged thin spherical shell field inside and outside)
   - Chapter-2: Electrostatic Potential and Capacitance (Electric potential, potential difference, electric potential due to a point charge, a dipole and system of charges; equipotential surfaces, electrical potential energy of a system of two-point charges and of electric dipole in an electrostatic field; Conductors and insulators, free charges and bound charges inside a conductor, Dielectrics and electric polarization, capacitors and capacitance, combination of capacitors in series and in parallel, capacitance of a parallel plate capacitor with and without dielectric medium between the plates, energy stored in a capacitor - no derivation, formulae only)
2. Unit II: Current Electricity
   - Chapter-3: Current Electricity (Electric current, flow of electric charges in a metallic conductor, drift velocity, mobility and their relation with electric current; Ohm's law, V-I characteristics linear and non-linear, electrical energy and power, electrical resistivity and conductivity, temperature dependence of resistance, internal resistance of a cell, potential difference and emf of a cell, combination of cells in series and in parallel, Kirchhoff's rules, Wheatstone bridge)
3. Unit III: Magnetic Effects of Current and Magnetism
   - Chapter-4: Moving Charges and Magnetism (Concept of magnetic field, Oersted's experiment; Biot-Savart law and its application to current carrying circular loop; Ampere's law and its applications to infinitely long straight wire, Straight solenoid only qualitative treatment; Force on a moving charge in uniform magnetic and electric fields; Force on a current-carrying conductor in a uniform magnetic field, force between two parallel current-carrying conductors - definition of ampere; Torque experienced by a current loop in uniform magnetic field; Current loop as a magnetic dipole and its magnetic dipole moment, moving coil galvanometer - its current sensitivity and conversion to ammeter and voltmeter)
   - Chapter-5: Magnetism and Matter (Bar magnet, bar magnet as an equivalent solenoid qualitative treatment only, magnetic field intensity due to a magnetic dipole bar magnet along its axis and perpendicular to its axis qualitative treatment only, torque on a magnetic dipole bar magnet in a uniform magnetic field qualitative treatment only, magnetic field lines; Magnetic properties of materials - Para-, dia- and ferro-magnetic substances with examples, Magnetization of materials, effect of temperature on magnetic properties)
4. Unit IV: Electromagnetic Induction and Alternating Currents
   - Chapter-6: Electromagnetic Induction (Electromagnetic induction; Faraday's laws, induced EMF and current; Lenz's Law, self and mutual induction)
   - Chapter-7: Alternating Current (Alternating currents, peak and RMS value of alternating current/voltage; reactance and impedance; LCR series circuit phasors only, resonance, power in AC circuits, power factor, wattless current; AC generator, Transformer)
5. Unit V: Electromagnetic Waves
   - Chapter-8: Electromagnetic Waves (Basic idea of displacement current, Electromagnetic waves, their characteristics, their transverse nature qualitative idea only; Electromagnetic spectrum: radio waves, microwaves, infrared, visible, ultraviolet, X-rays, gamma rays including elementary facts about their uses)
6. Unit VI: Optics
   - Chapter-9: Ray Optics and Optical Instruments (Ray Optics: Reflection of light, spherical mirrors, mirror formula, refraction of light, total internal reflection and optical fibers, refraction at spherical surfaces, lenses, thin lens formula, lens maker's formula, magnification, power of a lens, combination of thin lenses in contact, refraction of light through a prism; Optical instruments: Microscopes and astronomical telescopes reflecting and refracting and their magnifying powers)
   - Chapter-10: Wave Optics (Wave optics: Wave front and Huygen's principle, reflection and refraction of plane wave at a plane surface using wave fronts; Proof of laws of reflection and refraction using Huygen's principle; Interference, Young's double slit experiment and expression for fringe width no derivation final expression only, coherent sources and sustained interference of light, diffraction due to a single slit, width of central maxima qualitative treatment only)
7. Unit VII: Dual Nature of Radiation and Matter
   - Chapter-11: Dual Nature of Radiation and Matter (Dual nature of radiation, Photoelectric effect, Hertz and Lenard's observations; Einstein's photoelectric equation - particle nature of light; Experimental study of photoelectric effect; Matter waves - wave nature of particles, de-Broglie relation)
8. Unit VIII: Atoms and Nuclei
   - Chapter-12: Atoms (Alpha-particle scattering experiment; Rutherford's model of atom; Bohr model of hydrogen atom, Expression for radius of nth possible orbit, velocity and energy of electron in nth orbit, hydrogen line spectra qualitative treatment only)
   - Chapter-13: Nuclei (Composition and size of nucleus, nuclear force; Mass-energy relation, mass defect; binding energy per nucleon and its variation with mass number; nuclear fission, nuclear fusion)
9. Unit IX: Electronic Devices
   - Chapter-14: Semiconductor Electronics: Materials, Devices and Simple Circuits (Energy bands in conductors, semiconductors and insulators qualitative ideas only; Intrinsic and extrinsic semiconductors - p and n type, p-n junction; Semiconductor diode: I-V characteristics in forward and reverse bias, application of junction diode: diode as a rectifier)

STRICTLY DELETED / EXCLUDED TOPICS (NEVER GENERATE QUESTIONS FROM THESE):
- Van de Graaff generator
- Resistor colour coding, series/parallel combinations of resistors
- Meter Bridge, Potentiometer (principle, measurement of potential difference, comparison of emf, internal resistance)
- Cyclotron
- Magnetic dipole moment of a revolving electron
- Earth's magnetism and magnetic elements (declination, dip, horizontal component)
- Eddy currents, LC oscillations (qualitative treatment)
- Reflection of light by plane surfaces / spherical mirrors derivations of mirror equation (only formulae)
- Scattering of light - blue colour of sky and reddish appearance of sun
- Resolving power of microscope and astronomical telescope
- Polarisation of light, Brewster's law, Polaroid sheets
- Davisson-Germer experiment
- Radioactive decay law, alpha/beta/gamma decay properties, half life and mean life
- Zener diode and its characteristics, Zener diode as a voltage regulator
- Optoelectronic devices: LED, Photodiode, Solar cell
- Junction Transistor, transistor action, characteristics, amplifier
- Logic gates and truth tables

${targetChaptersDirective}

======================================================================
EXACT CBSE QUESTION PAPER BLUEPRINT & SECTION-WISE SPECIFICATION
======================================================================
The paper consists of 33 compulsory questions divided into 5 Sections: Section A, Section B, Section C, Section D, and Section E.
All questions are compulsory. Internal choices are provided in:
- At least one question in Section B (2 marks)
- At least one question in Section C (3 marks)
- One sub-question in each Case-based question of Section D (2 marks)
- ALL three questions in Section E (5 marks each)

PHYSICAL CONSTANTS TO INCLUDE IN GENERAL INSTRUCTIONS:
c = 3 x 10^8 m/s
h = 6.63 x 10^-34 J s
e = 1.6 x 10^-19 C
\\mu_0 = 4\\pi x 10^-7 T m A^-1
\\varepsilon_0 = 8.854 x 10^-12 C^2 N^-1 m^-2
m_e = 9.1 x 10^-31 kg
m_p = 1.67 x 10^-27 kg
N_A = 6.023 x 10^23 mol^-1
k_B = 1.38 x 10^-23 J K^-1

----------------------------------------------------------------------
SECTION A: Questions 1 to 16 (16 Questions x 1 Mark = 16 Marks)
----------------------------------------------------------------------
- Questions 1 to 12: Multiple Choice Questions (MCQs), 1 Mark each.
  * Each question must test a distinct concept or calculation from the syllabus.
  * Each question MUST include 4 distinct options: (a), (b), (c), (d).
  * In the JSON, include the options in "choices": ["(a) ...", "(b) ...", "(c) ...", "(d) ..."] and in "text".
  * Set "marks": 1, "type": "mcq".
- Questions 13 to 16: Assertion-Reason Questions, 1 Mark each.
  * Question text format:
    "Two statements are given-one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer to these questions from the codes (a), (b), (c) and (d) as given below:\\n(a) Both A and R are true and R is the correct explanation of A.\\n(b) Both A and R are true but R is NOT the correct explanation of A.\\n(c) A is true but R is false.\\n(d) A is false and R is also false (or R is true).\\n\\nAssertion (A): [Clear physics statement]\\nReason (R): [Clear physics explanation]"
  * Provide options (a), (b), (c), (d) in "choices".
  * Set "marks": 1, "type": "assertionReason".

----------------------------------------------------------------------
SECTION B: Questions 17 to 21 (5 Questions x 2 Marks = 10 Marks)
----------------------------------------------------------------------
- Very Short Answer (VSA) / short numerical problems / conceptual reasoning.
- To be answered in 30-40 words or a 2-3 step calculation.
- Questions should test understanding of principles, definitions, simple graphs, or direct formula-based numericals.
- At least one question (e.g. Q20 or Q21) MUST include an internal choice with an "orQuestion" and "orSolution".
- Set "marks": 2, "type": "vsa".

----------------------------------------------------------------------
SECTION C: Questions 22 to 28 (7 Questions x 3 Marks = 21 Marks)
----------------------------------------------------------------------
- Short Answer (SA) / standard derivations / multi-step numericals.
- To be answered in 50-60 words or a 4-5 step calculation.
- Must cover important derivations (e.g., lens maker's formula, drift velocity relation, Biot-Savart circular coil, Huygens proof of reflection/refraction, Bohr's radius, etc.) and numerical problems with proper SI units.
- At least one question (e.g. Q26 or Q27) MUST include an internal choice with an "orQuestion" and "orSolution".
- Set "marks": 3, "type": "sa".

----------------------------------------------------------------------
SECTION D: Questions 29 and 30 (2 Questions x 4 Marks = 8 Marks)
----------------------------------------------------------------------
- Case-Based / Data-Based / Source-Based Integrated Questions.
- Each question consists of an informative paragraph/passage (120-180 words) introducing a real-world physics application or experimental setup (e.g., Optical Fibres in telecommunications, Moving Coil Galvanometer sensitivity, LCR series resonance in tuning circuits, Photoelectric cell in light meters, Nuclear reactor binding energy, p-n junction diode rectification).
- Followed by 3 structured sub-questions:
  * (i) Sub-question 1 (1 Mark)
  * (ii) Sub-question 2 (1 Mark)
  * (iii) Sub-question 3 (2 Marks) - WITH AN INTERNAL CHOICE:
    "Answer either sub-part (iii) OR the following alternative sub-part (iii): [Alternative 2-mark question]"
- Set "marks": 4, "type": "caseStudy".

----------------------------------------------------------------------
SECTION E: Questions 31, 32, and 33 (3 Questions x 5 Marks = 15 Marks)
----------------------------------------------------------------------
- Long Answer (LA) questions testing in-depth conceptual grasp and analytical rigor.
- Typical CBSE 5-mark structure:
  * Part (a): Key derivation, theorem statement, or working principle (3 Marks).
  * Part (b): Numerical problem or graphical application based on the concept (2 Marks).
- ALL THREE QUESTIONS (Q31, Q32, Q33) MUST HAVE AN INTERNAL CHOICE!
  * Every question in Section E must have a complete alternative question in "orQuestion", with corresponding step-by-step answer in "orSolution".
  * The choice questions must be from the same unit/topic pair to maintain fairness.
- Set "marks": 5, "type": "la".

----------------------------------------------------------------------
CRITICAL PHYSICS QUALITY & NUMERICAL ACCURACY DIRECTIVE
----------------------------------------------------------------------
1. Numerical Balance: Approximately 30% to 35% of total marks (around 22-25 marks) should be numerical problems. All numericals must have physically realistic values, correct orders of magnitude, and clear SI units.
2. Derivations & Diagrams: Questions asking for derivations must clearly specify the assumptions and state what is to be derived.
3. Competency & Application: At least 40% of questions should test higher-order thinking, practical applications, graph interpretation, and conceptual analysis.
4. Total Marks Check:
   - Section A: 16 x 1 = 16 Marks
   - Section B: 5 x 2 = 10 Marks
   - Section C: 7 x 3 = 21 Marks
   - Section D: 2 x 4 = 8 Marks
   - Section E: 3 x 5 = 15 Marks
   - Grand Total = 16 + 10 + 21 + 8 + 15 = 70 Marks exactly. 33 Questions exactly.
5. All 33 questions MUST be sequentially numbered: "1. ...", "2. ...", ..., "33. ...".
6. ${solutionDirective}

OUTPUT STRICTLY A SINGLE VALID JSON OBJECT MATCHING THE SCHEMA BELOW. DO NOT WRAP WITH MARKDOWN OR BACKTICKS.

{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions & Assertion-Reason (16 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [Physics MCQ stem with clear conditions] ...",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(a) [Option A with SI unit]",
            "(b) [Option B with SI unit]",
            "(c) [Option C with SI unit]",
            "(d) [Option D with SI unit]"
          ],
          "orQuestion": null,
          "solution": "(a) [Option A] - [1-2 lines step-by-step physical reasoning or calculation]",
          "orSolution": null
        },
        ...
        {
          "id": "q13",
          "text": "13. Two statements are given-one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the codes (a), (b), (c) and (d):\\nAssertion (A): ...\\nReason (R): ...",
          "marks": 1,
          "type": "assertionReason",
          "choices": [
            "(a) Both A and R are true and R is the correct explanation of A.",
            "(b) Both A and R are true but R is NOT the correct explanation of A.",
            "(c) A is true but R is false.",
            "(d) A is false and R is also false."
          ],
          "orQuestion": null,
          "solution": "(a) - [Physics reasoning explaining why Assertion and Reason are true and linked]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Very Short Answer Questions (10 Marks)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q17",
          "text": "17. [2-Mark conceptual question or short numerical problem with given data]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step answer: 1 Mark for formula/concept, 1 Mark for calculation/final answer with units]",
          "orSolution": null
        },
        ...
        {
          "id": "q21",
          "text": "21. [2-Mark Question on electromagnetic waves / modern physics]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": "[Alternative 2-Mark Question from the same unit]",
          "solution": "[Step-by-step solution for primary question with mark allocation]",
          "orSolution": "[Step-by-step solution for internal choice question with mark allocation]"
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer Questions (21 Marks)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q22",
          "text": "22. [3-Mark Derivation or multi-step numerical from Electrostatics / Current / Magnetism]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step derivation or calculation: 1 Mark diagram/formula, 1 Mark working, 1 Mark final result]",
          "orSolution": null
        },
        ...
        {
          "id": "q28",
          "text": "28. [3-Mark Question with internal choice]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 3-Mark Question]",
          "solution": "[Comprehensive 3-mark solution]",
          "orSolution": "[Comprehensive 3-mark choice solution]"
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Case-Based Questions (8 Marks)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q29",
          "text": "29. Read the following paragraph and answer the questions that follow:\\n\\n[Passage on a physical phenomenon e.g., Total Internal Reflection in Optical Fibres, 120-150 words]\\n\\n(i) [1-Mark sub-question]\\n(ii) [1-Mark sub-question]\\n(iii) [2-Mark sub-question]\\nOR\\n(iii) [Alternative 2-Mark sub-question]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1M Answer]\\n(ii) [1M Answer]\\n(iii) [2M Step-by-step working]\\nAlternative (iii): [2M Step-by-step working]",
          "orSolution": null
        },
        {
          "id": "q30",
          "text": "30. Read the following paragraph and answer the questions that follow:\\n\\n[Passage on semiconductor p-n junction / photoelectric effect, 120-150 words]\\n\\n(i) [1-Mark sub-question]\\n(ii) [1-Mark sub-question]\\n(iii) [2-Mark sub-question]\\nOR\\n(iii) [Alternative 2-Mark sub-question]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1M Answer]\\n(ii) [1M Answer]\\n(iii) [2M Step-by-step working]\\nAlternative (iii): [2M Step-by-step working]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Long Answer Questions (15 Marks)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q31",
          "text": "31. (a) [Derivation or fundamental principle, e.g. Gauss's law application or electric potential of a dipole] (3 Marks)\\n(b) [Numerical problem applying the formula] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Derivation, e.g. Capacitance of parallel plate capacitor with dielectric slab] (3 Marks)\\n(b) [Numerical problem on capacitor combination] (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q31 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q31 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]"
        },
        {
          "id": "q32",
          "text": "32. (a) [Derivation, e.g. Biot-Savart law for circular coil or AC generator principle and working] (3 Marks)\\n(b) [Numerical on moving coil galvanometer or LCR series resonance] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Derivation, e.g. Transformer principle, working, and energy losses] (3 Marks)\\n(b) [Numerical on transformer turns ratio and power efficiency] (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q32 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q32 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]"
        },
        {
          "id": "q33",
          "text": "33. (a) [Derivation, e.g. Lens Maker's formula or Huygens wave theory proof of refraction] (3 Marks)\\n(b) [Numerical on compound microscope magnification or Young's double slit fringe width] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Derivation, e.g. Astronomical telescope in normal adjustment with labelled ray diagram] (3 Marks)\\n(b) [Numerical on combination of thin lenses in contact] (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q33 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q33 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]"
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 70-Mark, 5-Section, 36-Question examination paper prompt for CBSE Class 12 Computer Science (Subject Code 083).
 * Strictly adheres to the 2025-26 Course Structure, 3 Units, 14 Chapters, and official CBSE Examination Blueprint.
 */
function buildClass12CSFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED CHAPTER FOCUS ---
When generating questions across all 5 sections, strictly prioritize and select content from these selected chapters/units chosen by the user:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated questions originate strictly from these chosen chapters. Distribute the 36 questions and 70 marks proportionally among the selected chapters.`
      : `--- FULL SYLLABUS UNIT-WISE MARKS DISTRIBUTION ---
Follow the official CBSE 2025-26 Course Structure and Unit Weightage strictly:
- Unit 1: Computational Thinking and Programming - 2 => 40 Marks (12 VSA 1M, 3 SA-I 2M, 3 SA-II 3M, 2 LA 4M, 1 VLA 5M)
- Unit 2: Computer Networks => 10 Marks (3 VSA 1M, 1 SA-I 2M, 1 VLA 5M Case Study)
- Unit 3: Database Management => 20 Marks (5 VSA 1M, 2 SA-I 2M, 1 SA-II 3M, 2 LA 4M)
Total = 40 + 10 + 20 = 70 Marks (36 Questions).`;

  return `
You are a Senior CBSE Examination Paper Setter and Chief Moderator for Class 12 Computer Science (Subject Code 083) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 12 Computer Science Theory Question Paper for 2025-26.

Total Marks: 70
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: Computer Science (Subject Code 083)
Class: Class 12 (CBSE Senior Secondary)

======================================================================
CRITICAL CBSE SYLLABUS & PRESCRIBED UNITS DIRECTIVE (2025-26)
======================================================================
Prescribed Units & Topics:
1. Unit 1: Computational Thinking and Programming - 2 (40 Marks)
   - Revision of Python topics covered in Class XI:
     * Python basics, tokens, keywords, identifiers, literals, operators, data types (mutable vs immutable: lists, tuples, strings, dictionaries, sets).
     * Flow of control: conditional statements (if-elif-else), loops (for, while, range()), jump statements (break, continue, pass).
     * String methods and slicing; list operations and nested lists; tuple packing/unpacking; dictionary key-value operations.
   - Functions:
     * Types: built-in functions (len, type, id, min, max, sum, eval), functions defined in module (math: ceil, floor, pow, sqrt; random: random, randint, randrange), user-defined functions.
     * Creating functions using 'def', return statement(s).
     * Arguments & Parameters: positional arguments, default arguments, keyword arguments.
     * Scope of variables: local vs global scope, 'global' statement.
     * Flow of execution and call stack.
   - Exception Handling:
     * Concept of exceptions, handling exceptions using try-except-finally blocks, built-in exception types (ValueError, ZeroDivisionError, IndexError, KeyError, TypeError, FileNotFoundError).
   - File Handling:
     * Types of files: Text files, Binary files, CSV files. Relative vs absolute file paths.
     * Text Files: opening modes (r, r+, w, w+, a, a+), closing, opening using 'with' statement. Writing using write() and writelines(). Reading using read(), readline(), and readlines(). Using seek() and tell() methods. String manipulation on file data (counting vowels, consonants, specific words, uppercase/lowercase letters, lines starting with specific characters).
     * Binary Files: file open modes (rb, rb+, wb, wb+, ab, ab+), pickle module (dump() and load() methods). File operations: write/create, read, search records by primary key (roll no, employee id), append records, update records.
     * CSV Files: import csv module, opening modes, csv.writer() with writerow() and writerows(), csv.reader(), newline='' parameter, reading, writing, and searching tabular records.
   - Data Structures - Stack:
     * Stack concept (LIFO - Last In First Out).
     * Operations: Push (adding element), Pop (removing top element with underflow check), Peek/Display.
     * Implementation of stack using Python list.

2. Unit 2: Computer Networks (10 Marks)
   - Evolution of Networking: ARPANET, NSFNET, INTERNET.
   - Data Communication Terminologies: Concept of communication, sender, receiver, message, medium, protocols. Bandwidth, data transfer rates (bps, kbps, Mbps, Gbps). IP address, MAC address, packet switching vs circuit switching.
   - Transmission Media:
     * Wired/Guided: Twisted pair cable (UTP, STP), Co-axial cable, Fiber-optic cable.
     * Wireless/Unguided: Radio waves, Micro waves, Infrared waves.
   - Network Devices: Modem, Ethernet card, RJ45 connector, Repeater, Hub (active/passive), Switch, Router, Gateway, Wi-Fi card.
   - Network Topologies & Network Types:
     * Topologies: Bus, Star, Tree topologies (advantages and disadvantages).
     * Network Types: PAN, LAN, MAN, WAN.
   - Network Protocols: HTTP, HTTPS, FTP, PPP, SMTP, POP3, TCP/IP, TELNET, VoIP.
   - Web Services: WWW, HTML, XML, domain name system (DNS), URL, website, web browser, web servers, web hosting.

3. Unit 3: Database Management (20 Marks)
   - Database Concepts & Relational Data Model:
     * Need for database, database management system advantages.
     * Relational model: relation (table), attribute (column), tuple (row), domain, degree (number of attributes), cardinality (number of tuples).
     * Keys: Candidate key, Primary key, Alternate key, Foreign key (referential integrity).
   - Structured Query Language (SQL):
     * DDL vs DML commands.
     * Data types: char(n), varchar(n), int, float, date (YYYY-MM-DD).
     * Constraints: NOT NULL, UNIQUE, PRIMARY KEY, DEFAULT.
     * SQL Commands:
       - CREATE DATABASE, USE, SHOW DATABASES, DROP DATABASE.
       - SHOW TABLES, CREATE TABLE, DESCRIBE / DESC, ALTER TABLE (ADD column, DROP column, MODIFY datatype, ADD PRIMARY KEY), DROP TABLE.
       - INSERT INTO ... VALUES ..., SELECT ... FROM ... WHERE ...
       - Operators: mathematical (+, -, *, /, %), relational (=, <, >, <=, >=, <>, !=), logical (AND, OR, NOT).
       - Clauses: alias (AS), DISTINCT, WHERE, IN, BETWEEN ... AND ..., ORDER BY (ASC, DESC), IS NULL, IS NOT NULL, LIKE (% and _).
       - UPDATE ... SET ... WHERE ..., DELETE FROM ... WHERE ...
       - Aggregate Functions: MAX(), MIN(), AVG(), SUM(), COUNT(), COUNT(*).
       - GROUP BY and HAVING clauses (grouping and group filtering).
       - Joins: Cartesian product (Degree = deg1 + deg2, Cardinality = card1 * card2), Equi-join, Natural join.
   - Python-SQL Database Connectivity:
     * mysql.connector module.
     * Steps: connect(host, user, password, database), cursor(), execute(query), commit(), fetchone(), fetchall(), rowcount.
     * Parameterized queries using %s format specifier or format().

${targetChaptersDirective}

======================================================================
EXACT CBSE QUESTION PAPER BLUEPRINT & SECTION-WISE SPECIFICATION
======================================================================
The paper consists of 36 compulsory questions divided into 5 Sections: Section A, Section B, Section C, Section D, and Section E.
All questions are compulsory. Internal choices are provided in:
- At least two questions in Section B (2 marks)
- At least two questions in Section C (3 marks)
- At least one question in Section D (4 marks)
- BOTH questions in Section E (5 marks each - Q35 has full internal choice, Q36 has choice in sub-question)

----------------------------------------------------------------------
SECTION A: Questions 1 to 20 (20 Questions x 1 Mark = 20 Marks)
----------------------------------------------------------------------
- Questions 1 to 18: Multiple Choice Questions (MCQs), 1 Mark each.
  * 11-12 questions from Unit 1: Python expression evaluation, operators, mutable/immutable types, string slicing, loop execution count, function return type, random module randint/randrange limits, file open modes, stack LIFO concept.
  * 2-3 questions from Unit 2: Network devices (repeater, router, gateway), transmission media, network topologies, protocols (VoIP, SMTP, HTTPS), bandwidth units.
  * 4-5 questions from Unit 3: Degree and cardinality calculation, primary vs candidate key, DDL vs DML identification, SQL clauses (DISTINCT, LIKE, NULL, aggregate function behavior).
  * Each question MUST include 4 distinct options: (a), (b), (c), (d).
  * In the JSON, include the options in "choices": ["(a) ...", "(b) ...", "(c) ...", "(d) ..."] and in "text".
  * Set "marks": 1, "type": "mcq".
- Questions 19 and 20: Assertion-Reason Questions, 1 Mark each.
  * Format:
    "Two statements are given-one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the codes (a), (b), (c) and (d) as given below:\\n(a) Both A and R are true and R is the correct explanation of A.\\n(b) Both A and R are true but R is NOT the correct explanation of A.\\n(c) A is true but R is false.\\n(d) A is false and R is also false (or R is true).\\n\\nAssertion (A): [Clear CS concept statement]\\nReason (R): [Clear CS explanation]"
  * Provide options (a), (b), (c), (d) in "choices".
  * Set "marks": 1, "type": "assertionReason".

----------------------------------------------------------------------
SECTION B: Questions 21 to 26 (6 Questions x 2 Marks = 12 Marks)
----------------------------------------------------------------------
- Very Short Answer (VSA) / Short Answer I questions.
- Distribution:
  * 3 Questions from Unit 1: Python output prediction with code snippet, rewriting erroneous code (identifying syntax/logical errors), or exception handling try-except block.
  * 1 Question from Unit 2: Networking question (e.g. difference between packet and circuit switching, hub vs switch, twisted pair vs optical fiber, star vs bus topology).
  * 2 Questions from Unit 3: Database concepts (candidate key vs alternate key, degree vs cardinality with table example, difference between CHAR and VARCHAR, DDL vs DML commands).
- At least TWO questions in Section B MUST include an internal choice with an "orQuestion" and "orSolution".
- Set "marks": 2, "type": "vsa".

----------------------------------------------------------------------
SECTION C: Questions 27 to 30 (4 Questions x 3 Marks = 12 Marks)
----------------------------------------------------------------------
- Short Answer II questions testing programming and database skills.
- Distribution:
  * 3 Questions from Unit 1:
    - Q27: Predict the output of a Python code snippet involving functions, scope (global/local), mutable default parameters, or list/string transformations.
    - Q28: Python text file handling function (e.g., write a function count_words() that reads a text file and counts words ending with 'e' or vowels).
    - Q29: Stack implementation function in Python (e.g., write Push(stack, item) and Pop(stack) functions for a stack containing customer/book details).
  * 1 Question from Unit 3:
    - Q30: SQL queries based on a given table structure with sample records (3 distinct queries using GROUP BY, HAVING, COUNT, AVG, or ORDER BY).
- At least TWO questions in Section C MUST include an internal choice with an "orQuestion" and "orSolution".
- Set "marks": 3, "type": "sa".

----------------------------------------------------------------------
SECTION D: Questions 31 to 34 (4 Questions x 4 Marks = 16 Marks)
----------------------------------------------------------------------
- Long Answer questions testing file programming and database querying.
- Distribution:
  * 2 Questions from Unit 1:
    - Q31: Binary file handling program using pickle module. Write functions to: (a) Insert/Add records (e.g., [RollNo, Name, Marks]), and (b) Search or Update records for a given RollNo.
    - Q32: CSV file handling program using csv module. Write functions to: (a) Add/Write user records to a CSV file using csv.writer(), and (b) Read and search/filter records using csv.reader().
  * 2 Questions from Unit 3:
    - Q33: SQL Query Writing based on two relational tables (e.g., DOCTOR and PATIENT, or ITEM and CUSTOMER). Write 4 SQL queries testing WHERE, LIKE, ORDER BY, and an Equi-Join/Cartesian product between the two tables.
    - Q34: Predict the Output of 4 SQL queries based on given tables OR write Python-SQL connectivity code using mysql.connector to insert, delete, or fetch records.
- At least ONE question in Section D MUST include an internal choice with an "orQuestion" and "orSolution".
- Set "marks": 4, "type": "caseStudy".

----------------------------------------------------------------------
SECTION E: Questions 35 and 36 (2 Questions x 5 Marks = 10 Marks)
----------------------------------------------------------------------
- Very Long Answer / Integrated Case Study questions (5 Marks each).
- Q35 (5 Marks, Unit 1 - Computational Thinking):
  * Comprehensive Python Programming / Data Structure question.
  * E.g., Complete binary file manipulation with multiple functions (Insert, Search, Delete/Count) OR complete Stack implementation with menu-driven push, pop, display.
  * MUST HAVE A FULL INTERNAL CHOICE: Provide a complete alternative 5-mark programming question in "orQuestion" and "orSolution"!
  * Set "marks": 5, "type": "la".
- Q36 (5 Marks, Unit 2 - Computer Networks):
  * Real-World Campus / Multi-Block Networking Case Study!
  * Scenario: A company / university / hospital is setting up its network across multiple wings/blocks (e.g., Wing A, Wing B, Wing C, Wing D).
  * Given: Table of distances between wings (in meters) and Table of number of computers in each wing.
  * 5 structured sub-questions (1 Mark each):
    (i) Suggest the most suitable block to install the server and justify.
    (ii) Suggest the best cable layout (topology) to connect all the blocks with minimum cabling.
    (iii) Which device should be placed in each wing to connect computers, and where should a repeater be placed?
    (iv) The organization wants to connect its head office located in another city (350 km away). Suggest the most economical yet high-speed connection medium (Satellite / Microwave / Optical Fiber).
    (v) Suggest an appropriate protocol or software for conducting live video conferences / VoIP calls between staff.
  * Provide an internal choice for one of the sub-questions (e.g., sub-part iv or v).
  * Set "marks": 5, "type": "la".

----------------------------------------------------------------------
CRITICAL PROGRAMMING & CODE ACCURACY DIRECTIVE
----------------------------------------------------------------------
1. Syntax Correctness: All Python code must be 100% syntactically valid in Python 3.x.
2. Output Determinate: Output-finding questions must have exact, predictable outputs without ambiguities.
3. SQL Queries: Queries must use standard ANSI/MySQL syntax with correct table and column names.
4. Total Marks Check:
   - Section A: 20 x 1 = 20 Marks
   - Section B: 6 x 2 = 12 Marks
   - Section C: 4 x 3 = 12 Marks
   - Section D: 4 x 4 = 16 Marks
   - Section E: 2 x 5 = 10 Marks
   - Grand Total = 20 + 12 + 12 + 16 + 10 = 70 Marks exactly. 36 Questions exactly.
5. All 36 questions MUST be sequentially numbered: "1. ...", "2. ...", ..., "36. ...".
6. ${solutionDirective}

OUTPUT STRICTLY A SINGLE VALID JSON OBJECT MATCHING THE SCHEMA BELOW. DO NOT WRAP WITH MARKDOWN OR BACKTICKS.

{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions & Assertion-Reason (20 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [Python/Networking/SQL MCQ stem] ...",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(a) [Option A]",
            "(b) [Option B]",
            "(c) [Option C]",
            "(d) [Option D]"
          ],
          "orQuestion": null,
          "solution": "(a) [Option A] - [1-2 lines explanation/calculation]",
          "orSolution": null
        },
        ...
        {
          "id": "q19",
          "text": "19. Two statements are given-one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the codes (a), (b), (c) and (d):\\nAssertion (A): ...\\nReason (R): ...",
          "marks": 1,
          "type": "assertionReason",
          "choices": [
            "(a) Both A and R are true and R is the correct explanation of A.",
            "(b) Both A and R are true but R is NOT the correct explanation of A.",
            "(c) A is true but R is false.",
            "(d) A is false and R is also false."
          ],
          "orQuestion": null,
          "solution": "(a) - [Explanation]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Very Short Answer / Short Answer I Questions (12 Marks)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q21",
          "text": "21. [2-Mark Python output prediction / function / networking / SQL question]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step answer with marking points]",
          "orSolution": null
        },
        ...
        {
          "id": "q26",
          "text": "26. [2-Mark Question with internal choice]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": "[Alternative 2-Mark Question from the same unit]",
          "solution": "[Step-by-step solution for primary question]",
          "orSolution": "[Step-by-step solution for choice question]"
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer II Questions (12 Marks)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q27",
          "text": "27. [3-Mark Python output prediction or text file function]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step code/output with 3-mark breakdown]",
          "orSolution": null
        },
        ...
        {
          "id": "q30",
          "text": "30. [3-Mark SQL queries based on table]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 3-Mark SQL / Python question]",
          "solution": "[SQL queries with 1 mark each]",
          "orSolution": "[Alternative solution]"
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Long Answer Questions (16 Marks)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q31",
          "text": "31. [4-Mark Binary file handling program using pickle module with 2 functions]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "[Complete Python code: 2 Marks for function (a), 2 Marks for function (b)]",
          "orSolution": null
        },
        {
          "id": "q32",
          "text": "32. [4-Mark CSV file handling program using csv module with 2 functions]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "[Complete Python code: 2 Marks for writer function, 2 Marks for reader function]",
          "orSolution": null
        },
        {
          "id": "q33",
          "text": "33. Consider the following tables DOCTOR and PATIENT:\\n\\n[Table structures and records]\\n\\nWrite SQL queries for the following:\\n(i) ...\\n(ii) ...\\n(iii) ...\\n(iv) ...",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [Query 1 - 1 Mark]\\n(ii) [Query 2 - 1 Mark]\\n(iii) [Query 3 - 1 Mark]\\n(iv) [Query 4 - 1 Mark]",
          "orSolution": null
        },
        {
          "id": "q34",
          "text": "34. [4-Mark SQL output prediction on tables OR Python-SQL connectivity program]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": "[Alternative 4-Mark SQL / Python-SQL question]",
          "solution": "[Detailed query outputs or Python database code]",
          "orSolution": "[Detailed alternative solution]"
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Very Long Answer Questions (10 Marks)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q35",
          "text": "35. [5-Mark Comprehensive Python program on Stack operations or complex file handling]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative 5-Mark Comprehensive Python program]",
          "solution": "Detailed marking scheme & complete Python program solution:\\n[Complete code with docstrings, push, pop, display: 5 Marks]",
          "orSolution": "Detailed marking scheme & complete alternative Python program solution:\\n[Complete code with 5 Marks breakdown]"
        },
        {
          "id": "q36",
          "text": "36. [Real-World Campus Network Case Study scenario with tables of distances and computer counts]\\n\\nAnswer the following questions:\\n(a) Suggest the most suitable block to install the server and justify. (1 Mark)\\n(b) Suggest the best cable layout (topology) to connect all blocks. (1 Mark)\\n(c) Suggest placement of repeater and hub/switch. (1 Mark)\\n(d) Suggest economical high-speed connectivity to distant branch. (1 Mark)\\n(e) Suggest protocol/service for video conferencing. (1 Mark)\\nOR\\n(e) [Alternative sub-question] (1 Mark)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Detailed marking points for Q36:\\n(a) ... [1 Mark]\\n(b) ... [1 Mark]\\n(c) ... [1 Mark]\\n(d) ... [1 Mark]\\n(e) ... [1 Mark]\\nAlternative (e): ... [1 Mark]",
          "orSolution": null
        }
      ]
    }
  ]
}
`;
}

/**
 * Specialized Prompt Builder for CBSE Class 12 Biology (Subject Code: 044)
 * Official CBSE Board Pattern (Latest Curriculum):
 * Total Marks: 70 | Time: 3 Hours
 * Total Questions: 33 Questions across 5 Sections:
 * - Section A: Q1-Q16 (16 Marks): 12 MCQs (Q1-Q12) + 4 Assertion-Reason (Q13-Q16) (1 Mark each)
 * - Section B: Q17-Q21 (10 Marks): 5 Very Short Answer (2 Marks each, choice in 1 question)
 * - Section C: Q22-Q28 (21 Marks): 7 Short Answer (3 Marks each, choice in 1 question)
 * - Section D: Q29-Q30 (8 Marks): 2 Case-Based Questions (4 Marks each with subparts: (i) 1M, (ii) 1M, (iii) 2M with internal choice)
 * - Section E: Q31-Q33 (15 Marks): 3 Long Answer Questions (5 Marks each, ALL 3 with internal choices)
 *
 * Official Unit Weightage (70 Marks Total):
 * - Unit I: Reproduction (15 Marks) - Chapters 1, 2, 3
 * - Unit II: Genetics and Evolution (20 Marks) - Chapters 4, 5, 6
 * - Unit III: Biology and Human Welfare (14 Marks) - Chapters 7, 8
 * - Unit IV: Biotechnology and its Applications (11 Marks) - Chapters 9, 10
 * - Unit V: Ecology and Environment (10 Marks) - Chapters 11, 12, 13
 */
function buildClass12BiologyFullExamPrompt(
  config: PaperConfig,
  solutionDirective: string
): string {
  const selectedChapters =
    config.selectedChapters && config.selectedChapters.length > 0
      ? config.selectedChapters.join(", ")
      : "All Prescribed Chapters (Full Syllabus - 5 Units, 13 Chapters)";

  return `
You are a Senior CBSE Examination Paper Setter and Chief Moderator for Class 12 Biology (Subject Code: 044) with over 20 years of experience.
Your task is to generate an authentic, fully curriculum-compliant, and impeccably accurate CBSE Class 12 Biology Question Paper (70 Marks, 3 Hours) strictly according to the latest CBSE Examination Blueprint and Course Structure.

TARGET SUBJECT: CBSE Class 12 Biology (Subject Code: 044)
EXAM TYPE: ${config.examType.toUpperCase().replace("_", " ")}
TARGET CHAPTERS / SYLLABUS:
${selectedChapters}

--- OFFICIAL COURSE STRUCTURE & PRESCRIBED UNITS (70 MARKS TOTAL) ---
1. Unit I: Reproduction (15 Marks)
   - Chapter-1: Sexual Reproduction in Flowering Plants (Flower structure; development of male and female gametophytes; pollination - types, agencies and examples; outbreeding devices; pollen-pistil interaction; double fertilization; post fertilization events - development of endosperm and embryo, development of seed and formation of fruit; special modes - apomixis, parthenocarpy, polyembryony; Significance of seed dispersal and fruit formation).
   - Chapter-2: Human Reproduction (Male and female reproductive systems; microscopic anatomy of testis and ovary; gametogenesis - spermatogenesis and oogenesis; menstrual cycle; fertilisation, embryo development upto blastocyst formation, implantation; pregnancy and placenta formation; parturition; lactation).
   - Chapter-3: Reproductive Health (Need for reproductive health and prevention of STDs; birth control - need and methods, contraception and medical termination of pregnancy - MTP; amniocentesis; infertility and assisted reproductive technologies - IVF, ZIFT, GIFT).

2. Unit II: Genetics and Evolution (20 Marks)
   - Chapter-4: Principles of Inheritance and Variation (Heredity and variation, Mendelian inheritance; deviations from Mendelism - incomplete dominance, co-dominance, multiple alleles and inheritance of blood groups, pleiotropy; elementary idea of polygenic inheritance; chromosome theory of inheritance; chromosomes and genes; Sex determination in humans, birds and honey bee, linkage and crossing over; sex-linked inheritance - haemophilia, colour blindness; Mendelian disorders in humans - thalassemias; chromosomal disorders in humans - Down's syndrome, Turner's and Klinefelter's syndromes).
   - Chapter-5: Molecular Basis of Inheritance (Search for genetic material and DNA as genetic material; Structure of DNA and RNA; DNA packaging; Central Dogma; transcription, genetic code, translation; gene expression and regulation - lac operon; Genome, Human and rice genome project; DNA fingerprinting).
   - Chapter-6: Evolution (Origin of life; biological evolution and evidences for biological evolution: paleontology, comparative anatomy, embryology and molecular evidences; Darwin's contribution, modern synthetic theory of evolution; mechanism of evolution - variation by mutation and recombination and natural selection with examples, types of natural selection; Gene flow and genetic drift; Hardy-Weinberg's principle; adaptive radiation; human evolution).

3. Unit III: Biology and Human Welfare (14 Marks)
   - Chapter-7: Human Health and Diseases (Pathogens; parasites causing human diseases: malaria, dengue, chikungunya, filariasis, ascariasis, typhoid, pneumonia, common cold, amoebiasis, ring worm and their control; Basic concepts of immunology - vaccines; cancer, HIV and AIDS; Adolescence - drug and alcohol abuse).
   - Chapter-8: Microbes in Human Welfare (Microbes in food processing, industrial production, sewage treatment, energy generation - biogas, and microbes as bio-control agents and bio-fertilizers; Antibiotics - production and judicious use).

4. Unit IV: Biotechnology and its Applications (11 Marks)
   - Chapter-9: Biotechnology - Principles and Processes (Genetic Engineering - Recombinant DNA Technology, tools: restriction enzymes, DNA ligase, cloning vectors pBR322, competent hosts; processes of recombinant DNA technology: isolation of DNA, PCR, insertion, bioreactors, downstream processing).
   - Chapter-10: Biotechnology and its Applications (Applications of biotechnology in health and agriculture: Human insulin production, vaccine production, stem cell technology, gene therapy - ADA deficiency; genetically modified organisms - Bt crops: Bt cotton, pest-resistant tobacco; transgenic animals; biosafety issues, biopiracy and patents).

5. Unit V: Ecology and Environment (10 Marks)
   - Chapter-11: Organisms and Populations (Population interactions - mutualism, competition, predation, parasitism; population attributes - growth models: exponential and logistic growth, birth rate, death rate, age distribution pyramids).
   - Chapter-12: Ecosystem (Ecosystem patterns, components, productivity: primary and secondary, decomposition; energy flow, 10% law; ecological pyramids: pyramids of number, biomass, energy).
   - Chapter-13: Biodiversity and Conservation (Biodiversity: concept, patterns - latitudinal gradients and species-area relationship, importance and rivet popper hypothesis; loss of biodiversity - evil quartet; biodiversity conservation: in-situ and ex-situ; hotspots, endangered organisms, extinction, Red Data Book, Sacred Groves, biosphere reserves, national parks, wildlife sanctuaries, Ramsar sites).

STRICTLY DELETED / EXCLUDED TOPICS (NEVER GENERATE QUESTIONS FROM THESE):
- Old Chapter 1: Reproduction in Organisms (DELETED)
- Old Chapter 9: Strategies for Enhancement in Food Production (DELETED)
- Old Chapter 16: Environmental Issues (DELETED)
- In Chapter 11 (Organisms and Populations): "Organism and its Environment", "Major Abiotic Factors (temperature, water, light, soil)", "Responses to Abiotic Factors", and "Adaptations" are EXCLUDED.
- In Chapter 12 (Ecosystem): "Ecological Succession" and "Nutrient Cycles" are EXCLUDED.

--- OFFICIAL QUESTION PAPER BLUEPRINT (STRICT 70 MARKS, 33 QUESTIONS, 5 SECTIONS) ---
The paper must have EXACTLY 33 questions distributed across 5 Sections as follows:

SECTION A: Questions 1 to 16 (16 Marks)
- Q1 to Q12: 12 Multiple Choice Questions (1 Mark each). Exactly 4 plausible options labeled (a), (b), (c), (d).
- Q13 to Q16: 4 Assertion-Reasoning Questions (1 Mark each).
  Format: Two statements are given-one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the codes (a), (b), (c) and (d):
  (a) Both A and R are true and R is the correct explanation of A.
  (b) Both A and R are true but R is NOT the correct explanation of A.
  (c) A is true but R is false.
  (d) A is false but R is true.
  All 4 options must be included in the "choices" array.

SECTION B: Questions 17 to 21 (10 Marks)
- 5 Very Short Answer Questions (2 Marks each).
- Concise, concept-driven answers (30-50 words). E.g., physiological roles, reproductive adaptations, genetic cross outcomes, immunological mechanisms.
- Exactly ONE question (Q21) MUST provide an internal choice ("orQuestion" and "orSolution").

SECTION C: Questions 22 to 28 (21 Marks)
- 7 Short Answer Questions (3 Marks each).
- Detailed conceptual questions, biological pathways, genetic crosses with Punnett square, or experimental steps (50-80 words).
- Exactly ONE question (Q28) MUST provide an internal choice ("orQuestion" and "orSolution").

SECTION D: Questions 29 and 30 (8 Marks)
- 2 Case-Based / Source-Based Questions (4 Marks each).
- Each question consists of an authentic passage / clinical scenario / experimental data table / ecological study (120-150 words) followed by sub-questions:
  (i) Sub-question 1 (1 Mark)
  (ii) Sub-question 2 (1 Mark)
  (iii) Sub-question 3 (2 Marks) OR (iii) Alternative Sub-question 3 (2 Marks)
- Must be set in "caseStudy" question type.

SECTION E: Questions 31 to 33 (15 Marks)
- 3 Long Answer Questions (5 Marks each).
- Comprehensive questions covering major biological mechanisms, developmental pathways, recombinant DNA technology, or population genetics (80-120 words).
- Structured in clear sub-parts: e.g., (a) 3 Marks + (b) 2 Marks, or (a) 2 Marks + (b) 2 Marks + (c) 1 Mark.
- ALL 3 QUESTIONS (Q31, Q32, Q33) MUST HAVE AN INTERNAL CHOICE ("orQuestion" and "orSolution") from the respective unit.

--- CRITICAL BIOLOGY ACCURACY & QUALITY RULES ---
1. Scientific Terminology & Binomial Nomenclature: Scientific names MUST be written accurately with standard conventions (e.g. Escherichia coli, Pisum sativum, Bacillus thuringiensis, Plasmodium falciparum).
2. Genetics Representation: For genetic crosses, explicitly specify parental genotypes, gametes, Punnett square representation, and phenotypic/genotypic ratios.
3. Diagrams & Processes: Where questions require diagrams (e.g. structure of antibody molecule, anatropous ovule, seminiferous tubule, lac operon, cloning vector pBR322, PCR stages), explicitly describe all key parts to be drawn or identified.
4. ${solutionDirective}
5. JSON ESCAPING: Double-escape all backslashes (\\\\). Do not use unescaped backslashes.
6. OUTPUT FORMAT: Output strictly valid JSON matching the exact schema below. Do not wrap in markdown or include extra text.

--- JSON SCHEMA TEMPLATE ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice & Assertion-Reason Questions (16 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [1-Mark MCQ Question on Reproduction/Genetics/Ecology...]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(a) [Option A]",
            "(b) [Option B]",
            "(c) [Option C]",
            "(d) [Option D]"
          ],
          "orQuestion": null,
          "solution": "(a) [Option A] - [1-2 sentences of biological reasoning]",
          "orSolution": null
        },
        ...
        {
          "id": "q13",
          "text": "13. Two statements are given-one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the codes (a), (b), (c) and (d):\\nAssertion (A): ...\\nReason (R): ...",
          "marks": 1,
          "type": "assertionReason",
          "choices": [
            "(a) Both A and R are true and R is the correct explanation of A.",
            "(b) Both A and R are true but R is NOT the correct explanation of A.",
            "(c) A is true but R is false.",
            "(d) A is false but R is true."
          ],
          "orQuestion": null,
          "solution": "(a) - [Biological explanation justifying the relationship between Assertion and Reason]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Very Short Answer Questions (10 Marks)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q17",
          "text": "17. [2-Mark concise biological question on functions, differences, or mechanisms]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step answer: 1 Mark for point 1, 1 Mark for point 2 according to CBSE marking scheme]",
          "orSolution": null
        },
        ...
        {
          "id": "q21",
          "text": "21. [2-Mark Question with internal choice]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": "[Alternative 2-Mark Question from the same unit]",
          "solution": "[Step-by-step solution for primary question with mark breakdown]",
          "orSolution": "[Step-by-step solution for internal choice question with mark breakdown]"
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer Questions (21 Marks)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q22",
          "text": "22. [3-Mark Question on genetic crosses / biotechnology / human diseases]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Detailed 3-mark step-by-step answer with official CBSE marking scheme points]",
          "orSolution": null
        },
        ...
        {
          "id": "q28",
          "text": "28. [3-Mark Question with internal choice]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 3-Mark Question from the same unit]",
          "solution": "[Comprehensive 3-mark solution]",
          "orSolution": "[Comprehensive 3-mark alternative solution]"
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Case-Based Questions (8 Marks)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q29",
          "text": "29. Read the following passage and answer the questions that follow:\\n\\n[Authentic biological case passage, e.g. on Recombinant DNA technology / Assisted Reproductive Technologies / Pedigree analysis, 120-150 words]\\n\\n(i) [1-Mark sub-question]\\n(ii) [1-Mark sub-question]\\n(iii) [2-Mark sub-question]\\nOR\\n(iii) [Alternative 2-Mark sub-question]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1M Answer]\\n(ii) [1M Answer]\\n(iii) [2M Step-by-step answer]\\nAlternative (iii): [2M Step-by-step answer]",
          "orSolution": null
        },
        {
          "id": "q30",
          "text": "30. Read the following passage and answer the questions that follow:\\n\\n[Authentic biological case passage, e.g. on Population interactions / Biodiversity hotspots / Malarial parasite life cycle, 120-150 words]\\n\\n(i) [1-Mark sub-question]\\n(ii) [1-Mark sub-question]\\n(iii) [2-Mark sub-question]\\nOR\\n(iii) [Alternative 2-Mark sub-question]",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1M Answer]\\n(ii) [1M Answer]\\n(iii) [2M Step-by-step answer]\\nAlternative (iii): [2M Step-by-step answer]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Long Answer Questions (15 Marks)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q31",
          "text": "31. (a) [Major physiological/developmental process, e.g. Oogenesis vs Spermatogenesis or Double fertilization] (3 Marks)\\n(b) [Related application/conceptual sub-question] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative 3-Mark question, e.g. Female gametophyte development] (3 Marks)\\n(b) [Related 2-Mark sub-question] (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q31 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q31 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]"
        },
        {
          "id": "q32",
          "text": "32. (a) [Major Genetics mechanism, e.g. Lac Operon regulation or DNA replication mechanism] (3 Marks)\\n(b) [Related sub-question with mutation/experimental evidence] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Genetics question, e.g. Transcription in eukaryotes / Hershey-Chase experiment] (3 Marks)\\n(b) [Related sub-question] (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q32 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q32 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]"
        },
        {
          "id": "q33",
          "text": "33. (a) [Comprehensive Biotechnology question, e.g. Recombinant DNA tools, pBR322 vector features, PCR technique] (3 Marks)\\n(b) [Application in agriculture or gene therapy] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative question from Ecology, e.g. Energy flow and ecological pyramids / Biodiversity conservation strategies] (3 Marks)\\n(b) [Related numerical or conceptual sub-question] (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q33 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q33 (a) & (b):\\n(a) ... [3 Marks]\\n(b) ... [2 Marks]"
        }
      ]
    }
  ]
}
`;
}

/**
 * Specialized Prompt Builder for CBSE Class 12 Economics (Subject Code: 030)
 * Official CBSE Board Pattern (Latest Curriculum):
 * Total Marks: 80 | Time: 3 Hours
 * Total Questions: 34 Questions across 2 Sections:
 * - Section A: Part A - Introductory Macroeconomics (40 Marks, Q1 to Q17)
 *   * Q1 to Q10: 10 MCQs (1 Mark each = 10 Marks)
 *   * Q11 to Q12: 2 Short Answer I (3 Marks each = 6 Marks, choice in 1 question)
 *   * Q13 to Q15: 3 Short Answer II (4 Marks each = 12 Marks, choice in 1 question)
 *   * Q16 to Q17: 2 Long Answer (6 Marks each = 12 Marks, choice in 1 question)
 * - Section B: Part B - Indian Economic Development (40 Marks, Q18 to Q34)
 *   * Q18 to Q27: 10 MCQs (1 Mark each = 10 Marks)
 *   * Q28 to Q29: 2 Short Answer I (3 Marks each = 6 Marks, choice in 1 question)
 *   * Q30 to Q32: 3 Short Answer II (4 Marks each = 12 Marks, choice in 1 question)
 *   * Q33 to Q34: 2 Long Answer (6 Marks each = 12 Marks, choice in 1 question)
 *
 * Official Unit Weightage (80 Marks Total):
 * - Part A: Introductory Macroeconomics (40 Marks)
 *   * Unit 1: National Income and Related Aggregates (10 Marks)
 *   * Unit 2: Money and Banking (06 Marks)
 *   * Unit 3: Determination of Income and Employment (12 Marks)
 *   * Unit 4: Government Budget and the Economy (06 Marks)
 *   * Unit 5: Balance of Payments (06 Marks)
 * - Part B: Indian Economic Development (40 Marks)
 *   * Unit 6: Development Experience (1947-90) & Economic Reforms since 1991 (12 Marks)
 *   * Unit 7: Current Challenges facing Indian Economy (20 Marks)
 *   * Unit 8: Development Experience of India - A Comparison with Neighbours (08 Marks)
 */
function buildClass12EconomicsFullExamPrompt(
  config: PaperConfig,
  solutionDirective: string
): string {
  const selectedChapters =
    config.selectedChapters && config.selectedChapters.length > 0
      ? config.selectedChapters.join(", ")
      : "All Prescribed Units & Chapters (Full Syllabus - Both Books: Introductory Macroeconomics & Indian Economic Development)";

  return `
You are a Senior CBSE Examination Paper Setter and Chief Moderator for Class 12 Economics (Subject Code: 030) with over 20 years of experience.
Your task is to generate an authentic, fully curriculum-compliant, and mathematically exact CBSE Class 12 Economics Question Paper (80 Marks, 3 Hours) strictly according to the latest CBSE Examination Blueprint and Course Structure.

TARGET SUBJECT: CBSE Class 12 Economics (Subject Code: 030)
EXAM TYPE: ${config.examType.toUpperCase().replace("_", " ")}
TARGET CHAPTERS / SYLLABUS:
${selectedChapters}

--- OFFICIAL COURSE STRUCTURE & PRESCRIBED UNITS (80 MARKS TOTAL) ---
PART-A: INTRODUCTORY MACROECONOMICS (40 MARKS)
1. Unit 1: National Income and Related Aggregates (10 Marks, 30 Periods)
   - What is Macroeconomics?
   - Basic concepts in macroeconomics: consumption goods, capital goods, final goods, intermediate goods; stocks and flows; gross investment and depreciation.
   - Circular flow of income (two sector model).
   - Methods of calculating National Income: Value Added or Product method, Expenditure method, Income method.
   - Aggregates related to National Income: Gross National Product (GNP), Net National Product (NNP), Gross Domestic Product (GDP) and Net Domestic Product (NDP) - at market price and factor cost; Real and Nominal GDP.
   - GDP Deflator, GDP and Welfare.

2. Unit 2: Money and Banking (06 Marks, 15 Periods)
   - Money: meaning and functions, supply of money - Currency held by the public and net demand deposits held by commercial banks.
   - Money creation by the commercial banking system (credit multiplier process).
   - Central bank and its functions (Reserve Bank of India): Bank of issue, Government's Bank, Banker's Bank, Control of Credit through Bank Rate, Cash Reserve Ratio (CRR), Statutory Liquidity Ratio (SLR), Repo Rate and Reverse Repo Rate, Open Market Operations, Margin requirement.

3. Unit 3: Determination of Income and Employment (12 Marks, 30 Periods)
   - Aggregate demand and its components.
   - Propensity to consume and propensity to save (average and marginal).
   - Short-run equilibrium output; investment multiplier and its mechanism.
   - Meaning of full employment and involuntary unemployment.
   - Problems of excess demand and deficient demand; measures to correct them - changes in government spending, taxes and money supply.

4. Unit 4: Government Budget and the Economy (06 Marks, 17 Periods)
   - Government budget: meaning, objectives and components.
   - Classification of receipts: revenue receipts and capital receipts.
   - Classification of expenditure: revenue expenditure and capital expenditure.
   - Balanced, Surplus and Deficit Budget: measures of government deficit (revenue deficit, fiscal deficit, primary deficit).

5. Unit 5: Balance of Payments (06 Marks, 18 Periods)
   - Balance of payments account: meaning and components (Current account, Capital account).
   - Balance of payments: Surplus and Deficit.
   - Foreign exchange rate: meaning of fixed and flexible rates and managed floating.
   - Determination of exchange rate in a free market, Merits and demerits of flexible and fixed exchange rate.
   - Managed Floating exchange rate system.

PART-B: INDIAN ECONOMIC DEVELOPMENT (40 MARKS)
6. Unit 6: Development Experience (1947-90) and Economic Reforms since 1991 (12 Marks, 28 Periods)
   - State of Indian economy on the eve of independence. Indian economic system and common goals of Five Year Plans.
   - Main features, problems and policies of agriculture (institutional aspects and new agricultural strategy / Green Revolution), industry (IPR 1956; SSI - role & importance) and foreign trade (import substitution policy).
   - Economic Reforms since 1991: Features and appraisals of liberalisation, globalisation and privatisation (LPG policy); Concepts of demonetization and GST (Goods and Services Tax).

7. Unit 7: Current Challenges Facing Indian Economy (20 Marks, 60 Periods)
   - Human Capital Formation: How people become resource; Role of human capital in economic development; Growth of Education Sector in India.
   - Rural development: Key issues - credit and marketing - role of cooperatives; agricultural diversification; alternative farming - organic farming.
   - Employment: Growth and changes in work force participation rate in formal and informal sectors; problems and policies of unemployment.
   - Sustainable Economic Development: Meaning, Effects of Economic Development on Resources and Environment, including global warming.

8. Unit 8: Development Experience of India: A Comparison with Neighbours (08 Marks, 12 Periods)
   - India and Pakistan, India and China.
   - Issues: economic growth, population, sectoral development (agriculture, industry, services), and other Human Development Indicators (HDI).

--- COGNITIVE SKILLS & ASSESSMENT FRAMEWORK (IMAGES 3 & 4) ---
1. Remembering & Understanding (32-44 Marks, 40%-55%): Definitions, economic concepts, distinctions, comparisons, and explanations.
2. Applying (18-24 Marks, 22.5%-30%): Numerical problems, diagram-based questions, policy applications.
3. Analysing, Evaluating & Creating (18-24 Marks, 22.5%-30%): Case studies, comparative data interpretation tables (India vs China vs Pakistan), policy appraisals, critical essays.

--- OFFICIAL QUESTION PAPER BLUEPRINT (STRICT 80 MARKS, 34 QUESTIONS, 2 SECTIONS) ---
The paper must have EXACTLY 34 questions distributed across 2 Sections as follows:

======================================================================
### SECTION A: INTRODUCTORY MACROECONOMICS (Questions 1 to 17, 40 Marks)
======================================================================
- Questions 1 to 10: 10 Multiple Choice Questions (1 Mark each = 10 Marks).
  * Exactly 4 plausible options labeled (a), (b), (c), (d).
  * Can include conceptual MCQs, Assertion-Reason questions, Statement 1 / Statement 2 questions, or Data-based MCQs.
  * Set "marks": 1, "type": "mcq".

- Questions 11 to 12: 2 Short Answer Type I Questions (3 Marks each = 6 Marks).
  * Word limit: 60-80 words. E.g., Circular flow of income, Investment Multiplier numerical / mechanism, Credit creation by commercial banks, Bank rate / Repo rate / CRR / SLR mechanism.
  * Exactly ONE question (Q12) MUST provide an internal choice ("orQuestion" and "orSolution").
  * Set "marks": 3, "type": "sa".

- Questions 13 to 15: 3 Short Answer Type II Questions (4 Marks each = 12 Marks).
  * Word limit: 80-100 words. E.g., Revenue vs Capital receipts/expenditure, Measures of government deficit, Foreign exchange rate determination / Managed floating, Numerical on Equilibrium Income or Investment Multiplier.
  * Exactly ONE question (Q15) MUST provide an internal choice ("orQuestion" and "orSolution").
  * Set "marks": 4, "type": "sa".

- Questions 16 to 17: 2 Long Answer Type Questions (6 Marks each = 12 Marks).
  * Word limit: 100-150 words.
  * E.g., Comprehensive Numerical on National Income calculation (Value Added, Income, or Expenditure method with complete data table), AD-AS / S-I equilibrium output determination with diagram and schedule, or Problems of Excess/Deficient demand and fiscal/monetary remedies.
  * Structured in clear sub-parts: e.g. (a) 3 Marks + (b) 3 Marks, or (a) 4 Marks + (b) 2 Marks, or full 6-mark problem.
  * Exactly ONE question (Q17) MUST provide an internal choice ("orQuestion" and "orSolution").
  * Set "marks": 6, "type": "la".

======================================================================
### SECTION B: INDIAN ECONOMIC DEVELOPMENT (Questions 18 to 34, 40 Marks)
======================================================================
- Questions 18 to 27: 10 Multiple Choice Questions (1 Mark each = 10 Marks).
  * Exactly 4 plausible options labeled (a), (b), (c), (d).
  * Can include conceptual MCQs, Assertion-Reason, Chronological ordering of events / Five-Year Plans / policies, or Table/Data-based MCQs.
  * Set "marks": 1, "type": "mcq".

- Questions 28 to 29: 2 Short Answer Type I Questions (3 Marks each = 6 Marks).
  * Word limit: 60-80 words. E.g., State of agriculture/industry on eve of independence, Common goals of Five Year Plans, Human capital sources, Organic farming benefits.
  * Exactly ONE question (Q29) MUST provide an internal choice ("orQuestion" and "orSolution").
  * Set "marks": 3, "type": "sa".

- Questions 30 to 32: 3 Short Answer Type II Questions (4 Marks each = 12 Marks).
  * Word limit: 80-100 words.
  * E.g., Data-based comparative table (India vs China vs Pakistan growth rates, sectoral shares, or HDI indicators); Rural credit and cooperatives; Formal vs informal sector employment; Sustainable development and global warming.
  * Exactly ONE question (Q32) MUST provide an internal choice ("orQuestion" and "orSolution").
  * Set "marks": 4, "type": "sa".

- Questions 33 to 34: 2 Long Answer Type Questions (6 Marks each = 12 Marks).
  * Word limit: 100-150 words.
  * E.g., Critical evaluation of 1991 Economic Reforms (LPG policies, Demonetization, GST), Agricultural reforms & Green Revolution, In-depth analysis of employment generation challenges in India, Strategies for sustainable economic development.
  * Structured in clear sub-parts: e.g. (a) 3 Marks + (b) 3 Marks or (a) 4 Marks + (b) 2 Marks or full 6-mark problem.
  * Exactly ONE question (Q34) MUST provide an internal choice ("orQuestion" and "orSolution").
  * Set "marks": 6, "type": "la".

--- CRITICAL ECONOMICS ACCURACY & CALCULATION RULES ---
1. Numerical Questions: Every numerical question on National Income, Multiplier, Deficits, or Banking MUST provide complete, logically consistent data that computes to exact, clean numbers. Solutions must demonstrate complete formulas, step-by-step arithmetic, and final answer in ₹ Crores.
2. Tables & Comparative Data: Comparative questions on India, Pakistan, and China must present clear, formatted tables with realistic indicators (GDP growth, Population, Sectoral contribution, HDI rank).
3. Assertion-Reason / Statement MCQs: Ensure statements have clear, unequivocal truth values and causal reasoning.
4. ${solutionDirective}
5. JSON ESCAPING: Double-escape all backslashes (\\\\). Do not use unescaped backslashes.
6. OUTPUT FORMAT: Output strictly valid JSON matching the exact schema below. Do not wrap in markdown or include extra text.

--- JSON SCHEMA TEMPLATE ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Introductory Macroeconomics (40 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [1-Mark MCQ Question on Macroeconomics concepts / banking / budget / BoP]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(a) [Option A]",
            "(b) [Option B]",
            "(c) [Option C]",
            "(d) [Option D]"
          ],
          "orQuestion": null,
          "solution": "(a) [Option A] - [1-2 sentences economic explanation]",
          "orSolution": null
        },
        ...
        {
          "id": "q11",
          "text": "11. [3-Mark Short Answer Question on circular flow / credit creation / money multiplier]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step answer: 1 Mark per key economic point/step, totaling 3 Marks]",
          "orSolution": null
        },
        {
          "id": "q12",
          "text": "12. [3-Mark Short Answer Question with internal choice]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 3-Mark Question on Macroeconomics]",
          "solution": "[Step-by-step 3-Mark solution for primary question]",
          "orSolution": "[Step-by-step 3-Mark solution for alternative question]"
        },
        ...
        {
          "id": "q15",
          "text": "15. [4-Mark Question on Government budget deficits / Foreign exchange / BoP with internal choice]",
          "marks": 4,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 4-Mark Question on Macroeconomics]",
          "solution": "[Comprehensive 4-Mark solution with marking points]",
          "orSolution": "[Comprehensive 4-Mark alternative solution with marking points]"
        },
        {
          "id": "q16",
          "text": "16. Calculate National Income (NNP at FC) and Gross Domestic Product at Market Price (GDP at MP) from the following data:\\n\\n[Complete tabular data in ₹ Crores]\\n\\n(a) ... (3 Marks)\\n(b) ... (3 Marks)",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Formula & Step-by-Step Calculation:\\n(a) NNP at FC = ... = ₹ ... Crores [3 Marks]\\n(b) GDP at MP = ... = ₹ ... Crores [3 Marks]",
          "orSolution": null
        },
        {
          "id": "q17",
          "text": "17. (a) Explain the determination of equilibrium level of income using Aggregate Demand and Aggregate Supply approach. Use a diagram. (4 Marks)\\n(b) Differentiate between ex-ante and ex-post investment. (2 Marks)",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) Explain the situation of Deficient Demand and its impact on output, employment and prices. (3 Marks)\\n(b) How can Open Market Operations and Bank Rate be used by the central bank to correct Deficient Demand? (3 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q17:\\n(a) ... [4 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q17:\\n(a) ... [3 Marks]\\n(b) ... [3 Marks]"
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Indian Economic Development (40 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q18",
          "text": "18. [1-Mark MCQ Question on Indian Economy 1947-90 / LPG reforms / rural development]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(a) [Option A]",
            "(b) [Option B]",
            "(c) [Option C]",
            "(d) [Option D]"
          ],
          "orQuestion": null,
          "solution": "(a) [Option A] - [1-2 sentences economic explanation]",
          "orSolution": null
        },
        ...
        {
          "id": "q28",
          "text": "28. [3-Mark Short Answer Question on Indian economic history / human capital / education]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Step-by-step 3-Mark answer with CBSE marking scheme points]",
          "orSolution": null
        },
        {
          "id": "q29",
          "text": "29. [3-Mark Short Answer Question with internal choice]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 3-Mark Question on Indian Economic Development]",
          "solution": "[Step-by-step 3-Mark solution for primary question]",
          "orSolution": "[Step-by-step 3-Mark solution for alternative question]"
        },
        ...
        {
          "id": "q30",
          "text": "30. Study the following comparative data on India, China, and Pakistan and answer the questions that follow:\\n\\n[Formatted table comparing Annual Growth Rate, Sectoral Contribution, HDI Rank]\\n\\n(a) Compare the growth experience of India and China. (2 Marks)\\n(b) Comment on the sectoral contribution to GDP in Pakistan. (2 Marks)",
          "marks": 4,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "(a) ... [2 Marks]\\n(b) ... [2 Marks]",
          "orSolution": null
        },
        {
          "id": "q32",
          "text": "32. [4-Mark Question on Rural Credit / Employment informalisation with internal choice]",
          "marks": 4,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 4-Mark Question on Indian Economic Development]",
          "solution": "[Detailed 4-Mark solution]",
          "orSolution": "[Detailed 4-Mark alternative solution]"
        },
        {
          "id": "q33",
          "text": "33. (a) Critically evaluate the economic reforms of 1991 with special focus on the Liberalisation and Privatisation policies. (4 Marks)\\n(b) State any two positive impacts of Demonetisation on the Indian economy. (2 Marks)",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Detailed marking scheme & complete solution for Q33:\\n(a) ... [4 Marks]\\n(b) ... [2 Marks]",
          "orSolution": null
        },
        {
          "id": "q34",
          "text": "34. (a) Discuss the role played by the Green Revolution in making India self-sufficient in food grains. What were its major limitations? (4 Marks)\\n(b) Outline the concept of sustainable economic development and explain two environmental challenges facing India. (2 Marks)",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) 'Human capital formation accelerates economic growth.' Defend or refute the given statement with valid arguments. (4 Marks)\\n(b) Discuss the problems faced by agricultural marketing in rural India. (2 Marks)",
          "solution": "Detailed marking scheme & complete solution for Q34:\\n(a) ... [4 Marks]\\n(b) ... [2 Marks]",
          "orSolution": "Detailed marking scheme & complete solution for alternative Q34:\\n(a) ... [4 Marks]\\n(b) ... [2 Marks]"
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 70-Mark, 5-Section, 30-Question examination paper prompt for CBSE Class 12 Geography (Code 029).
 * Strictly mirrors the official CBSE NCERT Prescribed Books (Fundamentals of Human Geography & India - People and Economy)
 * and the latest CBSE Examination Blueprint & Prescribed Map Items.
 */
function buildClass12GeographyFullExamPrompt(
  config: PaperConfig,
  solutionDirective: string
): string {
  const languagePrompt =
    config.language === "Hindi"
      ? `Generate the question paper strictly in standard academic Hindi (Devanagari script) suitable for CBSE Class 12 Geography.`
      : `Generate the question paper strictly in English suitable for CBSE Class 12 Geography.`;

  return `
You are a Senior CBSE Examination Paper Setter with 20+ years of experience in Geography (Subject Code 029).
Your task is to generate an authentic, curriculum-compliant, board-level examination paper for CBSE Class 12 Geography.

--- OFFICIAL CBSE CLASS 12 GEOGRAPHY (CODE 029) BLUEPRINT & EXAMINATION STRUCTURE ---
- Class: XII
- Subject: Geography (Code 029)
- Maximum Marks: 70 Marks (Theory: 70 Marks, Practical: 30 Marks)
- Time Allowed: 3 Hours (180 Minutes)
- Total Questions: 30 Questions
- Paper Sections: 5 Sections (Section A, Section B, Section C, Section D, Section E)

--- GENERAL INSTRUCTIONS (MUST BE INCLUDED IN PAPER) ---
1. This question paper contains 30 questions. All questions are compulsory.
2. Question paper is divided into FIVE Sections - A, B, C, D and E.
3. Section A - Questions no. 1 to 17 are Multiple Choice (MCQ) type questions carrying 1 mark each.
4. Section B - Questions no. 18 and 19 are Source-based questions carrying 3 marks each.
5. Section C - Questions no. 20 to 23 are Short Answer (SA) type questions carrying 3 marks each. Answer to these questions should normally not exceed 80 to 100 words.
6. Section D - Questions no. 24 to 28 are Long Answer (LA) type questions carrying 5 marks each. Answer to these questions should normally not exceed 120 to 150 words.
7. Section E - Questions no. 29 and 30 are Map-based questions carrying 5 marks each.
8. There is no overall choice. However, an internal choice has been provided in few questions. Only one of the choices in such questions have to be attempted.

--- SYLLABUS & PRESCRIBED NCERT BOOKS ---
BOOK 1: FUNDAMENTALS OF HUMAN GEOGRAPHY (35 Marks)
1. Unit I: Human Geography: Nature and Scope (Chapter 1) - 3 Marks
   - Introduction to Human Geography, approaches to study (regional, systematic, dualism), nature of human geography, naturalisation of humans and humanisation of nature, schools of thought (environmental determinism, possibilism, neo-determinism / stop-and-go determinism), fields and subfields.
2. Unit II: People (Chapters 2 & 3) - 8 Marks
   - Chapter 2: The World Population Distribution, Density and Growth (Distribution, density, factors influencing distribution, population growth, components of change: CBR, CDR, migration push-pull factors, demographic transition 3 stages, population control measures).
   - Chapter 3: Human Development (Concept, growth vs development, four pillars: equity, sustainability, productivity, empowerment; approaches: income, welfare, basic needs, capability; measuring human development: HDI, HPI, GNH; international comparisons).
3. Unit III: Human Activities, Transport, Communication and Trade (Chapters 4 to 8) - 19 Marks
   - Chapter 4: Primary Activities (Hunting and gathering, pastoralism: nomadic herding, commercial livestock rearing; agriculture types: primitive subsistence, intensive subsistence, plantation, extensive commercial grain, mixed farming, dairy farming, Mediterranean, market gardening/horticulture, cooperative, collective farming; mining: factors and methods - surface vs underground).
   - Chapter 5: Secondary Activities (Manufacturing characteristics, location factors, classification by size: household, small-scale, large-scale; by inputs: agro, mineral, chemical, forest, animal-based; by output: basic, consumer; by ownership: public, private, joint; concept of high-tech industries / technopolies).
   - Chapter 6: Tertiary and Quaternary Activities (Tertiary concept, trade & commerce: retail and wholesale, rural/urban marketing centres; transport factors and networks; communication services; tourism and medical tourism in India; quaternary and quinary activities, the digital divide).
   - Chapter 7: Transport, Communication and Trade (Land transport: roadways, highways, border roads; transcontinental railways: Trans-Siberian, Trans-Canadian, Australian Trans-Continental; water transport: major sea routes, shipping canals - Suez, Panama, inland waterways - Rhine, Danube, Volga, St. Lawrence Seaways; air transport; pipelines - Big Inch; satellite communication and cyberspace).
   - Chapter 8: International Trade (Basis of international trade, balance of trade, bilateral and multilateral trade, free trade, dumping, WTO, regional trade blocs, gateways of trade: ports and types).
4. Map Work: World Political Map (Identification of 5 features) - 5 Marks

BOOK 2: INDIA: PEOPLE AND ECONOMY (35 Marks)
1. Unit I: Population: Distribution, Density, Growth and Composition (Chapter 1) - 5 Marks
   - Distribution, density, growth (four distinct phases: 1901-21, 1921-51, 1951-81, 1981-present), regional variation in growth, composition: rural-urban, linguistic, religious, working population (main, marginal, non-workers), 'Beti Bachao-Beti Padhao' campaign.
2. Unit II: Human Settlements (Chapter 2) - 3 Marks
   - Rural settlement types (clustered, semi-clustered, hamleted, dispersed); urban settlements: evolution of towns (ancient, medieval, modern), urbanisation in India, functional classification of towns, Smart Cities Mission.
3. Unit III: Resources and Development (Chapters 3 to 6) - 10 Marks
   - Chapter 3: Land Resources and Agriculture (Land-use categories and changes, common property resources, agricultural land use, cropping seasons: Kharif, Rabi, Zaid; types of farming: wetland, dryland; major crops: rice, wheat, tea, coffee, cotton, jute, sugarcane, rubber; agricultural development, Green Revolution, problems of Indian agriculture).
   - Chapter 4: Water Resources (Surface and groundwater resources, lagoons, water demand/utilisation, water quality deterioration, conservation and watershed management: Haryali, Neeru-Meeru, Arvary Pani Sansad; rainwater harvesting).
   - Chapter 5: Mineral and Energy Resources (Types: metallic ferrous/non-ferrous, non-metallic; major mineral belts; iron ore, manganese, bauxite, copper, mica; conventional energy: coal - Gondwana/Tertiary, petroleum, natural gas; non-conventional energy: nuclear, solar, wind, tidal, geothermal, bio-energy; conservation).
   - Chapter 6: Planning and Sustainable Development in Indian Context (Target area planning: Hill Area, Drought Prone Area programmes; concept of sustainable development - Brundtland Report; Case studies: Bharmaur ITDP, Indira Gandhi Canal Command Area).
4. Unit IV: Transport, Communication and International Trade (Chapters 7 & 8) - 7 Marks
   - Chapter 7: Transport and Communication (Roads: Golden Quadrilateral, corridors; railways, Dedicated Freight Corridors; pipelines; water transport: National Waterways NW-1, NW-2, NW-3, oceanic; air transport; communication networks).
   - Chapter 8: International Trade (Changing pattern of exports/imports, direction of trade, sea ports and their hinterlands: Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia; major international airports).
5. Unit V: Geographical Perspective on Selected Issues and Problems (Chapter 9) - 5 Marks
   - Environmental pollution (air, water, land, noise), urban-waste disposal, rural-urban migration case study, problems of slums (Dharavi), land degradation.
6. Map Work: India Political Map (Locating and Labelling 5 features) - 5 Marks

FORMATIVE-ONLY TOPICS (STRICTLY EXCLUDED FROM BOARD/SUMMATIVE EXAMS):
- Book 1: "Population Composition" (Sex, Age, Pyramid, Rural-Urban, Literacy, Occupation) and "Human Settlements" (Classification, Patterns, Problems).
- Book 2: "Migration" (Types, Causes, Consequences).
DO NOT generate summative board questions from these formative-only topics.

OFFICIAL PRESCRIBED MAP WORK ITEMS (PAGE 5, 7, 9 OF PDF):
- World Map (Identification for Q29):
  * Transcontinental Railways Terminals: Trans-Siberian (St. Petersburg to Vladivostok), Trans-Canadian (Halifax to Vancouver), Australian Trans-Continental (Perth to Sydney).
  * Major Sea Ports: North Cape, London, Hamburg, Vancouver, San Francisco, New Orleans, Rio de Janeiro, Colon, Valparaiso, Suez, Cape Town, Yokohama, Shanghai, Hong Kong, Aden, Karachi, Kolkata, Perth, Sydney, Melbourne.
  * Major Airports: Tokyo, Beijing, Mumbai, Jeddah, Aden, Johannesburg, Nairobi, Moscow, London, Paris, Berlin, Rome, Chicago, New Orleans, Mexico City, Buenos Aires, Santiago, Darwin, Wellington.
  * Canals & Waterways: Suez Canal, Panama Canal, Rhine waterways, St. Lawrence Seaways.
  * Primary Agricultural Regions: Subsistence gathering, nomadic herding, commercial livestock rearing, extensive commercial grain farming, mixed farming.
- India Map (Locating & Labelling for Q30):
  * Population Density Extremes: State with highest population density (Bihar), State with lowest population density (Arunachal Pradesh).
  * Leading Crop Producing States: Rice (West Bengal/UP), Wheat (UP/Punjab), Cotton (Gujarat/Maharashtra), Jute (West Bengal), Sugarcane (UP), Tea (Assam), Coffee (Karnataka).
  * Mines: Iron-ore (Mayurbhanj, Bailadila, Ratnagiri, Bellary), Manganese (Balaghat, Shimoga), Copper (Hazaribagh, Singhbhum, Khetri), Bauxite (Katni, Bilaspur, Koraput), Coal (Jharia, Bokaro, Raniganj, Neyveli).
  * Oil Refineries: Mathura, Jamnagar, Barauni.
  * Major Sea Ports: Kandla, Mumbai, Marmagao, Kochi, Mangalore, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia.
  * Major Airports: Ahmedabad, Mumbai, Bengaluru, Chennai, Kolkata, Guwahati, Delhi, Amritsar, Thiruvananthapuram, Hyderabad.

COGNITIVE DOMAINS & ASSESSMENT TYPOLOGY (PAGE 8 OF PDF):
1. Remembering and Understanding: 41% (~29 Marks) - Recalling facts, terms, concepts, data; comparisons, descriptions.
2. Application: 37% (~26 Marks) - Applying geographical concepts to new scenarios, interpreting maps, policy implementations.
3. Analysing, Evaluating and Creating: 22% (~15 Marks) - Source analysis, case studies, evaluating sustainable development, synthesis.

--- TARGET CHAPTERS FOR GENERATION ---
${config.selectedChapters && config.selectedChapters.length > 0
  ? `Selected Chapters:\n${config.selectedChapters.map((c) => `- ${c}`).join("\n")}`
  : "Full Class 12 Geography Syllabus (both Book 1 and Book 2)."
}

--- LANGUAGE INSTRUCTIONS ---
${languagePrompt}

======================================================================
### SECTION-BY-SECTION DETAILED REQUIREMENTS
======================================================================

### SECTION A: OBJECTIVE TYPE QUESTIONS (Questions 1 to 17, 17 Marks)
- Questions 1 to 17: 17 Multiple Choice Questions (1 Mark each = 17 Marks).
  * Balanced between Book 1 (Fundamentals of Human Geography) and Book 2 (India: People and Economy).
  * Incorporate diverse MCQ typologies: Conceptual MCQs, Assertion-Reason MCQs, Statement 1 / Statement 2 MCQs, Match the following, and Data/Table-based MCQs.
  * Exactly 4 plausible options labeled (A), (B), (C), (D) in the "choices" array.
  * Set "marks": 1, "type": "mcq".

### SECTION B: SOURCE-BASED QUESTIONS (Questions 18 to 19, 6 Marks)
- Questions 18 & 19: 2 Source / Case-Based Questions (3 Marks each = 6 Marks).
  * Question 18 (3 Marks): Source-based question from Book 1: Fundamentals of Human Geography. Includes a realistic excerpt/passage (approx. 80-120 words) on a relevant topic (e.g., Demographic Transition, Modern Large-Scale Manufacturing, Waterways/Canals, or Quaternary/Quinary activities), followed by 3 sub-questions: (i) 1 Mark, (ii) 1 Mark, (iii) 1 Mark.
  * Question 19 (3 Marks): Source-based question from Book 2: India: People and Economy. Includes a realistic excerpt/case study (approx. 80-120 words) on an Indian context (e.g., Integrated Tribal Development Project in Bharmaur Region, Indira Gandhi Canal Command Area, Watershed Management like Haryali/Ralegan Siddhi, or Urban Slums / Land Degradation), followed by 3 sub-questions: (i) 1 Mark, (ii) 1 Mark, (iii) 1 Mark.
  * Format: Include the reading source passage and the 3 sub-questions directly in the "text" field.
  * Set "marks": 3, "type": "caseStudy", "choices": null, "orQuestion": null.

### SECTION C: SHORT ANSWER QUESTIONS (Questions 20 to 23, 12 Marks)
- Questions 20 to 23: 4 Short Answer Questions (3 Marks each = 12 Marks).
  * Word limit: 80 to 100 words per question.
  * Point-wise, conceptual, and analytical geographical questions.
  * Questions 20 to 22: Compulsory SA questions covering both books (e.g., Naturalisation of humans vs Humanisation of nature, Push vs Pull factors of migration, Problems of water resources in India, Functional classification of towns).
  * Question 23 (3 Marks): Short Answer question WITH INTERNAL CHOICE ("orQuestion" and "orSolution"). Provide two alternate 3-mark questions from equivalent units.
  * Set "marks": 3, "type": "sa", "choices": null.

### SECTION D: LONG ANSWER QUESTIONS (Questions 24 to 28, 25 Marks)
- Questions 24 to 28: 5 Long Answer Questions (5 Marks each = 25 Marks).
  * Word limit: 120 to 150 words per question.
  * In-depth, comprehensive questions requiring clear headings, geographical reasoning, and point-wise elaboration.
  * Balanced distribution across Book 1 and Book 2:
    - E.g., Four pillars and approaches to Human Development;
    - Characteristics and distribution of Subsistence vs Commercial agriculture / Nomadic herding vs Commercial livestock rearing;
    - Factors governing location of industries with examples;
    - Cropping seasons and challenges of Indian agriculture / Green Revolution impact;
    - Conventional vs Non-conventional energy resources and need for conservation in India;
    - Major sea routes and shipping canals (Suez and Panama Canal comparison).
  * Question 28 (5 Marks): Long Answer question WITH INTERNAL CHOICE ("orQuestion" and "orSolution"). Provide two alternate 5-mark questions.
  * Set "marks": 5, "type": "la", "choices": null.

### SECTION E: MAP-BASED QUESTIONS (Questions 29 to 30, 10 Marks)
- Question 29 (5 Marks): World Political Map Work (Book 1: Fundamentals of Human Geography).
  * Seven geographical features are provided, out of which students are required to identify ANY FIVE features marked on the outline map and write their correct names.
  * MUST strictly choose items from the official CBSE prescribed syllabus list (Transcontinental Railways, Major Sea Ports, Major Airports, Inland Waterways/Canals, Primary Agricultural Regions).
  * Format in "text":
    "29. On the given political outline map of the World, seven geographical features have been marked as A, B, C, D, E, F and G. Identify any FIVE with the help of the following information and write their correct names:\\n(i) [Description of feature A]\\n(ii) [Description of feature B]\\n(iii) [Description of feature C]\\n(iv) [Description of feature D]\\n(v) [Description of feature E]\\n(vi) [Description of feature F]\\n(vii) [Description of feature G]"
  * Set "marks": 5, "type": "la", "choices": null, "orQuestion": null.
  * In "solution": Provide the exact identified feature names and their locations/countries for all 7 items clearly.

- Question 30 (5 Marks): India Political Map Work (Book 2: India: People and Economy).
  * Seven geographical features are provided, out of which students are required to locate and label ANY FIVE features on the outline map of India with appropriate symbols.
  * MUST strictly choose items from the official CBSE prescribed syllabus list (Population density extremes, Leading crop states, Iron-ore / Manganese / Copper / Bauxite / Coal mines, Oil refineries, Major sea ports, Major airports).
  * Format in "text":
    "30. Locate and label any FIVE of the following geographical features on the given political outline map of India with appropriate symbols:\\n(i) [Feature 1 with State]\\n(ii) [Feature 2 with State]\\n(iii) [Feature 3 with State]\\n(iv) [Feature 4 with State]\\n(v) [Feature 5 with State]\\n(vi) [Feature 6 with State]\\n(vii) [Feature 7 with State]"
  * Set "marks": 5, "type": "la", "choices": null, "orQuestion": null.
  * In "solution": Provide the exact location, state, and labelling description for all 7 items clearly.

--- CRITICAL GEOGRAPHY QUALITY & ACCURACY DIRECTIVES ---
1. Map Items Accuracy: Every map feature in Q29 and Q30 MUST be an exact item from the official syllabus list above. Never invent locations outside the CBSE syllabus.
2. Source Passages: Passages in Q18 and Q19 must be coherent, context-rich geographical excerpts followed by 3 precise 1-mark sub-questions.
3. ${solutionDirective}
4. Backslash Escaping: Double-escape all backslashes (\\\\) if used in text.
5. RAW JSON OUTPUT: Output strictly valid JSON without markdown wrapping (\`\`\`json).

--- JSON SCHEMA TEMPLATE ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions (1 Mark each)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [Objective MCQ from Book 1 / Book 2]",
          "marks": 1,
          "type": "mcq",
          "choices": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
          "orQuestion": null,
          "solution": "(A) Option 1 - [Reasoning/explanation]",
          "orSolution": null
        },
        ...
        {
          "id": "q17",
          "text": "17. [Assertion-Reason or Conceptual MCQ]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(A) Both Assertion (A) and Reason (R) are true and R is the correct explanation of A.",
            "(B) Both Assertion (A) and Reason (R) are true but R is not the correct explanation of A.",
            "(C) Assertion (A) is true but Reason (R) is false.",
            "(D) Assertion (A) is false but Reason (R) is true."
          ],
          "orQuestion": null,
          "solution": "(A) Both Assertion (A) and Reason (R) are true and R is the correct explanation of A.",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Source-Based Questions (3 Marks each)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q18",
          "text": "18. Read the following source carefully and answer the questions that follow:\\n\\n[Authentic passage on Book 1: Fundamentals of Human Geography, approx 80-120 words]\\n\\n(i) [Sub-question 1] (1 Mark)\\n(ii) [Sub-question 2] (1 Mark)\\n(iii) [Sub-question 3] (1 Mark)",
          "marks": 3,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1-Mark point]\\n(ii) [1-Mark point]\\n(iii) [1-Mark point]",
          "orSolution": null
        },
        {
          "id": "q19",
          "text": "19. Read the following source carefully and answer the questions that follow:\\n\\n[Authentic case study on Book 2: India - People and Economy, approx 80-120 words]\\n\\n(i) [Sub-question 1] (1 Mark)\\n(ii) [Sub-question 2] (1 Mark)\\n(iii) [Sub-question 3] (1 Mark)",
          "marks": 3,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1-Mark point]\\n(ii) [1-Mark point]\\n(iii) [1-Mark point]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer Questions (3 Marks each, 80-100 words)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q20",
          "text": "20. [3-Mark Short Answer Question from Book 1 / Book 2]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Point-wise 3-Mark answer with marking scheme points]",
          "orSolution": null
        },
        {
          "id": "q21",
          "text": "21. [3-Mark Short Answer Question]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Point-wise 3-Mark answer]",
          "orSolution": null
        },
        {
          "id": "q22",
          "text": "22. [3-Mark Short Answer Question]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Point-wise 3-Mark answer]",
          "orSolution": null
        },
        {
          "id": "q23",
          "text": "23. [3-Mark Short Answer Question with Internal Choice]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative 3-Mark Short Answer Question from same unit]",
          "solution": "[Point-wise 3-Mark solution for primary question]",
          "orSolution": "[Point-wise 3-Mark solution for choice question]"
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Long Answer Questions (5 Marks each, 120-150 words)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q24",
          "text": "24. [5-Mark Comprehensive Long Answer Question from Book 1]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "[Detailed 5-Mark answer with 5 distinct points/headings]",
          "orSolution": null
        },
        {
          "id": "q25",
          "text": "25. [5-Mark Comprehensive Long Answer Question from Book 2]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "[Detailed 5-Mark answer with 5 distinct points/headings]",
          "orSolution": null
        },
        {
          "id": "q26",
          "text": "26. [5-Mark Long Answer Question]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "[Detailed 5-Mark answer]",
          "orSolution": null
        },
        {
          "id": "q27",
          "text": "27. [5-Mark Long Answer Question]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "[Detailed 5-Mark answer]",
          "orSolution": null
        },
        {
          "id": "q28",
          "text": "28. [5-Mark Long Answer Question with Internal Choice]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative 5-Mark Long Answer Question from same unit]",
          "solution": "[Detailed 5-Mark solution for primary question]",
          "orSolution": "[Detailed 5-Mark solution for alternative question]"
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Map-Based Questions (5 Marks each)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q29",
          "text": "29. On the given political outline map of the World, seven geographical features have been marked as A, B, C, D, E, F and G. Identify any FIVE with the help of the following information and write their correct names on your answer sheet:\\n(i) A major sea port in Europe\\n(ii) An inland waterway in Europe\\n(iii) An area of nomadic herding\\n(iv) Terminal station of Trans-Canadian Railway\\n(v) A major airport in Asia\\n(vi) An important shipping canal connecting two seas\\n(vii) An area of extensive commercial grain farming",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Official Map Work Identification Key (World Map):\\n(i) London / Hamburg / North Cape [1 Mark]\\n(ii) Rhine Waterways / Danube [1 Mark]\\n(iii) Sahara / Central Asia / Northern Africa [1 Mark]\\n(iv) Halifax / Vancouver [1 Mark]\\n(v) Tokyo / Beijing / Mumbai / Shanghai [1 Mark]\\n(vi) Suez Canal / Panama Canal [1 Mark]\\n(vii) Prairies / Pampas / Steppes / Downs [1 Mark]\\n(Any 5 correctly identified = 5 x 1 = 5 Marks)",
          "orSolution": null
        },
        {
          "id": "q30",
          "text": "30. Locate and label any FIVE of the following geographical features on the given political outline map of India with appropriate symbols:\\n(i) The State having the highest population density\\n(ii) The leading producer state of Cotton\\n(iii) Bailadila - Iron ore mine\\n(iv) Katni - Bauxite mine\\n(v) Mathura - Oil Refinery\\n(vi) Marmagao - Major Sea Port\\n(vii) Netaji Subhash Chandra Bose International Airport (Kolkata)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Official Map Work Location & Labelling Key (India Map):\\n(i) Bihar [1 Mark]\\n(ii) Gujarat / Maharashtra [1 Mark]\\n(iii) Bailadila (Chhattisgarh) [1 Mark]\\n(iv) Katni (Madhya Pradesh) [1 Mark]\\n(v) Mathura (Uttar Pradesh) [1 Mark]\\n(vi) Marmagao (Goa) [1 Mark]\\n(vii) Kolkata (West Bengal) [1 Mark]\\n(Any 5 correctly located and labelled = 5 x 1 = 5 Marks)",
          "orSolution": null
        }
      ]
    }
  ]
}
`;
}



