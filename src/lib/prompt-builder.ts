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

  const isSocial =
    normSubject === "social" ||
    normSubject.includes("social") ||
    normSubject.includes("sst") ||
    normSubject === "socialscience";
  const isClass10Social = isClass10 && isSocial;

  const isFullClass10SocialExam =
    isClass10Social &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 70);

  const isPhyEdu =
    normSubject === "phyedu" ||
    normSubject.includes("physical") ||
    normSubject.includes("phy edu") ||
    normSubject.includes("sports");
  const isClass12PhyEdu = isClass12 && isPhyEdu;

  const isFullClass12PhyEduExam =
    isClass12PhyEdu &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 65);

  const isScience =
    normSubject === "science" ||
    normSubject.includes("science") ||
    normSubject === "sci";
  const isClass10Science = isClass10 && isScience;

  const isFullClass10ScienceExam =
    isClass10Science &&
    (config.totalMarks >= 70 ||
      ((config.examType === "annual_exam" ||
        config.examType === "pre_board" ||
        config.examType === "sample_paper" ||
        config.examType === "half_yearly") &&
        (config.totalMarks >= 60 || !config.totalMarks)));

  const isChemistry =
    normSubject === "chemistry" ||
    normSubject.includes("chemistry") ||
    normSubject === "chem";
  const isClass12Chemistry = isClass12 && isChemistry;

  const isFullClass12ChemistryExam =
    isClass12Chemistry &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 65);

  const isAccounts =
    normSubject === "accounts" ||
    normSubject === "accountancy" ||
    normSubject.includes("account") ||
    normSubject === "acc";
  const isClass12Accounts = isClass12 && isAccounts;

  const isFullClass12AccountsExam =
    isClass12Accounts &&
    (config.examType === "annual_exam" ||
      config.examType === "pre_board" ||
      config.examType === "sample_paper" ||
      config.examType === "half_yearly" ||
      config.totalMarks >= 70);

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
Prescribed NCERT Units & Chapters (Latest 2025-26 / 2026-27 Curriculum):
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

  const chemistryClass12Constraint = isClass12Chemistry
    ? `--- CBSE CLASS 12 CHEMISTRY (SUBJECT CODE 043) CURRICULUM & SYLLABUS DIRECTIVE ---
Theory: 70 Marks (3 Hours) | Practical Assessment: 30 Marks | Total: 100 Marks
(Based strictly on latest prescribed CBSE syllabus, blueprints, and question paper design)

OFFICIAL 10 UNITS & SYLLABUS TOPICS:
1. Physical Chemistry (Total: 23 Marks):
   - Unit 1: Solutions (7 Marks)
     * Types of solutions, expression of concentration of solutions of solids in liquids (molarity, molality, mole fraction, mass percentage).
     * Solubility of gases in liquids (Henry's law and applications), solubility of solids in liquids.
     * Vapour pressure of liquid solutions, Raoult's law (for volatile and non-volatile solutes), ideal and non-ideal solutions, positive and negative deviations from Raoult's law, azeotropes (minimum and maximum boiling).
     * Colligative properties and determination of molar mass: relative lowering of vapour pressure, elevation of boiling point (molal elevation constant Kb), depression of freezing point (cryoscopic constant Kf), osmotic pressure (reverse osmosis, isotonic, hypertonic, hypotonic solutions).
     * Abnormal molecular masses, van't Hoff factor (i), association and dissociation calculations.
   - Unit 2: Electrochemistry (9 Marks)
     * Electrochemical cells, Redox reactions, Galvanic/Voltaic cells, cell potential and standard electrode potential (SHE - Standard Hydrogen Electrode).
     * Nernst equation and its relation to EMF of chemical cells and equilibrium constant (Kc), Gibbs energy change (Delta G = -nFE_cell).
     * Conductance in electrolytic solutions: specific and molar conductivity, variation of conductivity and molar conductivity with concentration, Kohlrausch's law of independent migration of ions and its applications (calculation of molar conductivity at infinite dilution for weak electrolytes, degree of dissociation alpha, and dissociation constant Ka).
     * Electrolytic cells and electrolysis: Faraday's laws of electrolysis (first and second laws with numerical calculations).
     * Commercial batteries: primary cells (dry cell, mercury cell), secondary cells (lead storage battery, nickel-cadmium cell).
     * Fuel cells (H2-O2 fuel cell efficiency and reactions), Corrosion of metals (electrochemical theory of rusting of iron and methods of prevention).
   - Unit 3: Chemical Kinetics (7 Marks)
     * Rate of a chemical reaction (average and instantaneous rates), factors influencing rate of reaction: concentration, temperature, catalyst, surface area.
     * Rate law and specific rate constant (k), order of a reaction (0, 1, 2, fractional) and molecularity of a reaction, pseudo first order reactions.
     * Integrated rate equations and half-life period (t_1/2) for zero and first order reactions with graphical plots ([R] vs t, ln[R] vs t).
     * Temperature dependence of reaction rate: Arrhenius equation, activation energy (Ea), calculation of rate constants at different temperatures (log(k2/k1) = (Ea / 2.303R) * (1/T1 - 1/T2)).
     * Collision theory of chemical reactions (elementary idea, activation energy, collision frequency, orientation factor/steric factor P, mathematical treatment not required).

2. Inorganic Chemistry (Total: 14 Marks):
   - Unit 4: d- and f-Block Elements (7 Marks)
     * Position in the Periodic Table, electronic configurations of 3d series.
     * General trends in properties of the first-row transition elements (d-Block): metallic character, atomic and ionic radii, ionization enthalpies, standard electrode potentials (E(M2+/M) and E(M3+/M2+) anomalies), oxidation states (variable oxidation states, stability of Mn2+, Fe3+, etc.), magnetic properties (spin-only magnetic moment mu = sqrt(n(n+2)) BM), catalytic properties, coloured ions (d-d transitions), interstitial compounds formation, alloy formation.
     * Some important compounds of transition elements: Potassium dichromate (K2Cr2O7) and Potassium permanganate (KMnO4) - preparation, properties, and oxidizing actions in acidic/alkaline media with balanced ionic equations.
     * The Lanthanoids: electronic configuration, oxidation states (+3 predominant, +2 and +4 states), atomic and ionic radii, Lanthanoid contraction and its consequences (similarity in properties of 4d and 5d elements like Zr/Hf).
     * The Actinoids: electronic configuration, oxidation states (+3, +4, +5, +6, +7), comparison with lanthanoids (greater range of oxidation states, radioactive nature).
     * Applications of d- and f-Block elements (catalysts, alloys, magnetic materials).
   - Unit 5: Coordination Compounds (7 Marks)
     * Werner's theory of coordination compounds (primary and secondary valencies).
     * Important terms: coordination entity, central atom/ion, ligands (monodentate, bidentate, polydentate, ambidentate, chelating ligands), coordination number, coordination sphere, coordination polyhedron, oxidation number of central metal atom, homoleptic and heteroleptic complexes.
     * IUPAC nomenclature of mononuclear coordination compounds.
     * Isomerism in coordination compounds: Structural isomerism (ionisation, hydrate/solvate, linkage, coordination isomerism) and Stereoisomerism (geometrical cis/trans and optical isomerism/chirality in octahedral and square planar complexes).
     * Bonding in coordination complexes:
       - Valence Bond Theory (VBT): hybridisation (sp3, dsp2, sp3d2, d2sp3), geometry, inner and outer orbital complexes, magnetic nature (diamagnetic vs paramagnetic).
       - Crystal Field Theory (CFT): crystal field splitting in octahedral (Delta_o) and tetrahedral (Delta_t) coordination entities, t2g and eg orbitals, pairing energy (P), high spin vs low spin complexes (spectrochemical series: strong field vs weak field ligands), colour of coordination compounds.
     * Bonding in metal carbonyls (synergic bonding, sigma-bond donation and pi-backbonding).
     * Importance and applications of coordination compounds (in qualitative analysis, extraction of metals like Ag and Au, biological systems like chlorophyll, haemoglobin, vitamin B12, and medicine like cis-platin).

3. Organic Chemistry (Total: 33 Marks):
   - Unit 6: Haloalkanes and Haloarenes (6 Marks)
     * Classification (mono, di, polyhalogen), IUPAC nomenclature, Nature of C-X bond (sp3 vs sp2, bond length, polarity).
     * Methods of preparation of haloalkanes (from alcohols using SOCl2, PCl5, PCl3, HX, from hydrocarbons by free radical halogenation, electrophilic addition to alkenes, halogen exchange: Finkelstein and Swarts reactions).
     * Methods of preparation of haloarenes (from diazonium salts by Sandmeyer and Gattermann reactions, electrophilic substitution of arenes).
     * Physical properties (melting/boiling points, density, solubility).
     * Chemical reactions of haloalkanes:
       - Nucleophilic substitution reactions: SN1 and SN2 mechanisms, kinetics, stereochemical aspects (optical activity, plane polarised light, enantiomers, racemisation vs inversion of configuration).
       - Elimination reactions: dehydrohalogenation, Saytzeff (Zaitsev) rule.
       - Reaction with metals: Grignard reagent formation (RMgX), Wurtz reaction.
     * Chemical reactions of haloarenes: low reactivity of haloarenes towards nucleophilic substitution (resonance effect, hybridization of carbon, instability of phenyl cation), electrophilic substitution reactions (halogenation, nitration, sulphonation, Friedel-Crafts alkylation and acylation), Wurtz-Fittig and Fittig reactions.
     * Polyhalogen compounds: uses and environmental effects of dichloromethane (CH2Cl2), chloroform (CHCl3), iodoform (CHI3), carbon tetrachloride (CCl4), freons (CFCs), DDT.
   - Unit 7: Alcohols, Phenols and Ethers (6 Marks)
     * Classification (monohydric, dihydric, polyhydric; primary, secondary, tertiary alcohols; allylic, benzylic).
     * Nomenclature and structures of functional groups (-OH, -O-).
     * Alcohols: methods of preparation (acid-catalysed hydration of alkenes, hydroboration-oxidation, reduction of aldehydes, ketones, and carboxylic acids/esters, from Grignard reagents). Physical properties (hydrogen bonding, boiling point, solubility). Chemical reactions: acidity of alcohols, esterification, reaction with hydrogen halides, PCl3, PCl5, SOCl2, dehydration (formation of alkenes vs ethers, mechanism), oxidation (PCC, Jones reagent, acidic KMnO4), dehydrogenation over hot Cu. Lucas test for distinguishing 1 deg, 2 deg, 3 deg alcohols. Commercial alcohols: methanol and ethanol.
     * Phenols: methods of preparation (from haloarenes - Dow process, from benzenesulphonic acid, from diazonium salts, from cumene). Physical properties. Chemical reactions: acidic nature of phenol (comparison with alcohols and substituted phenols - effect of EWG and EDG), electrophilic aromatic substitutions (nitration with dilute vs conc. HNO3, halogenation with Br2/H2O vs Br2/CS2), Kolbe's reaction, Reimer-Tiemann reaction, reaction with zinc dust, oxidation with Na2Cr2O7 to benzoquinone.
     * Ethers: nomenclature, methods of preparation (acid-catalysed dehydration of alcohols, Williamson ether synthesis). Physical properties. Chemical reactions: cleavage of C-O bond by HI/HBr (mechanism with 1 deg, 2 deg, 3 deg alkyl groups), electrophilic substitution in aromatic ethers (halogenation, Friedel-Crafts reactions, nitration).
   - Unit 8: Aldehydes, Ketones and Carboxylic Acids (8 Marks)
     * Nomenclature and structure of the carbonyl group (>C=O).
     * Preparation of aldehydes and ketones: oxidation of alcohols, dehydrogenation of alcohols, ozonolysis of alkenes, hydration of alkynes; Rosenmund reduction, Stephen reduction, Etard reaction, Gattermann-Koch reaction, Friedel-Crafts acylation.
     * Physical properties (boiling points, dipole-dipole interactions, solubility).
     * Chemical reactions of aldehydes and ketones:
       - Nucleophilic addition reactions: addition of HCN, NaHSO3, Grignard reagents, alcohols (acetals and ketals), addition of ammonia derivatives (NH2-Z: hydroxylamine, hydrazine, phenylhydrazine, 2,4-DNP, semicarbazide). Mechanism of nucleophilic addition.
       - Reduction: Clemmensen reduction (Zn-Hg / conc. HCl), Wolff-Kishner reduction (NH2NH2 / KOH, glycol), reduction to alcohols (NaBH4, LiAlH4).
       - Oxidation: Tollens' test (silver mirror), Fehling's test, Haloform reaction (Iodoform test for CH3-C=O group).
       - Reactions due to alpha-hydrogen: Aldol condensation, Cross-aldol condensation.
       - Cannizzaro reaction (for aldehydes without alpha-hydrogen), Electrophilic aromatic substitution of benzaldehyde (meta-directing).
     * Carboxylic Acids: nomenclature and structure of carboxyl group (-COOH). Methods of preparation (from primary alcohols and aldehydes, from alkylbenzenes, from nitriles and amides, from Grignard reagents and CO2, from acyl halides and anhydrides, from esters). Physical properties. Chemical reactions: acidity (resonance stabilisation of carboxylate ion, comparison with phenols, effect of substituents on acid strength: pKa), formation of anhydride, esterification, reaction with PCl5, PCl3, SOCl2, reaction with ammonia, reduction (LiAlH4), decarboxylation (soda-lime), Hell-Volhard-Zelinsky (HVZ) reaction, electrophilic aromatic substitution (meta-directing).
   - Unit 9: Amines (6 Marks)
     * Structure of amines, classification (1 deg, 2 deg, 3 deg amines, quaternary ammonium salts), IUPAC nomenclature.
     * Methods of preparation of amines: reduction of nitro compounds, ammonolysis of alkyl halides (Hoffmann's ammonolysis), reduction of nitriles, reduction of amides, Gabriel phthalimide synthesis, Hoffmann bromamide degradation reaction.
     * Physical properties: hydrogen bonding, boiling points, solubility in water.
     * Chemical reactions:
       - Basic character of amines: comparison of basicity in gaseous phase (3 deg > 2 deg > 1 deg > NH3) vs aqueous solution (ethyl group: 2 deg > 3 deg > 1 deg > NH3; methyl group: 2 deg > 1 deg > 3 deg > NH3; aliphatic vs aromatic amines - effect of resonance in aniline).
       - Alkylation and Acylation.
       - Carbylamine reaction (test for primary amines using CHCl3 + KOH).
       - Reaction with nitrous acid (HNO2): aliphatic amines produce alcohol + N2 gas; aromatic primary amines form diazonium salts.
       - Reaction with benzenesulphonyl chloride (Hinsberg's reagent) to distinguish 1 deg, 2 deg, 3 deg amines.
       - Electrophilic substitution in aniline: bromination (Br2/H2O yields 2,4,6-tribromoaniline, monobromination via protection with acetic anhydride), nitration (formation of ortho, meta, para isomers), sulphonation (formation of sulphanilic acid and zwitterion).
     * Diazonium salts: preparation of benzenediazonium chloride, physical properties, chemical reactions: reactions involving displacement of nitrogen (replacement by halogen - Sandmeyer and Gattermann reactions, replacement by -I, -F [Balz-Schiemann], -OH, -H, -NO2), azo-coupling reactions (with phenol [orange dye] and with aniline [yellow dye]), importance in synthetic organic chemistry.
   - Unit 10: Biomolecules (7 Marks)
     * Carbohydrates: classification (aldoses, ketoses, monosaccharides, disaccharides, polysaccharides). Monosaccharides: glucose (preparation, open-chain structure, chemical reactions supporting structure: HI, Br2 water, HNO3, acetic anhydride, HCN, hydroxylamine, cyclic structure, alpha and beta anomers, Haworth projections) and fructose (cyclic structure). Disaccharides: glycosidic linkage, sucrose (invert sugar, non-reducing), lactose (reducing), maltose (reducing). Polysaccharides: starch (amylose and amylopectin), cellulose, glycogen; biological importance of carbohydrates.
     * Proteins: elementary idea of alpha-amino acids, zwitterion structure, isoelectric point, peptide bond/linkage, polypeptides, classification of proteins: fibrous and globular proteins. Structural levels: primary, secondary (alpha-helix and beta-pleated sheet), tertiary, and quaternary structures. Denaturation of proteins.
     * Enzymes: biocatalysts, specificity, mechanism of action.
     * Vitamins: classification (water-soluble: B and C; fat-soluble: A, D, E, K), deficiency diseases (scurvy, rickets, beriberi, night blindness, xerophthalmia).
     * Nucleic Acids: chemical composition of nucleic acids (pentose sugar, phosphoric acid, nitrogenous bases: purines A, G and pyrimidines C, T, U), nucleosides and nucleotides. Structure of DNA (Watson-Crick double helix, complementary base pairing A=T, G===C) and RNA (single strand, types: mRNA, tRNA, rRNA), biological functions: replication and protein synthesis (genetic code).
     * Hormones: elementary idea (excluding structure): steroid hormones, adrenaline, thyroxine, insulin, glucagon.

STRICTLY FORMATIVE-ONLY TOPICS (NEVER GENERATE BOARD EXAM QUESTIONS FROM THESE):
- Surface Chemistry (adsorption, physisorption/chemisorption, colloids, emulsions)
- General Principles and Processes of Isolation of Elements (metallurgy, Ellingham diagrams)
- Polymers (polymerization, Bakelite, Nylon, Buna-S, Dacron)
- Chemistry in Everyday Life (drugs, analgesics, food preservatives, detergents)
The four topics above are strictly for formative school assessment and MUST NEVER appear in summative board examinations.

QUESTION PAPER DESIGN & COMPETENCIES (70 MARKS):
1. Remembering and Understanding (40% - 28 Marks): Definitions, statements of laws, IUPAC names, terminology, conceptual explanations.
2. Applying (30% - 21 Marks): Numericals, solving conversions, naming products, predicting precipitation/electrochemical outcomes.
3. Analysing, Evaluating and Creating (30% - 21 Marks): Deducing mechanisms, case-based data interpretation, reasoning anomalies (d-block oxidation states, acidity/basicity trends, CFT crystal field splitting).

CRITICAL CHEMISTRY ACCURACY DIRECTIVES:
- Physical Chemistry: Calculations MUST use correct formulas (E_cell = E_cathode - E_anode, Lambda_m = (kappa * 1000) / M, Delta T_b = i * K_b * m, pi = i * C * R * T, k = (2.303/t) * log([R]0/[R]), mu = sqrt(n(n+2)) BM). Provide clean numerical data with SI units (S cm^2 mol^-1, mol L^-1 s^-1, etc.).
- Inorganic Chemistry: Balanced redox equations for KMnO4 and K2Cr2O7 in acidic medium. State electronic configurations accurately (Cr: [Ar] 3d^5 4s^1, Cu: [Ar] 3d^10 4s^1).
- Organic Chemistry: Every chemical transformation must be reaction-wise accurate. Mechanisms for SN1, SN2, acid-catalysed hydration/dehydration must follow standard arrow-pushing logic in solutions.`
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
Prescribed Units & Chapters (Latest 2026-27 Curriculum, Theory: 70 Marks, 3 Hours):
1. Unit VI: Reproduction (16 Marks)
   - Chapter-1: Sexual Reproduction in Flowering Plants (Flower structure; development of male and female gametophytes; pollination - types, agencies and examples; outbreeding devices; pollen-pistil interaction; double fertilization; post fertilization events - development of endosperm and embryo, development of seed and formation of fruit; special modes - apomixis, parthenocarpy, polyembryony; Significance of seed dispersal and fruit formation).
   - Chapter-2: Human Reproduction (Male and female reproductive systems; microscopic anatomy of testis and ovary; gametogenesis - spermatogenesis and oogenesis; menstrual cycle; fertilisation, embryo development upto blastocyst formation, implantation; pregnancy and placenta formation - elementary idea; parturition - elementary idea; lactation - elementary idea).
   - Chapter-3: Reproductive Health (Need for reproductive health and prevention of Sexually Transmitted Diseases - STDs; birth control - need and methods, contraception and medical termination of pregnancy - MTP; amniocentesis; infertility and assisted reproductive technologies - IVF, ZIFT, GIFT - elementary idea for general awareness).
2. Unit VII: Genetics and Evolution (20 Marks)
   - Chapter-4: Principles of Inheritance and Variation (Heredity and variation: Mendelian inheritance; deviations from Mendelism - incomplete dominance, co-dominance, multiple alleles and inheritance of blood groups, pleiotropy; elementary idea of polygenic inheritance; chromosome theory of inheritance; chromosomes and genes; Sex determination - in humans, birds and honey bee; linkage and crossing over; sex-linked inheritance - haemophilia, colour blindness; Mendelian disorders in humans - thalassemia; chromosomal disorders in humans - Down's syndrome, Turner's and Klinefelter's syndromes).
   - Chapter-5: Molecular Basis of Inheritance (Search for genetic material and DNA as genetic material; Structure of DNA and RNA; DNA packaging; DNA replication; Central Dogma; transcription, genetic code, translation; gene expression and regulation - lac operon; Genome, Human and rice genome projects; DNA fingerprinting).
   - Chapter-6: Evolution (Origin of life; biological evolution and evidences for biological evolution: paleontology, comparative anatomy, embryology and molecular evidences; Darwin's contribution, modern synthetic theory of evolution; mechanism of evolution - variation by mutation and recombination and natural selection with examples, types of natural selection; Gene flow and genetic drift; Hardy-Weinberg's principle; adaptive radiation; human evolution).
3. Unit VIII: Biology and Human Welfare (12 Marks)
   - Chapter-7: Human Health and Diseases (Pathogens; parasites causing human diseases: malaria, dengue, chikungunya, filariasis, ascariasis, typhoid, pneumonia, common cold, amoebiasis, ring worm and their control; Basic concepts of immunology - vaccines; cancer, HIV and AIDS; Adolescence - drug and alcohol abuse).
   - Chapter-8: Microbes in Human Welfare (Microbes in food processing, industrial production, sewage treatment, energy generation and microbes as bio-control agents and bio-fertilizers; Antibiotics - production and judicious use).
4. Unit IX: Biotechnology and its Applications (12 Marks)
   - Chapter-9: Biotechnology - Principles and Processes (Genetic Engineering - Recombinant DNA Technology, tools: restriction enzymes, DNA ligase, cloning vectors pBR322, competent hosts; processes of recombinant DNA technology: isolation of DNA, PCR, insertion, bioreactors, downstream processing).
   - Chapter-10: Biotechnology and its Application (Application of biotechnology in health and agriculture: Human insulin and vaccine production, stem cell technology, gene therapy; genetically modified organisms - Bt crops; transgenic animals; biosafety issues, biopiracy and patents).
5. Unit X: Ecology and Environment (10 Marks)
   - Chapter-11: Organisms and Populations (Population interactions - mutualism, competition, predation, parasitism; population attributes - growth, birth rate and death rate, age distribution).
   - Chapter-12: Ecosystem (Ecosystems: Patterns, components; productivity and decomposition; energy flow; pyramids of number, biomass, energy).
   - Chapter-13: Biodiversity and its Conservation (Biodiversity: Concept, patterns, importance; loss of biodiversity; biodiversity conservation; hotspots, endangered organisms, extinction, Red Data Book, Sacred Groves, biosphere reserves, national parks, wildlife sanctuaries and Ramsar sites).

STRICTLY DELETED / FORMATIVE-ONLY TOPICS (NEVER GENERATE SUMMATIVE QUESTIONS FROM THESE):
- Old Chapter 1: Reproduction in Organisms is completely DELETED.
- Old Chapter 9: Strategies for Enhancement in Food Production is completely DELETED.
- Environmental Issues (Air/Water pollution, Solid/Radioactive Wastes, Greenhouse effect, Ozone depletion, Deforestation): Assessed only FORMATIVELY in schools; strictly EXCLUDED from summative board examinations.
- In Chapter 11 (Organisms and Populations): "Organism and its Environment", "Major Abiotic Factors (temperature, water, light, soil)", "Responses to Abiotic Factors", and "Adaptations" are EXCLUDED.
- In Chapter 12 (Ecosystem): "Ecological Succession" (hydrarch and xerarch) and "Nutrient Cycles" (carbon cycle and phosphorus cycle) are EXCLUDED.

QUESTION PAPER DESIGN & COMPETENCY DISTRIBUTION (CBSE 2026-27):
- Demonstrate Knowledge and Understanding: 50% (35 Marks) - State, name, list, identify, define, suggest, describe, outline, summarize.
- Application of Knowledge / Concepts: 30% (21 Marks) - Calculate, illustrate, show, adapt, explain, distinguish.
- Analyse, Evaluate and Create: 20% (14 Marks) - Interpret, analyse, compare, contrast, examine, evaluate, discuss, construct.
- Internal Choice: Approximately 33% internal choice across sections.

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

  const socialClass10Constraint = isClass10Social
    ? `--- CBSE CLASS 10 SOCIAL SCIENCE (SUBJECT CODE 087) FOUR-COMPONENT DIRECTIVE ---
CRITICAL 4-COMPONENT SEPARATION MANDATE:
Class 10 Social Science is NOT a generic single-subject pool. It consists of FOUR distinct, independent components:
1. History (India and the Contemporary World - II)
2. Geography (Contemporary India - II)
3. Political Science (Democratic Politics - II)
4. Economics (Understanding Economic Development)

History ≠ Geography ≠ Political Science ≠ Economics!
Never mix topics, content, or questions between these four distinct components.

TARGETED CHAPTER & SHORT-PAPER BOUNDARY ENFORCEMENT:
- If the user selected chapters from only ONE component (e.g. only History: "Nationalism in India"), generate questions EXCLUSIVELY from that specific chapter and subject. Never introduce questions from Geography, Political Science, or Economics!
- If the user selected chapters from multiple components (e.g. 1 Geography + 1 Economics), distribute questions strictly and proportionately among only those selected chapters.
- Never generate questions from unselected components or out-of-syllabus/deleted topics!

OFFICIAL COMPONENT SPECIFICATIONS & SYLLABUS (NCERT):
1. History (India and the Contemporary World - II):
   - Prescribed Chapters:
     * Chapter 1: The Rise of Nationalism in Europe
     * Chapter 2: Nationalism in India
     * Chapter 3: The Making of a Global World (Subtopics 1 to 1.3: Pre-modern World to Conquest, Disease and Trade for Board Exams; Subtopics 2 to 4.4 are for Interdisciplinary Project only)
     * Chapter 5: Print Culture and the Modern World
     * Note: Chapter 4 "The Age of Industrialisation" is for Periodic Assessment only.
   - History Map Pointing Items (from Nationalism in India):
     * Congress Sessions: Calcutta (Sep 1920), Nagpur (Dec 1920), Madras (1927).
     * Satyagraha & Movement Centres: Champaran (Indigo), Kheda (Peasant), Ahmedabad (Cotton Mill), Amritsar (Jallianwala Bagh), Chauri Chaura (Calling off Non-Cooperation Movement), Dandi (Civil Disobedience Movement).

2. Geography (Contemporary India - II):
   - Prescribed Chapters:
     * Chapter 1: Resources and Development
     * Chapter 2: Forest and Wildlife Resources
     * Chapter 3: Water Resources
     * Chapter 4: Agriculture
     * Chapter 5: Minerals and Energy Resources
     * Chapter 6: Manufacturing Industries
     * Chapter 7: Lifelines of National Economy (ONLY Map Pointing to be evaluated in Board Examination)
   - Geography Map Pointing Items:
     * Major Soil Types (Alluvial, Black, Red & Yellow, Laterite, Arid, Forest).
     * Dams: Salal, Bhakra Nangal, Tehri, Rana Pratap Sagar, Sardar Sarovar, Hirakud, Nagarjuna Sagar, Tungabhadra.
     * Agriculture: Major areas of Rice and Wheat; Largest/Major producer states of Sugarcane, Tea, Coffee, Rubber, Cotton, and Jute.
     * Minerals & Energy: Thermal Power Plants (Namrup, Singrauli, Ramagundam); Nuclear Power Plants (Narora, Kakrapar, Tarapur, Kalpakkam); Coal, Oil fields, and Iron ore mines.
     * Manufacturing: Cotton Textiles (Mumbai, Indore, Surat, Kanpur, Coimbatore); Iron & Steel (Durgapur, Bokaro, Jamshedpur, Bhilai, Vijayanagar, Salem); Software Technology Parks (Noida, Gandhinagar, Mumbai, Pune, Hyderabad, Bengaluru, Chennai, Thiruvananthapuram).
     * Lifelines of National Economy: Major Ports (Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia); International Airports (Amritsar, Delhi, Mumbai, Chennai, Kolkata, Hyderabad).

3. Political Science (Democratic Politics - II):
   - Prescribed Chapters:
     * Chapter 1: Power-sharing
     * Chapter 2: Federalism
     * Chapter 3: Gender, Religion and Caste
     * Chapter 4: Political Parties
     * Chapter 5: Outcomes of Democracy

4. Economics (Understanding Economic Development):
   - Prescribed Chapters:
     * Chapter 1: Development
     * Chapter 2: Sectors of the Indian Economy
     * Chapter 3: Money and Credit
     * Chapter 4: Globalisation and the Indian Economy (Evaluated topics: "What is Globalization?" and "Factors that have enabled Globalisation")
     * Note: Chapter 5 "Consumer Rights" is for Project Work only (no board exam questions).

SUBJECT-SPECIFIC QUESTION QUALITY DIRECTIVE:
- History: Chronological accuracy, conceptual depth, cause-consequence relationships, source/passage analysis, nationalist movements.
- Geography: Conceptual understanding, spatial/environmental analysis, resource distribution, map reading/labelling.
- Political Science: Constitutional provisions, federal structures, democratic debate, assertion-reason, power-sharing mechanisms.
- Economics: Conceptual clarity (GDP, PCI, HDI, formal/informal credit, terms of credit, multinational corporations), real-world scenario analysis, data-based interpretation.`
    : "";

  const phyEduClass12Constraint = isClass12PhyEdu
    ? `--- CBSE CLASS 12 PHYSICAL EDUCATION (SUBJECT CODE 048) OFFICIAL CURRICULUM & SYLLABUS DIRECTIVE ---
Theory: 70 Marks (3 Hours) | Practical Assessment: 30 Marks | Total: 100 Marks
(Based strictly on latest prescribed CBSE syllabus and official blueprints)

OFFICIAL 10 UNITS & SYLLABUS TOPICS:
1. Unit 1: Management of Sporting Events (Weightage: 05 + 04 b* Marks = 9 Marks)
   - Functions of Sports Events Management: Planning, Organising, Staffing, Directing, and Controlling.
   - Various Committees and their Responsibilities: Pre-tournament, During-tournament, and Post-tournament committees (Organising, Technical, Finance, Transport, Boarding & Lodging, Refreshment, Ground & Equipment, First Aid, Publicity, Reception, Prize distribution).
   - Fixtures and their Procedures:
     * Knock-Out Tournament: Formula for total matches = N - 1. Calculation of Byes = Next higher power of 2 - N. Distribution of Byes in Upper Half and Lower Half. Seeding procedure and Special Seeding.
     * League / Round Robin Tournament: Cyclic method, Staircase method, and Tabular method. Formula for total matches = N(N - 1) / 2. Deciding winner (British method & American method percentage).
     * Combination Tournaments: Knock-out cum Knock-out, League cum League, Knock-out cum League, League cum Knock-out.
   - Intramural and Extramural Tournaments: Meaning, Objectives, and Significance in school/community.
   - Community Sports Program: Sports Day, Health Run, Run for Fun, Run for Specific Cause, and Run for Unity.

2. Unit 2: Children and Women in Sports (Weightage: 07 Marks)
   - Exercise Guidelines of WHO for different age groups: Under 5 years, 5–17 years (children & adolescents: at least 60 min moderate-to-vigorous aerobic daily), 18–64 years (adults: 150-300 min moderate aerobic weekly), 65 years & above.
   - Common Postural Deformities and Corrective Measures:
     * Knock Knees (Genu Valgum) & Bow Legs (Genu Varum)
     * Flat Foot (Pes Planus)
     * Round Shoulders
     * Spinal Curvatures: Kyphosis (Hunchback / round upper back), Lordosis (Swayback / inward curve of lumbar), Scoliosis (lateral S/C curve of spine).
     * Specific corrective yogic asanas and physical exercises for each deformity.
   - Women's Participation in Sports: Physical, Psychological, and Social benefits.
   - Special Consideration: Menarche and Menstrual Dysfunction (amenorrhea, dysmenorrhea, oligomenorrhea).
   - Female Athlete Triad: Interrelationship among Osteoporosis (low bone mineral density), Amenorrhea (absence of menstrual cycles), and Eating Disorders (Anorexia Nervosa & Bulimia Nervosa).

3. Unit 3: Yoga as Preventive measure for Lifestyle Disease (Weightage: 06 + 01 b* Marks = 7 Marks)
   - Obesity: Procedure, Benefits, and Contraindications for Tadasana, Katichakrasana, Pavanmuktasana, Matsyasana, Halasana, Paschimottanasana, Ardha-Matsyendrasana, Dhanurasana, Ushtrasana, Suryabhedan Pranayama.
   - Diabetes: Procedure, Benefits, and Contraindications for Katichakrasana, Pavanmuktasana, Bhujangasana, Shalabhasana, Dhanurasana, Suptavajrasana, Paschimottanasana, Ardha-Matsyendrasana, Mandukasana, Gomukhasana, Yogmudra, Ushtrasana, Kapalbhati.
   - Asthma: Procedure, Benefits, and Contraindications for Tadasana, Urdhwahastottanasana, UttanMandukasana, Bhujangasana, Dhanurasana, Ushtrasana, Vakrasana, Kapalbhati, Gomukhasana, Matsyasana, Anuloma-Viloma.
   - Hypertension: Procedure, Benefits, and Contraindications for Tadasana, Katichakrasana, Uttanpadasana, Ardha Halasana, Sarala Matsyasana, Gomukhasana, UttanMandukasana, Vakrasana, Bhujangasana, Makarasana, Shavasana, Nadishodhanapranayama, Sheetali Pranayama.
   - Back Pain and Arthritis: Procedure, Benefits, and Contraindications for Tadasana, Urdhwahastottanasana, Ardha-Chakrasana, Ushtrasana, Vakrasana, Sarala Matsyendrasana, Bhujangasana, Gomukhasana, Bhadrasana, Makarasana, Nadi-Shodhana Pranayama.
   * NOTE: Strict correctness of Asana names, Sanskrit terminologies, body alignments, breathing, and specific medical contraindications (e.g. avoiding forward bends in back pain/hernia, avoiding backward bends in hernia/ulcer, avoiding inversions in high blood pressure).

4. Unit 4: Physical Education and Sports for CWSN (Children with Special Needs - Divyang) (Weightage: 04 + 04 b* Marks = 8 Marks)
   - Organizations Promoting Disability Sports:
     * Special Olympics: Founded by Eunice Kennedy Shriver (1968), Special Olympics Bharat for intellectual disabilities.
     * Paralympics: Founded by Sir Ludwig Guttmann (Stoke Mandeville 1948 / Rome 1960), International Paralympic Committee (IPC) for physical/visual disabilities.
     * Deaflympics: Founded 1924 Paris, International Committee of Sports for the Deaf (ICSD), visual cues instead of auditory starters.
   - Concept of Classification and Divisioning in Sports: Medical and functional classification systems, divisioning criteria (age, gender, ability) to ensure fair and equitable competition.
   - Concept of Inclusion in Sports: Meaning, Need, and Implementation strategies in regular physical education curriculum.
   - Advantages of Physical Activities for CWSN: Physical, cognitive, emotional, social, and psychological benefits.
   - Strategies to Make Physical Activities Accessible for CWSN: Assistive equipment, modified rules/court dimensions, individualized instruction, trained personnel, safe environment.

5. Unit 5: Sports and Nutrition (Weightage: 07 Marks)
   - Concept of Balanced Diet and Nutrition: Definition, energy requirements, caloric balance.
   - Macro and Micro Nutrients:
     * Macro Nutrients: Carbohydrates (simple & complex, 4 kcal/g), Proteins (essential & non-essential amino acids, 4 kcal/g), Fats (saturated, unsaturated, trans fats, 9 kcal/g), Water.
     * Micro Nutrients: Minerals (Macro: Calcium, Phosphorus, Sodium, Potassium, Magnesium; Micro: Iron, Iodine, Zinc, Copper) and Vitamins (Fat-soluble: A, D, E, K; Water-soluble: B-complex, C) - sources and deficiency symptoms.
   - Nutritive and Non-Nutritive Components of Diet:
     * Nutritive: Carbs, proteins, fats, minerals, vitamins.
     * Non-Nutritive: Roughage/Fibre, Water, Color compounds, Flavour compounds, Plant compounds (phytochemicals).
   - Eating for Weight Control: Meaning of Healthy Weight, BMI categories (<18.5 Underweight, 18.5-24.9 Normal, 25-29.9 Overweight, >=30 Obese), Pitfalls of Dieting (skipping meals, extreme restriction, lack of nutrients), Food Intolerance vs Food Allergy, Common Food Myths.
   - Importance of Diet in Sports: Pre-competition meal (high carb, moderate protein, low fat/fibre, 3-4 hours prior), During-competition hydration & electrolyte replenishment, Post-competition recovery nutrition (carbohydrate-protein ratio 3:1 or 4:1 within 30-45 minutes).

6. Unit 6: Test and Measurement in Sports (Weightage: 08 Marks)
   - Fitness Test - SAI Khelo India Fitness Test in Schools:
     * Age Group 5–8 Years (Classes 1–3): BMI, Flamingo Balance Test (static balance), Plate Tapping Test (speed and coordination of limb movement).
     * Age Group 9–18 Years (Classes 4–12): BMI, 50m Speed Dash, 600m Run/Walk (cardiovascular endurance), Sit and Reach Test (hamstring & lower back flexibility), Strength Tests: Partial Abdominal Curl Up (abdominal core strength), Push-Ups for boys (upper body muscular endurance), Modified Push-Ups for girls.
   - Measurement of Cardio-Vascular Fitness - Harvard Step Test:
     * Equipment & protocol (bench height: 20 inches / 50.8 cm for boys, 16 inches for girls; 30 steps/min for 5 minutes).
     * Fitness Index (Short Form) = (100 * Test duration in seconds) / (5.5 * Pulse count between 1 to 1.5 min after exercise).
     * Fitness Index (Long Form) = (100 * Test duration in seconds) / (2 * Sum of 3 recovery pulse counts: 1-1.5 min, 2-2.5 min, 3-3.5 min).
   - Computing Basal Metabolic Rate (BMR): Concept of BMR, factors affecting BMR (age, gender, lean body mass, body temperature), calculation formulas (Harris-Benedict equation / Mifflin-St Jeor equation).
   - Rikli and Jones - Senior Citizen Fitness Test (Full Battery of 6 Items):
     1. Chair Stand Test: Lower body strength (repetitions in 30 seconds).
     2. Arm Curl Test: Upper body strength (repetitions in 30 sec with 5 lb dumbbell for women, 8 lb for men).
     3. Chair Sit and Reach Test: Lower body flexibility (ruler measurement to toe in inches).
     4. Back Scratch Test: Upper body / shoulder flexibility (distance between fingertips in inches).
     5. Eight Foot Up and Go Test: Motor agility and dynamic balance (time in seconds to walk 8 feet, turn, and sit).
     6. Six-Minute Walk Test: Aerobic endurance and functional stamina (total distance walked in 6 minutes).
   - Johnsen - Methney Test of Motor Educability: Test battery items (Front Roll, Roll, Jumping Half-Turn, Jumping Full-Turn), scoring and significance.

7. Unit 7: Physiology and Injuries in Sport (Weightage: 04 + 04 b* Marks = 8 Marks)
   - Physiological Factors Determining Components of Physical Fitness:
     * Strength: Muscle size (cross-sectional area), body weight, muscle fiber composition (fast twitch vs slow twitch), nerve impulse coordination.
     * Speed: Fast-twitch (white) muscle fibers, nervous system responsiveness, flexibility, biochemical energy reserves (ATP-CP).
     * Endurance: Aerobic capacity (VO2 max, oxygen uptake/transport/economy), lactate threshold, slow-twitch (red) fibers, muscle glycogen.
     * Flexibility: Joint structure, muscle elasticity, age/gender, temperature, connective tissue.
   - Effect of Exercise on the Muscular System: Hypertrophy, increased capillary density, increased myoglobin & mitochondrial density, change in connective tissue, glycogen storage capacity.
   - Effect of Exercise on Cardio-Respiratory System: Cardiac hypertrophy (Athletic heart), increased stroke volume, decreased resting heart rate (bradycardia), increased cardiac output during exercise, increased vital capacity, tidal volume, and VO2 max, reduced rate of respiration at rest.
   - Physiological Changes Due to Aging: Reduction in bone mineral density, sarcopenia (loss of muscle mass), decrease in cardiovascular elasticity, decrease in lung compliance, sensory decline.
   - Sports Injuries Classification and Management:
     * Soft Tissue Injuries:
       - Skin injuries: Abrasion, Contusion (hematoma/bruise), Laceration, Incision.
       - Muscle/Tendon injuries: Strain (mild, moderate, severe muscle tear).
       - Ligament injuries: Sprain (torn or stretched ligament, common in ankle/knee).
     * Bone and Joint Injuries:
       - Dislocations: Shoulder, hip, finger, wrist dislocations.
       - Fractures: Simple/Closed, Compound/Open, Greenstick (common in children), Comminuted (bone broken into multiple pieces), Transverse (right angle to axis), Oblique (slanted), Impacted (bone ends driven into each other).
     * First Aid Management: PRICER procedure (Protect, Rest, Ice, Compression, Elevation, Referral) for acute soft tissue injuries; immobilisation and splinting for fractures.

8. Unit 8: Biomechanics and Sports (Weightage: 10 Marks)
   - Newton's Laws of Motion and their Application in Sports:
     * First Law (Law of Inertia): An object remains at rest or in uniform motion unless acted upon by external force (e.g. sprinter starting from blocks, ball rolling until friction stops it).
     * Second Law (Law of Acceleration / Momentum, F = ma): Force is proportional to rate of change of momentum (e.g. baseball pitcher throwing fast, follow-through in kicking).
     * Third Law (Law of Action and Reaction): For every action, there is an equal and opposite reaction (e.g. swimmer pushing water backwards, high jumper pushing ground downwards).
   - Types of Levers and their Application in Sports:
     * Anatomy of Levers: Fulcrum (F), Effort (E), Load/Resistance (L).
     * Class I Lever (F in middle - L-F-E): Nodding head, triceps extension at elbow, scissors, rowing oars.
     * Class II Lever (L in middle - F-L-E): Standing on tiptoes (plantar flexion / gastrocnemius), push-up pivot at toes. Provides mechanical advantage for force.
     * Class III Lever (E in middle - F-E-L): Biceps curl (flexion at elbow), kicking a football, batting in cricket. Provides mechanical advantage for speed and range of motion.
   - Equilibrium (Dynamic and Static) and Centre of Gravity (CG):
     * Static Equilibrium (body at rest) vs Dynamic Equilibrium (body in motion).
     * Principles of stability: Lower CG increases stability, broader base of support increases stability, CG must fall within base of support. Application in wrestling, gymnastics, sprinting.
   - Friction and Sports:
     * Types: Static friction, Dynamic/Kinetic friction (Sliding friction, Rolling friction), Fluid friction (air/water resistance).
     * Friction as friend and foe: Necessary for grip (spikes in track shoes, chalk on gymnast hands, studs in football boots); detrimental when resistance impedes motion (waxing skis, smooth cycling suits, streamlined swimming).
   - Projectile in Sports:
     * Concept of projectile, trajectory (parabola).
     * Factors affecting projectile trajectory: Angle of release (optimum 45° if release & landing heights are equal; <45° in shotput/discus due to higher release point), initial velocity, height of release, air resistance, spin (Magnus effect), gravity.

9. Unit 9: Psychology and Sports (Weightage: 07 Marks)
   - Personality - Definition and Types:
     * Definition: Dynamic organization within individual of psychophysical systems.
     * Carl Jung's Classification: Introverts, Extroverts, Ambiverts.
     * Big Five Theory (OCEAN Model): Openness to experience, Conscientiousness, Extraversion, Agreeableness, Neuroticism.
   - Motivation - Types and Techniques in Sports:
     * Intrinsic Motivation (internal enjoyment, mastery, self-determination) vs Extrinsic Motivation (medals, money, fame, punishment avoidance).
     * Techniques: Goal setting, positive reinforcement, feedback, spectators/audience, praise and blame.
   - Exercise Adherence: Meaning, reasons for non-adherence, psychological and health benefits of adherence, strategies for enhancing adherence (social support, setting achievable goals, enjoyable activities, progress monitoring).
   - Aggression in Sports:
     * Meaning and concept of aggression.
     * Types: Hostile Aggression (intent to cause bodily harm/pain), Instrumental Aggression (harm caused as a byproduct of achieving a goal), Assertive Behavior (high intensity/force without intent to injure, within rules).
   - Psychological Attributes in Sports:
     * Self-Esteem: Self-worth and confidence in athletic competence.
     * Mental Imagery: Visualization, cognitive rehearsal of motor movements before execution.
     * Self-Talk: Positive vs negative self-talk, instructional and motivational cues.
     * Goal Setting: SMART principles (Specific, Measurable, Achievable, Relevant, Time-bound), Outcome vs Performance vs Process goals.

10. Unit 10: Training in Sports (Weightage: 09 Marks)
    - Concept of Talent Identification and Talent Development:
      * Talent Identification: Discovering individuals with high athletic potential using scientific, physiological, anthropometric, and motor tests.
      * Talent Development: Providing systematic training environment, coaching, nutrition, and psychological support to convert potential into peak performance.
    - Sports Training Cycle:
      * Micro Cycle: Shortest training block, usually lasting 3 to 10 days (typically 1 week).
      * Meso Cycle: Medium-duration training block, usually lasting 3 to 6 weeks.
      * Macro Cycle: Longest training plan, usually spanning several months to 1 year (or 4 years in Olympic quadrennium), consisting of Preparatory, Competition, and Transition periods.
    - Methods to Develop Strength, Endurance, and Speed:
      * Strength Development:
        - Isometric exercises (constant muscle length, zero joint movement, e.g. wall push, plank).
        - Isotonic exercises (concentric shortening & eccentric lengthening, e.g. barbell curls, squats).
        - Isokinetic exercises (constant speed throughout range of motion against variable resistance, using dynamometers like Cybex).
      * Endurance Development:
        - Continuous training method (slow continuous & fast continuous without rest intervals).
        - Interval training method (work-rest-work protocol based on heart rate recovery, Fox & Mathews).
        - Fartlek training method (Swedish 'speed play' over varied natural terrain, invented by Gösta Holmér, heart rate fluctuates between 140-180 bpm).
      * Speed Development:
        - Acceleration runs (reaching maximum speed from stationary start within 20-30 meters).
        - Pace runs / Pace races (running uniform submaximal speed over entire distance, e.g. 800m, 1500m).
    - Methods to Develop Flexibility and Coordinative Ability:
      * Flexibility Development: Ballistic method (rhythmic bobbing/swinging), Static stretching method (hold for 10-30 sec), Dynamic stretching, PNF (Proprioceptive Neuromuscular Facilitation - contract-relax).
      * Coordinative Abilities: Orientation, Differentiation, Coupling, Reaction, Balance, Rhythm, Adaptation abilities.
    - Circuit Training:
      * Meaning, history (developed by R.E. Morgan and G.T. Adamson at University of Leeds in 1953).
      * Characteristics: 6 to 10 exercise stations arranged in a circle targeting alternative muscle groups, timed work-rest intervals.
      * Importance: Develops overall general strength, muscular endurance, and cardiovascular fitness simultaneously in a group setting.

INTERNAL ASSESSMENT / PRACTICAL (MAX. 30 MARKS) STRUCTURE (FOR CONTEXT & REFERENCE):
- Physical Fitness Test: SAI Khelo India Test / Brockport Physical Fitness Test (BPFT) for CWSN (6 Marks)
- Proficiency in Games and Sports (Skill of any one IOA recognized sport/game of choice) (7 Marks)
- Yogic Practices (7 Marks)
- Record File: Fitness test administration, 2 Asanas for each lifestyle disease, Field & Equipment diagrams, rules and skills (5 Marks)
- Viva Voce (Health / Games and Sports / Yoga) (5 Marks)
- b* Notation: Designates questions with visual/tactile diagrams or data interpretation designed with alternative concept-based questions for Visually Impaired candidates.

CRITICAL PHYSICAL EDUCATION QUALITY & TERMINOLOGY REQUIREMENTS:
1. Exact Sports Science Terminology: Formulas (Harvard Step Index, BMR), lever classifications (Classes 1, 2, 3), Newton's laws applications, types of injuries (Strain vs Sprain), WHO guidelines, and Asanas MUST be scientifically and factually accurate.
2. Knock-Out & League Fixtures: Fixture calculations, upper half / lower half division of teams, number of byes, and league pairings must adhere to exact mathematical formulas.
3. Case Studies: Must present realistic, practical athletic, school tournament, or training scenarios with authentic data and direct sub-questions.`
    : "";

  const scienceClass10Constraint = isClass10Science
    ? `--- CBSE CLASS 10 SCIENCE (SUBJECT CODE 086) THREE-COMPONENT DIRECTIVE ---
CRITICAL 3-COMPONENT SEPARATION MANDATE:
Class 10 Science is NOT a generic single-subject pool. It consists of THREE distinct, independent components:
1. Physics (25 Marks Theory: Natural Phenomena - 12 Marks, Effects of Current - 13 Marks)
2. Chemistry (25 Marks Theory: Chemical Substances - Nature and Behaviour - 25 Marks)
3. Biology (30 Marks Theory: World of Living - 25 Marks, Natural Resources - 5 Marks)
TOTAL THEORY: Exactly 80 Marks.

Physics ≠ Chemistry ≠ Biology!
Never mix topics, content, or questions between these three distinct components.

TARGETED CHAPTER & SHORT-PAPER BOUNDARY ENFORCEMENT:
- If the user selected chapters from only ONE component (e.g. only Physics: "Physics: Electricity" or only Chemistry: "Chemistry: Acids, Bases and Salts" or only Biology: "Biology: Life Processes"), generate questions EXCLUSIVELY from that specific chapter and component. Never introduce questions from the other two components!
- If the user selected chapters from multiple components (e.g. 1 Chemistry + 1 Biology), distribute questions strictly and proportionately among only those selected chapters.
- Never generate questions from unselected components or out-of-syllabus/deleted topics!

OFFICIAL COMPONENT SPECIFICATIONS & SYLLABUS:
1. PHYSICS (Themes: Natural Phenomena & How Things Work - 25 Marks):
   - Unit III: Natural Phenomena (12 Marks):
     * Light – Reflection and Refraction: Reflection of light by curved surfaces; Images formed by spherical mirrors, centre of curvature, principal axis, principal focus, focal length, mirror formula (derivation not required), magnification. Refraction; Laws of refraction, refractive index. Refraction of light by spherical lens; Image formed by spherical lenses; Lens formula (derivation not required); Magnification. Power of a lens.
     * The Human Eye and the Colourful World: Functioning of a lens in human eye, defects of vision (myopia, hypermetropia, presbyopia) and their corrections, applications of spherical mirrors and lenses. Refraction of light through a prism, dispersion of light, scattering of light, applications in daily life (Tyndall effect, blue colour of sky).
     * EXCLUSION: Colour of the sun at sunrise and sunset is strictly EXCLUDED.
   - Unit IV: Effects of Current (13 Marks):
     * Electricity: Electric current, potential difference and electric current. Ohm's law; Resistance, Resistivity, Factors on which the resistance of a conductor depends. Series combination of resistors, parallel combination of resistors and its applications in daily life. Heating effect of electric current and its applications in daily life (Joule's law). Electric power, Interrelation between P, V, I and R.
     * Magnetic Effects of Electric Current: Magnetic field, field lines, field due to a current carrying conductor, field due to current carrying coil or solenoid; Force on current carrying conductor, Fleming's Left Hand Rule, Direct current. Alternating current: frequency of AC. Advantage of AC over DC. Domestic electric circuits (earth wire, fuse, short circuit, overloading).

2. CHEMISTRY (Theme: Materials - 25 Marks):
   - Unit I: Chemical Substances - Nature and Behaviour (25 Marks):
     * Chemical Reactions and Equations: Chemical equation, Balanced chemical equation, implications of a balanced chemical equation, types of chemical reactions: combination, decomposition (thermal, electrolytic, photolytic), displacement, double displacement, precipitation, endothermic and exothermic reactions, oxidation and reduction, redox reactions.
     * Acids, Bases and Salts: Definitions in terms of furnishing of H+ and OH- ions, General properties, examples and uses, neutralization, concept of pH scale (definition relating to logarithm not required), importance of pH in everyday life; preparation and uses of Sodium Hydroxide (chlor-alkali process), Bleaching powder, Baking soda, Washing soda, and Plaster of Paris (water of crystallization).
     * Metals and Non-Metals: Properties of metals and non-metals; Reactivity series; Formation and properties of ionic compounds; Basic metallurgical processes (crushing, concentration, roasting, calcination, reduction, refining); Corrosion and its prevention (galvanization, alloying).
     * Carbon and its Compounds: Covalent bonding in carbon compounds (tetravalency and catenation). Versatile nature of carbon. Homologous series. Nomenclature of carbon compounds containing functional groups (halogens, alcohol, ketones, aldehydes, alkanes, alkenes and alkynes), difference between saturated hydrocarbons and unsaturated hydrocarbons. Chemical properties of carbon compounds (combustion, oxidation, addition and substitution reaction). Ethanol and Ethanoic acid (only properties and uses - esterification, saponification), soaps and detergents (micelle formation and cleansing action).

3. BIOLOGY (Themes: The World of the Living & Natural Resources - 30 Marks):
   - Unit II: World of Living (25 Marks):
     * Life Processes: 'Living Being'. Basic concept of nutrition (autotrophic & heterotrophic, stomata, human digestive system), respiration (aerobic & anaerobic, ATP, human respiratory system), transport (circulatory system in humans, blood, lymph, heart, transport of water and food in plants - xylem & phloem) and excretion (human excretory system, nephron structure, excretion in plants).
     * Control and Coordination: Tropic movements in plants (phototropism, geotropism, hydrotropism, thigmotropism, chemotropism); Introduction of plant hormones (auxin, gibberellin, cytokinin, abscisic acid); Control and co-ordination in animals: Nervous system; Voluntary, involuntary and reflex action (reflex arc); Chemical co-ordination: animal hormones (endocrine glands, adrenaline, thyroxine, growth hormone, insulin, testosterone, estrogen).
     * How do Organisms Reproduce?: Reproduction in animals and plants (asexual: fission, fragmentation, regeneration, budding, vegetative propagation, spore formation; and sexual reproduction in flowering plants - pollination & fertilization; human male and female reproductive systems); reproductive health - need and methods of family planning (barrier, chemical, surgical). Safe sex vs HIV/AIDS. Child bearing and women's health.
     * Heredity: Heredity; Mendel's contribution - Laws for inheritance of traits (monohybrid & dihybrid cross, phenotype & genotype ratios); Sex determination: brief introduction (XX and XY chromosomes).
     * EXCLUSIONS: Evolution; evolution and classification; and evolution should not be equated with progress are strictly EXCLUDED from evaluation.
   - Unit V: Natural Resources (5 Marks):
     * Our Environment: Eco-system (biotic and abiotic components, food chains and food webs, trophic levels, 10% law of energy flow), Environmental problems, Ozone depletion (CFCs, Montreal protocol), waste production and their solutions. Biodegradable and non-biodegradable substances.
     * EXCLUSION: NCERT Chapter 16 "Management of Natural Resources" will NOT be assessed in the year-end examination (assigned for portfolio/internal assessment only).

SUBJECT-SPECIFIC QUESTION QUALITY DIRECTIVE:
- Physics:
  * Calculations, formulas, sign conventions (Cartesian), circuit diagrams, ray diagrams, and standard SI units (A, V, Ω, Ω·m, W, kWh, J, D) MUST be 100% scientifically accurate.
  * Numerical questions must provide sufficient, clear data with realistic physical values.
  * Ray diagrams must follow strict mirror and lens rules (principal focus, centre of curvature, optical centre).
- Chemistry:
  * Chemical equations MUST be balanced with proper states of matter (s, l, g, aq) where relevant.
  * IUPAC nomenclature, structural formulas, functional group representations, and reaction conditions (catalysts, heat) must be exact.
  * Acids, bases, and pH questions must reflect standard observable indicators and lab reactions.
- Biology:
  * Diagrams (human heart, nephron, reflex arc, human digestive/respiratory/reproductive systems, flower parts) and physiological mechanisms must use accurate biological terminology.
  * Mendel's crosses must show clear parent phenotypes/genotypes, gametes, and F1/F2 ratios (3:1, 9:3:3:1).
  * Ecological concepts must accurately adhere to the 10% energy transfer rule and biomagnification.`
    : "";

  const accountancyClass12Constraint = isClass12Accounts
    ? `--- CBSE CLASS 12 ACCOUNTANCY (SUBJECT CODE 055) CURRICULUM & EXAMINATION DIRECTIVE ---
CRITICAL COURSE STRUCTURE & UNIT WEIGHTAGES (THEORY: 80 MARKS, 3 HOURS; PROJECT: 20 MARKS):
PART A: ACCOUNTING FOR PARTNERSHIP FIRMS AND COMPANIES (60 MARKS - 150 PERIODS)
1. Unit 1: Accounting for Partnership Firms (36 Marks)
   - Partnership Fundamentals:
     * Partnership: Features, Partnership Deed.
     * Provisions of the Indian Partnership Act, 1932 in the absence of partnership deed (no interest on capital, no salary/commission, interest on drawings not charged, profits shared equally, interest on partner's loan @ 6% p.a.).
     * Note: Interest on partner's loan is to be treated as a CHARGE AGAINST PROFITS (debited to Profit and Loss Account, not P&L Appropriation Account).
     * Fixed vs Fluctuating capital accounts. Preparation of Profit and Loss Appropriation Account: division of profit among partners, guarantee of profits.
     * Past adjustments (relating to interest on capital, interest on drawing, salary and profit sharing ratio) using Statement Showing Adjustments.
     * Goodwill: Meaning, nature, factors affecting, and methods of valuation: Average profit method, Super profit method, and Capitalisation method (capitalisation of average profit & super profit).
     * Note: Goodwill must be adjusted through partners' capital/current accounts strictly as per AS 26 (Intangible Assets - self-generated goodwill cannot be recognized in the books of accounts).
   - Reconstitution of a Partnership Firm:
     * Change in Profit Sharing Ratio among existing partners: Sacrificing ratio (Old Ratio - New Ratio) and Gaining ratio (New Ratio - Old Ratio). Accounting for revaluation of assets and reassessment of liabilities. Treatment of reserves, accumulated profits and losses (Workmen Compensation Reserve, Investment Fluctuation Reserve, etc.). Preparation of Revaluation Account and Balance Sheet.
     * Admission of a Partner: Effect of admission on PSR, calculation of sacrificing ratio. Treatment of goodwill strictly as per AS 26 (Premium for Goodwill). Revaluation of assets and reassessment of liabilities. Treatment of reserves, accumulated profits and losses. Adjustment of capital accounts (based on new partner's capital or total capital of new firm) and preparation of partners' capital/current accounts and Balance Sheet of reconstituted firm.
     * Retirement and Death of a Partner: Effect of retirement/death on PSR, calculation of gaining ratio. Treatment of goodwill strictly as per AS 26. Revaluation of assets and reassessment of liabilities, adjustment of accumulated profits, losses and reserves. Adjustment of capital accounts, preparation of capital/current accounts, and Balance Sheet. Preparation of Loan Account of the retiring partner.
     * Death of a Partner: Calculation of deceased partner's share of profit till the date of death (on time basis or turnover/sales basis, credited via P&L Suspense A/c or Gaining Partners' Capital A/cs). Preparation of deceased partner's capital account and his Executor's Account.
   - Dissolution of a Partnership Firm:
     * Meaning of dissolution of partnership vs dissolution of partnership firm; types/modes of dissolution.
     * Settlement of accounts: Preparation of Realisation Account, Partners' Capital Accounts, and Cash/Bank Account (excluding piecemeal distribution, sale to a company and insolvency of partner(s)).
     * MANDATORY REALISATION RULES (CBSE OFFICIAL SYLLABUS NOTES):
       (i) If the realised value of tangible assets is not given, it should be considered as realised at book value itself.
       (ii) If the realised value of intangible assets is not given, it should be considered as nil (zero value).
       (iii) In case realisation expenses are borne by a partner, clear indication must be given regarding the payment thereof (e.g. paid by firm on behalf of partner, or paid by partner himself).

2. Unit 2: Accounting for Companies (24 Marks)
   - Accounting for Share Capital:
     * Features and types of companies. Share and share capital: nature and types.
     * Issue and allotment of equity and preference shares. Public subscription of shares: over-subscription and under-subscription. Issue at par and at premium. Calls in advance and calls in arrears (excluding interest). Issue of shares for consideration other than cash.
     * Concepts of Private Placement, Employee Stock Option Plan (ESOP), and Sweat Equity.
     * Accounting treatment of forfeiture and re-issue of shares:
       - Forfeiture of shares issued at par and at premium (premium received vs not received).
       - Re-issue of forfeited shares at par, premium, or discount (maximum permissible discount on reissue cannot exceed the amount forfeited on those specific reissued shares).
       - Transfer to Capital Reserve = (Amount forfeited on reissued shares - Discount allowed on reissue).
     * Presentation and disclosure of share capital in the Balance Sheet of a company as per Schedule III Part I of the Companies Act, 2013 (Authorized Capital, Issued Capital, Subscribed Capital: Subscribed and fully paid up, Subscribed but not fully paid up, less Calls-in-Arrears, add Share Forfeited Account).
   - Accounting for Debentures:
     * Debentures: Meaning, types. Issue of debentures at par, at a premium, and at a discount. Issue of debentures for consideration other than cash.
     * Issue of debentures with terms of redemption:
       Case 1: Issued at par, redeemable at par.
       Case 2: Issued at discount, redeemable at par.
       Case 3: Issued at premium, redeemable at par.
       Case 4: Issued at par, redeemable at premium.
       Case 5: Issued at discount, redeemable at premium.
       Case 6: Issued at premium, redeemable at premium.
     * Debentures as collateral security (concept, disclosure in Balance Sheet, and Journal entries).
     * Interest on debentures (concept of TDS is excluded).
     * MANDATORY DEBENTURES RULE (AS 16 DIRECTIVE):
       Discount or loss on issue of debentures to be written off in the year debentures are allotted: FIRST from Securities Premium Reserve (if it exists) and then balance from Statement of Profit and Loss as Finance Cost (AS 16).

PART B: FINANCIAL STATEMENT ANALYSIS (20 MARKS)
3. Unit 3: Analysis of Financial Statements (12 Marks)
   - Financial Statements of a Company:
     * Meaning, nature, uses and importance of financial statements.
     * Statement of Profit and Loss and Balance Sheet in prescribed format with major headings and sub-headings as per Schedule III to the Companies Act, 2013. (Note: Exceptional items, extraordinary items and discontinued operations are excluded).
   - Financial Statement Analysis: Meaning, significance, objectives, importance and limitations.
   - Tools for Financial Statement Analysis: Comparative statements, Common size statements, Ratio analysis, Cash flow analysis.
   - Accounting Ratios: Meaning, objectives, classification and computation:
     * Liquidity Ratios: Current Ratio (Current Assets / Current Liabilities, ideal 2:1) and Quick Ratio / Acid-test Ratio (Quick Assets / Current Liabilities, ideal 1:1).
     * Solvency Ratios:
       - Debt to Equity Ratio = Long-term Debts / Shareholders' Funds (ideal 2:1)
       - Total Assets to Debt Ratio = Total Assets / Long-term Debts
       - Proprietary Ratio = Shareholders' Funds / Total Assets
       - Interest Coverage Ratio = Net Profit before Interest and Tax / Fixed Interest Charges (expressed in times)
     * Activity / Turnover Ratios (expressed in 'Times'):
       - Inventory Turnover Ratio = Cost of Revenue from Operations / Average Inventory
       - Trade Receivables Turnover Ratio = Net Credit Revenue from Operations / Average Trade Receivables
       - Trade Payables Turnover Ratio = Net Credit Purchases / Average Trade Payables
       - Working Capital Turnover Ratio = Revenue from Operations / Working Capital
     * Profitability Ratios (expressed in '%'):
       - Gross Profit Ratio = (Gross Profit / Revenue from Operations) * 100
       - Operating Ratio = [(Cost of Revenue from Operations + Operating Expenses) / Revenue from Operations] * 100
       - Operating Profit Ratio = (Operating Profit / Revenue from Operations) * 100
       - Net Profit Ratio = (Net Profit after Tax / Revenue from Operations) * 100
       - Return on Investment (ROI) / Return on Capital Employed = (Net Profit before Interest and Tax / Capital Employed) * 100

4. Unit 4: Cash Flow Statement (8 Marks)
   - Meaning, objectives, benefits, and preparation (Indirect Method only as per AS 3 Revised). (Note: Extra-ordinary items excluded).
   - Calculation of Cash flows from Operating Activities, Investing Activities, and Financing Activities.
   - Adjustments relating to: Depreciation and amortization, profit or loss on sale of non-current assets/investments, dividend (both final proposed/paid and interim dividend), provision for tax and tax paid.
   - MANDATORY CASH FLOW RULES (CBSE OFFICIAL SYLLABUS NOTES):
     (i) Bank overdraft and cash credit are to be treated as short-term borrowings under FINANCING ACTIVITIES.
     (ii) Current investments are to be considered as Marketable Securities / Cash Equivalents unless specified otherwise.
     (iii) Proposed dividend of current year is ignored (contingent liability); only proposed dividend of previous year declared/paid in current year is added in Operating Activities and deducted in Financing Activities.
     (iv) Interim dividend paid during the year is added back to Net Profit in Operating Activities and deducted under Financing Activities.

QUESTION PAPER TYPOLOGY & COMPETENCIES (80 MARKS TOTAL - IMAGE 1):
1. Remembering and Understanding (40% - 32 Marks): Recalling accounting terms, rules of partnership act, Schedule III headings, journal entry rules, ratio definitions, theory of debentures and shares.
2. Applying (30% - 24 Marks): Journal entries for issue/forfeiture/reissue of shares, issue of debentures with redemption terms, partnership revaluation/admission calculations, ratio computations, cash flow adjustments.
3. Analysing, Evaluating and Creating (30% - 24 Marks): Case-based partnership profit appropriation, past adjustments statements, pro-rata allotment tables, dissolution realisation accounts, comprehensive Cash Flow Statement preparation.

CRITICAL ACCOUNTANCY ACCURACY & NUMERICAL INTEGRITY DIRECTIVE:
1. Double-Entry Accuracy: Every journal entry MUST balance (Debit total = Credit total). Always include brief, clear narrations ("Being...").
2. Standard Ledger Accounts: Revaluation A/c, Realisation A/c, Partners' Capital A/cs, Cash/Bank A/c must have proper Dr. / Cr. and column headers.
3. Schedule III Compliance: Balance sheet disclosure of share capital must provide Notes to Accounts with Authorised, Issued, Subscribed & fully paid-up, Subscribed but not fully paid-up, Less Calls-in-arrears, Add Share forfeited a/c.
4. Mathematical & Data Consistency: Provide complete, logically consistent numbers. When calculating ratios or cash flow, all required balance sheet figures and adjustments must correlate perfectly.`
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

  // Specialized prompt for Full Class 10 Social Science Board / Pre-Board / Sample / Half-Yearly Papers (80 Marks, 6 Sections, 37 Questions)
  if (isFullClass10SocialExam) {
    return buildClass10SocialFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Physical Education Board / Pre-Board / Sample / Half-Yearly Papers (70 Marks, 5 Sections, 37 Questions)
  if (isFullClass12PhyEduExam) {
    return buildClass12PhyEduFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 10 Science Board / Pre-Board / Sample / Half-Yearly Papers (80 Marks, 3 Sections: Biology 30M, Chemistry 25M, Physics 25M, 39 Questions)
  if (isFullClass10ScienceExam) {
    return buildClass10ScienceFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Chemistry Board / Pre-Board / Sample / Half-Yearly Papers (70 Marks, 5 Sections, 33 Questions)
  if (isFullClass12ChemistryExam) {
    return buildClass12ChemistryFullExamPrompt(config, solutionDirective);
  }

  // Specialized prompt for Full Class 12 Accountancy Board / Pre-Board / Sample / Half-Yearly Papers (80 Marks, 2 Parts, 34 Questions)
  if (isFullClass12AccountsExam) {
    return buildClass12AccountancyFullExamPrompt(config, solutionDirective);
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
${chemistryClass12Constraint}
${csClass12Constraint}
${biologyClass12Constraint}
${economicsClass12Constraint}
${geographyClass12Constraint}
${socialClass10Constraint}
${phyEduClass12Constraint}
${scienceClass10Constraint}
${accountancyClass12Constraint}

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
${chemistryClass12Constraint}
${csClass12Constraint}
${biologyClass12Constraint}
${economicsClass12Constraint}
${geographyClass12Constraint}
${socialClass10Constraint}
${phyEduClass12Constraint}
${scienceClass10Constraint}
${accountancyClass12Constraint}

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
 * Strictly adheres to the 2025-26 / 2026-27 Course Structure, 9 Units, 14 Chapters, and official CBSE Examination Blueprint.
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
Follow the official CBSE 2025-26 / 2026-27 Course Structure and Unit Weightage strictly:
- Unit I (Electrostatics: Ch 1 & 2) + Unit II (Current Electricity: Ch 3) => 16 Marks
- Unit III (Magnetic Effects: Ch 4 & 5) + Unit IV (EMI & AC: Ch 6 & 7) => 17 Marks
- Unit V (EM Waves: Ch 8) + Unit VI (Optics: Ch 9 & 10) => 18 Marks
- Unit VII (Dual Nature: Ch 11) + Unit VIII (Atoms & Nuclei: Ch 12 & 13) => 12 Marks
- Unit IX (Electronic Devices: Ch 14) => 7 Marks
Total = 16 + 17 + 18 + 12 + 7 = 70 Marks.`;

  return `
You are a Senior CBSE Examination Paper Setter and Chief Examiner for Class 12 Physics (Subject Code 042) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 12 Physics Theory Question Paper for 2025-26 / 2026-27.

Total Marks: 70
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: Physics (Subject Code 042)
Class: Class 12 (CBSE Senior Secondary)

======================================================================
CRITICAL CBSE SYLLABUS & PRESCRIBED UNITS DIRECTIVE (2025-26 / 2026-27)
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

--- OFFICIAL COURSE STRUCTURE & PRESCRIBED UNITS (70 MARKS TOTAL, CBSE 2026-27) ---
1. Unit VI: Reproduction (16 Marks)
   - Chapter-1: Sexual Reproduction in Flowering Plants (Flower structure; development of male and female gametophytes; pollination - types, agencies and examples; outbreeding devices; pollen-pistil interaction; double fertilization; post fertilization events - development of endosperm and embryo, development of seed and formation of fruit; special modes - apomixis, parthenocarpy, polyembryony; Significance of seed dispersal and fruit formation).
   - Chapter-2: Human Reproduction (Male and female reproductive systems; microscopic anatomy of testis and ovary; gametogenesis - spermatogenesis and oogenesis; menstrual cycle; fertilisation, embryo development upto blastocyst formation, implantation; pregnancy and placenta formation - elementary idea; parturition - elementary idea; lactation - elementary idea).
   - Chapter-3: Reproductive Health (Need for reproductive health and prevention of Sexually Transmitted Diseases - STDs; birth control - need and methods, contraception and medical termination of pregnancy - MTP; amniocentesis; infertility and assisted reproductive technologies - IVF, ZIFT, GIFT - elementary idea for general awareness).

2. Unit VII: Genetics and Evolution (20 Marks)
   - Chapter-4: Principles of Inheritance and Variation (Heredity and variation: Mendelian inheritance; deviations from Mendelism - incomplete dominance, co-dominance, multiple alleles and inheritance of blood groups, pleiotropy; elementary idea of polygenic inheritance; chromosome theory of inheritance; chromosomes and genes; Sex determination - in humans, birds and honey bee; linkage and crossing over; sex-linked inheritance - haemophilia, colour blindness; Mendelian disorders in humans - thalassemia; chromosomal disorders in humans - Down's syndrome, Turner's and Klinefelter's syndromes).
   - Chapter-5: Molecular Basis of Inheritance (Search for genetic material and DNA as genetic material; Structure of DNA and RNA; DNA packaging; DNA replication; Central Dogma; transcription, genetic code, translation; gene expression and regulation - lac operon; Genome, Human and rice genome projects; DNA fingerprinting).
   - Chapter-6: Evolution (Origin of life; biological evolution and evidences for biological evolution: paleontology, comparative anatomy, embryology and molecular evidences; Darwin's contribution, modern synthetic theory of evolution; mechanism of evolution - variation by mutation and recombination and natural selection with examples, types of natural selection; Gene flow and genetic drift; Hardy-Weinberg's principle; adaptive radiation; human evolution).

3. Unit VIII: Biology and Human Welfare (12 Marks)
   - Chapter-7: Human Health and Diseases (Pathogens; parasites causing human diseases: malaria, dengue, chikungunya, filariasis, ascariasis, typhoid, pneumonia, common cold, amoebiasis, ring worm and their control; Basic concepts of immunology - vaccines; cancer, HIV and AIDS; Adolescence - drug and alcohol abuse).
   - Chapter-8: Microbes in Human Welfare (Microbes in food processing, industrial production, sewage treatment, energy generation and microbes as bio-control agents and bio-fertilizers; Antibiotics - production and judicious use).

4. Unit IX: Biotechnology and its Applications (12 Marks)
   - Chapter-9: Biotechnology - Principles and Processes (Genetic Engineering - Recombinant DNA Technology, tools: restriction enzymes, DNA ligase, cloning vectors pBR322, competent hosts; processes of recombinant DNA technology: isolation of DNA, PCR, insertion, bioreactors, downstream processing).
   - Chapter-10: Biotechnology and its Application (Application of biotechnology in health and agriculture: Human insulin and vaccine production, stem cell technology, gene therapy; genetically modified organisms - Bt crops; transgenic animals; biosafety issues, biopiracy and patents).

5. Unit X: Ecology and Environment (10 Marks)
   - Chapter-11: Organisms and Populations (Population interactions - mutualism, competition, predation, parasitism; population attributes - growth, birth rate and death rate, age distribution).
   - Chapter-12: Ecosystem (Ecosystems: Patterns, components; productivity and decomposition; energy flow; pyramids of number, biomass, energy).
   - Chapter-13: Biodiversity and its Conservation (Biodiversity: Concept, patterns, importance; loss of biodiversity; biodiversity conservation; hotspots, endangered organisms, extinction, Red Data Book, Sacred Groves, biosphere reserves, national parks, wildlife sanctuaries and Ramsar sites).

STRICTLY DELETED / FORMATIVE-ONLY TOPICS (NEVER GENERATE SUMMATIVE QUESTIONS FROM THESE):
- Old Chapter 1: Reproduction in Organisms (DELETED)
- Old Chapter 9: Strategies for Enhancement in Food Production (DELETED)
- Environmental Issues (Air/Water pollution, Solid/Radioactive Wastes, Greenhouse effect, Ozone depletion, Deforestation): Strictly FORMATIVE reading material only, NOT assessed in summative board examinations.
- In Chapter 11 (Organisms and Populations): "Organism and its Environment", "Major Abiotic Factors (temperature, water, light, soil)", "Responses to Abiotic Factors", and "Adaptations" are EXCLUDED.
- In Chapter 12 (Ecosystem): "Ecological Succession" and "Nutrient Cycles" are EXCLUDED.

--- QUESTION PAPER DESIGN & COMPETENCY DISTRIBUTION (CBSE 2026-27) ---
- Demonstrate Knowledge and Understanding: 50% (35 Marks) - Suggestive verbs: State, name, list, identify, define, suggest, describe, outline, summarize.
- Application of Knowledge / Concepts: 30% (21 Marks) - Suggestive verbs: Calculate, illustrate, show, adapt, explain, distinguish.
- Analyse, Evaluate and Create: 20% (14 Marks) - Suggestive verbs: Interpret, analyse, compare, contrast, examine, evaluate, discuss, construct.
- An internal choice of approximately 33% is provided across the question paper.

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

/**
 * Builds the official 80-Mark, 6-Section, 37-Question examination paper prompt for CBSE Class 10 Social Science (Subject Code 087).
 * Strictly adheres to the 4-component balance: History (18+2 Map = 20M), Geography (17+3 Map = 20M), Political Science (20M), Economics (20M).
 */
function buildClass10SocialFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED CHAPTER FOCUS ---
When generating questions across the four components, strictly prioritize these selected chapters/topics chosen by the user:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated questions originate strictly from these chosen chapters while maintaining the component structure.`
      : `--- FULL SYLLABUS COVERAGE (EQUAL 4-COMPONENT BALANCE) ---
Cover all prescribed chapters across History, Geography, Political Science, and Economics evenly according to the official CBSE blueprint.`;

  return `
You are a Senior CBSE Examination Paper Setter and Head Examiner for Class 10 Social Science (Subject Code 087) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 10 Social Science Question Paper for 2026.

Total Marks: 80
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: Social Science (Subject Code 087)
Class: Class 10 (Class X)

======================================================================
MANDATORY FOUR-COMPONENT STRUCTURE & SUBJECT-WISE WEIGHTAGE (80 MARKS)
======================================================================
Social Science consists of FOUR distinct components, each carrying exactly 20 Marks (25% weightage):
1. History (India and the Contemporary World - II): 18 Marks Theory + 2 Marks Map Pointing = 20 Marks (25%)
2. Geography (Contemporary India - II): 17 Marks Theory + 3 Marks Map Pointing = 20 Marks (25%)
3. Political Science (Democratic Politics - II): 20 Marks Theory = 20 Marks (25%)
4. Economics (Understanding Economic Development): 20 Marks Theory = 20 Marks (25%)
TOTAL: Exactly 80 Marks (100%).

CRITICAL INDEPENDENCE RULE:
History ≠ Geography ≠ Political Science ≠ Economics!
Each component must maintain its own syllabus and question pool. You must NEVER mix topics across components or generate disproportionate questions from one component while neglecting another.

======================================================================
OFFICIAL SYLLABUS BOUNDARIES & PRESCRIBED NCERT TEXTBOOKS
======================================================================
1. HISTORY (India and the Contemporary World - II):
   - The Rise of Nationalism in Europe (French Revolution, Nation-states, Liberal Nationalism, Unifications of Italy and Germany, Visualizing the Nation, Nationalism and Imperialism)
   - Nationalism in India (First World War, Khilafat and Non-Cooperation, Differing Strands within the Movement, Towards Civil Disobedience, The Sense of Collective Belonging)
   - The Making of a Global World (ONLY Subtopics 1 to 1.3: Pre-modern World to Conquest, Disease and Trade for Board Examination)
   - Print Culture and the Modern World (The First Printed Books, Print comes to Europe, The Print Revolution, The Reading Mania, The Nineteenth Century, India and the World of Print, Religious Reform and Public Debates, New Forms of Publication, Print and Censorship)
   - STRICTLY EXCLUDED FROM BOARD EXAM:
     * "The Age of Industrialisation" is for Periodic Assessment only.
     * "The Making of a Global World" subtopics 2 to 4.4 are for Interdisciplinary Project only.
   - History Map Items (from Nationalism in India):
     * INC Sessions: Calcutta (Sep 1920), Nagpur (Dec 1920), Madras (1927).
     * Satyagraha & Nationalist Centres: Champaran (Indigo), Kheda (Peasant), Ahmedabad (Cotton Mill), Amritsar (Jallianwala Bagh), Chauri Chaura (Calling off Non-Cooperation), Dandi (Civil Disobedience).

2. GEOGRAPHY (Contemporary India - II):
   - Resources and Development (Classification, Development, Planning in India, Land resources, Land degradation and conservation, Soil as a resource, Classification of soils, Soil erosion and conservation)
   - Forest and Wildlife Resources (Flora and Fauna, Depletion of Flora and Fauna, Conservation of forest and wildlife in India, Types and distribution of forests, Community and Conservation)
   - Water Resources (Water Scarcity, Multi-purpose river projects and integrated water resources management, Rainwater harvesting)
   - Agriculture (Types of farming, Cropping pattern, Major crops, Technological and Institutional reforms, Contribution of agriculture to national economy)
   - Minerals and Energy Resources (What is a mineral, Mode of occurrence, Ferrous & Non-ferrous minerals, Non-metallic minerals, Rock minerals, Conservation of minerals, Conventional and Non-conventional energy resources, Conservation of energy resources)
   - Manufacturing Industries (Importance, Contribution of industry to national economy, Industrial location, Classification of industries, Spatial distribution: Agro-based and Mineral-based, Industrial pollution and environmental degradation, Control of environmental degradation)
   - Lifelines of National Economy: ONLY Map Pointing to be evaluated in Board Examination (Major Ports & International Airports). Theory is for Interdisciplinary Project only.
   - Geography Map Items:
     * Soils: Alluvial, Black, Red and Yellow, Laterite, Arid, Forest and Mountainous.
     * Dams: Salal, Bhakra Nangal, Tehri, Rana Pratap Sagar, Sardar Sarovar, Hirakud, Nagarjuna Sagar, Tungabhadra.
     * Agriculture: Major areas of Rice and Wheat; Largest/Major producer states of Sugarcane, Tea, Coffee, Rubber, Cotton, and Jute.
     * Energy: Thermal (Namrup, Singrauli, Ramagundam); Nuclear (Narora, Kakrapar, Tarapur, Kalpakkam).
     * Manufacturing: Cotton Textiles (Mumbai, Indore, Surat, Kanpur, Coimbatore); Iron & Steel (Durgapur, Bokaro, Jamshedpur, Bhilai, Vijayanagar, Salem); Software Technology Parks (Noida, Gandhinagar, Mumbai, Pune, Hyderabad, Bengaluru, Chennai, Thiruvananthapuram).
     * Lifelines of National Economy: Major Ports (Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia); International Airports (Amritsar - Raja Sansi, Delhi - IGI, Mumbai - CSM, Chennai - Meenambakkam, Kolkata - NSCB, Hyderabad - Rajiv Gandhi).

3. POLITICAL SCIENCE (Democratic Politics - II):
   - Power-sharing (Case studies of Belgium and Sri Lanka, Majoritarianism in Sri Lanka, Accommodation in Belgium, Why power sharing is desirable, Forms of power sharing)
   - Federalism (What is Federalism, What makes India a federal country, How is federalism practiced, Decentralization in India)
   - Gender, Religion and Caste (Gender and Politics, Women's political representation, Religion, Communalism and Politics, Caste and Politics, Caste inequalities, Caste in politics, Politics in caste)
   - Political Parties (Why do we need political parties, Functions, How many parties should we have, National parties, State parties, Challenges to political parties, How can parties be reformed)
   - Outcomes of Democracy (How do we assess democracy's outcomes, Accountable, responsive and legitimate government, Economic growth and development, Reduction of inequality and poverty, Accommodation of social diversity, Dignity and freedom of citizens)

4. ECONOMICS (Understanding Economic Development):
   - Development (What development promises, National development, How to compare different countries or states, Income and other criteria, Public facilities, Sustainability of development)
   - Sectors of the Indian Economy (Sectors of economic activities, Comparing the three sectors, Primary, Secondary and Tertiary sectors in India, Where are most of the people employed, How to create more employment, Division of sectors as Organized and Unorganized, Sectors in terms of ownership: Public and Private)
   - Money and Credit (Money as a medium of exchange, Modern forms of money, Loan activities of banks, Two different credit situations, Terms of credit, Formal sector credit in India, Self-help groups for the poor)
   - Globalisation and the Indian Economy (ONLY Subtopics evaluated in Board Examination: "What is Globalization?" and "Factors that have enabled Globalisation" including IT & Trade Liberalization). Subtopics on WTO and Struggle for Fair Globalisation are for project work.
   - STRICTLY EXCLUDED FROM BOARD EXAM:
     * "Consumer Rights" is for Project Work / Internal Assessment only (0 marks in board exam).

${targetChaptersDirective}

======================================================================
MANDATORY 6-SECTION, 37-QUESTION BLUEPRINT STRUCTURE (EXACTLY 80 MARKS)
======================================================================
The paper MUST consist of exactly 6 sections (Section A to Section F) and exactly 37 sequentially numbered questions (Q1 to Q37):

----------------------------------------------------------------------
SECTION A: Multiple Choice Questions (Q1 to Q20) — 20 Questions x 1 Mark = 20 Marks
----------------------------------------------------------------------
- Exactly 20 MCQs carrying 1 mark each.
- Distribution: Balanced strictly across all 4 subjects:
  * Q1 to Q5: History (~5 Questions) — includes chronology/ordering of events, identifying personalities/quotes, source snippet interpretation, and Assertion-Reason.
  * Q6 to Q10: Geography (~5 Questions) — includes resource classification, matching soil/crop with state, statement evaluation, and conservation measures.
  * Q11 to Q15: Political Science (~5 Questions) — includes forms of power-sharing, subjects in Union/State/Concurrent lists, party ideologies, and Assertion-Reason.
  * Q16 to Q20: Economics (~5 Questions) — includes per capita income/HDI calculation concept, identifying employment disguised unemployment scenarios, formal vs informal credit comparison, and globalization drivers.
- Question Typology: Standard MCQs, Assertion-Reason, Picture/Statement-based, Match the Following, Correct Sequence/Chronology.
- Every question in Section A must have "choices": exactly 4 distinct, plausible options. Set "marks": 1, "type": "mcq" (or "assertionReason" where applicable).

----------------------------------------------------------------------
SECTION B: Very Short Answer (VSA) Questions (Q21 to Q24) — 4 Questions x 2 Marks = 8 Marks
----------------------------------------------------------------------
- Narrative questions requiring concise, point-wise answers (not exceeding 40 words, 2 distinct evaluated points).
- Subject Distribution: Exactly ONE from each subject:
  * Q21: History (2 Marks)
  * Q22: Geography (2 Marks)
  * Q23: Political Science (2 Marks)
  * Q24: Economics (2 Marks)
- At least 1 question must provide an internal choice ("orQuestion" and "orSolution") from the same subject.
- Set "marks": 2, "type": "vsa", "choices": null.

----------------------------------------------------------------------
SECTION C: Short Answer (SA) Questions (Q25 to Q29) — 5 Questions x 3 Marks = 15 Marks
----------------------------------------------------------------------
- Narrative questions requiring clear, conceptual explanations (not exceeding 60 words, 3 distinct evaluated points).
- Subject Distribution:
  * Q25: History (3 Marks)
  * Q26: Geography (3 Marks)
  * Q27: Political Science (3 Marks)
  * Q28: Economics (3 Marks)
  * Q29: Political Science OR Economics (3 Marks - balancing marks so that History=18, Geography=17, PolScience=20, Economics=20).
- At least 1 question must provide an internal choice ("orQuestion" and "orSolution") from the same subject.
- Set "marks": 3, "type": "sa", "choices": null.

----------------------------------------------------------------------
SECTION D: Long Answer (LA) Questions (Q30 to Q33) — 4 Questions x 5 Marks = 20 Marks
----------------------------------------------------------------------
- Comprehensive narrative questions requiring detailed, multi-dimensional answers (not exceeding 120 words, 5 points).
- EXACTLY ONE QUESTION PER SUBJECT COMPONENT:
  * Q30: History (5 Marks) — MUST provide an internal choice ("orQuestion") also from prescribed History.
  * Q31: Geography (5 Marks) — MUST provide an internal choice ("orQuestion") also from prescribed Geography.
  * Q32: Political Science (5 Marks) — MUST provide an internal choice ("orQuestion") also from prescribed Political Science.
  * Q33: Economics (5 Marks) — MUST provide an internal choice ("orQuestion") also from prescribed Economics.
- Set "marks": 5, "type": "la", "choices": null.

----------------------------------------------------------------------
SECTION E: Case Study / Source-Based Questions (Q34 to Q36) — 3 Questions x 4 Marks = 12 Marks
----------------------------------------------------------------------
- Exactly 3 Case-Based questions carrying 4 marks each.
- Distribution:
  * Q34: History Case Study (4 Marks) — Extract from Nationalism in Europe, Nationalism in India, or Print Culture (120-160 words).
  * Q35: Geography Case Study (4 Marks) — Extract on water scarcity/conservation, agriculture, or mineral management (120-160 words).
  * Q36: Economics / Political Science Case Study (4 Marks) — Real-world scenario on credit/banking, self-help groups, globalization, or power sharing (120-160 words).
- Each Case Study must present the passage followed by 3 sub-questions:
  - (i) 1 Mark (recall / identification)
  - (ii) 1 Mark (interpretation / comprehension)
  - (iii) 2 Marks (analytical / application, with an internal choice "OR" in sub-question iii).
- Format text as: "Read the source given below and answer the questions that follow:\\n\\n[Text of passage]\\n\\n(34.1) [Question 1] (1 Mark)\\n(34.2) [Question 2] (1 Mark)\\n(34.3) [Question 3] (2 Marks)\\nOR\\n[Alternative Question 3] (2 Marks)"
- Set "marks": 4, "type": "caseStudy", "choices": null.

----------------------------------------------------------------------
SECTION F: Map Skill Based Question (Q37) — 5 Marks Total
----------------------------------------------------------------------
- Exactly 1 comprehensive Map Skill Question numbered 37, divided into two distinct parts:
  * Q37 (a): History Map Skill (2 Marks)
    "Two places A and B have been marked on the given outline political map of India. Identify them and write their correct names on the lines drawn near them:
    (A) [A Congress Session or Nationalist Satyagraha Centre, e.g., 'The place where Indian National Congress session was held in September 1920' OR 'The place where Mahatma Gandhi broke the salt law'] (1 Mark)
    (B) [Another Satyagraha or Incident centre, e.g., 'The place where the Jallianwala Bagh incident took place' OR 'The place where the movement of Indigo planters took place'] (1 Mark)"
  * Q37 (b): Geography Map Skill (3 Marks)
    "On the same outline political map of India, locate and label ANY THREE of the following with suitable symbols:
    (i) [A Dam from syllabus, e.g., Salal / Bhakra Nangal / Tehri / Sardar Sarovar / Hirakud] (1 Mark)
    (ii) [A Major Crop Region, e.g., Major Rice producing area / Major Sugarcane producer state] (1 Mark)
    (iii) [A Power Plant, e.g., Singrauli Thermal Power Plant / Tarapur Nuclear Power Plant / Kalpakkam] (1 Mark)
    (iv) [An Industrial Centre or Major Sea Port / Airport, e.g., Mumbai Cotton Textile / Bengaluru Software Technology Park / Marmagao Port / Netaji Subhash Chandra Bose International Airport] (1 Mark)"
- Set "marks": 5, "type": "la", "choices": null.

======================================================================
COGNITIVE COMPETENCY LEVELS (CBSE GUIDELINES)
======================================================================
1. Remembering and Understanding: 30% (24 Marks)
2. Applying: 13.25% (11 Marks)
3. Formulating, Analysing, Evaluating and Creating: 50% (40 Marks)
4. Map Skill: 6.25% (5 Marks)

======================================================================
${solutionDirective}
======================================================================

--- JSON SCHEMA FORMAT ---
Output strictly a valid JSON object matching the following structure. Do not wrap in markdown fences:
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions (1 Mark each)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [History MCQ text...]",
          "marks": 1,
          "type": "mcq",
          "choices": ["(A) Choice 1", "(B) Choice 2", "(C) Choice 3", "(D) Choice 4"],
          "orQuestion": null,
          "solution": "(B) Choice 2 - [Detailed explanation]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Very Short Answer Type Questions (2 Marks each, max 40 words)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q21",
          "text": "21. [History 2-Mark Question]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "Point-wise marking scheme: [1 Mark for point 1, 1 Mark for point 2]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer Type Questions (3 Marks each, max 60 words)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q25",
          "text": "25. [3-Mark Question]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "Point-wise marking scheme: [3 distinct points with explanation = 3 Marks]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Long Answer Type Questions (5 Marks each, max 120 words)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q30",
          "text": "30. [History 5-Mark Question]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative History 5-Mark Question]",
          "solution": "Point-wise 5-Mark evaluation breakdown",
          "orSolution": "Point-wise 5-Mark evaluation breakdown for alternative question"
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Case-Based / Source-Based Questions (4 Marks each)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q34",
          "text": "34. Read the source given below and answer the questions that follow:\\n\\n[Passage text...]\\n\\n(34.1) [Sub-question 1] (1 Mark)\\n(34.2) [Sub-question 2] (1 Mark)\\n(34.3) [Sub-question 3] (2 Marks)\\nOR\\n[Alternative Sub-question 3] (2 Marks)",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(34.1) [1 Mark answer]\\n(34.2) [1 Mark answer]\\n(34.3) [2 Marks answer with breakdown]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section F",
      "description": "Map Skill Based Question (5 Marks)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q37",
          "text": "37. (a) Two places A and B have been marked on the given outline political map of India. Identify them and write their correct names on the lines drawn near them:\\n(A) [History Feature 1] (1 Mark)\\n(B) [History Feature 2] (1 Mark)\\n\\n(b) On the same outline political map of India, locate and label any THREE of the following with suitable symbols:\\n(i) [Geography Feature 1] (1 Mark)\\n(ii) [Geography Feature 2] (1 Mark)\\n(iii) [Geography Feature 3] (1 Mark)\\n(iv) [Geography Feature 4] (1 Mark)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Official Map Identification & Labelling Key:\\n37(a) History Identification (2 Marks):\\n(A) [Correct place name, e.g. Calcutta] [1 Mark]\\n(B) [Correct place name, e.g. Dandi] [1 Mark]\\n\\n37(b) Geography Location & Labelling (Any 3 x 1 = 3 Marks):\\n(i) [Correct location and state] [1 Mark]\\n(ii) [Correct location and state] [1 Mark]\\n(iii) [Correct location and state] [1 Mark]\\n(iv) [Correct location and state] [1 Mark]",
          "orSolution": null
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 70-Mark, 5-Section, 37-Question examination paper prompt for CBSE Class 12 Physical Education (Subject Code 048).
 * Follows the official CBSE 2024-25 / 2025-26 / 2026-27 design:
 * Total Marks: 70 | Time Allowed: 3 Hours
 * - Section A: Questions 1 to 18 (18 Multiple Choice Questions carrying 1 mark each = 18 Marks). All compulsory.
 * - Section B: Questions 19 to 24 (6 Very Short Answer carrying 2 marks each, candidates attempt any 5 = 10 Marks, 60–90 words).
 * - Section C: Questions 25 to 30 (6 Short Answer carrying 3 marks each, candidates attempt any 5 = 15 Marks, 100–150 words).
 * - Section D: Questions 31 to 33 (3 Case-Based Questions carrying 4 marks each = 12 Marks, with internal choices in sub-parts).
 *     * Q31: Unit 1 (Management of Sporting Events / Fixtures)
 *     * Q32: Unit 4 (Physical Education and Sports for CWSN - Divyang)
 *     * Q33: Unit 7 (Physiology and Injuries in Sport)
 * - Section E: Questions 34 to 37 (4 Long Answer carrying 5 marks each, candidates attempt any 3 = 15 Marks, 200–300 words).
 * Total: 18 + 10 + 15 + 12 + 15 = 70 Marks (37 Questions total).
 */
function buildClass12PhyEduFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED UNITS & TOPICS FOCUS ---
When generating questions across all sections, strictly prioritize and select questions from these chosen units/topics:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated questions originate strictly from these chosen units/topics while maintaining the 5-section paper blueprint.`
      : `--- FULL SYLLABUS COVERAGE (OFFICIAL 10 UNITS WEIGHTAGE) ---
Ensure balanced, comprehensive distribution across all 10 prescribed units in accordance with the official CBSE blueprint:
- Unit 1: Management of Sporting Events (05 + 04 b* = 9 Marks)
- Unit 2: Children and Women in Sports (7 Marks)
- Unit 3: Yoga as Preventive measure for Lifestyle Disease (06 + 01 b* = 7 Marks)
- Unit 4: Physical Education and Sports for CWSN (04 + 04 b* = 8 Marks)
- Unit 5: Sports and Nutrition (7 Marks)
- Unit 6: Test and Measurement in Sports (8 Marks)
- Unit 7: Physiology and Injuries in Sport (04 + 04 b* = 8 Marks)
- Unit 8: Biomechanics and Sports (10 Marks)
- Unit 9: Psychology and Sports (7 Marks)
- Unit 10: Training in Sports (9 Marks)
Total Marks: 70 Marks Theory (plus 30 Marks Practical Assessment = 100 Marks).`;

  return `
You are a Senior CBSE Examination Paper Setter and Chief Examiner for Class 12 Physical Education (Subject Code 048) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 12 Physical Education Question Paper for 2026.

Total Marks: 70
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: Physical Education (Subject Code 048)
Class: Class 12 (Class XII)

======================================================================
OFFICIAL SYLLABUS & UNIT WEIGHTAGE (70 MARKS)
======================================================================
1. Unit 1: Management of Sporting Events (05 + 04 b* = 9 Marks)
   - Functions of sports event management (POSDC), Committees & responsibilities (pre/during/post), Fixtures (Knockout: N-1 matches, byes formula, upper/lower half; League: Cyclic, Staircase, Tabular, N(N-1)/2 matches; Combination), Intramurals & Extramurals, Community sports.
2. Unit 2: Children and Women in Sports (7 Marks)
   - WHO exercise guidelines for age groups, Common postural deformities (Knock knees, flat foot, round shoulders, lordosis, kyphosis, scoliosis, bow legs) & corrective measures, Women in sports, Menarche & menstrual dysfunction, Female athlete triad (osteoporosis, amenorrhea, eating disorders).
3. Unit 3: Yoga as Preventive measure for Lifestyle Disease (06 + 01 b* = 7 Marks)
   - Obesity, Diabetes, Asthma, Hypertension, Back pain and Arthritis: exact procedures, benefits, and medical contraindications for prescribed Asanas and Pranayama.
4. Unit 4: Physical Education and Sports for CWSN (Divyang) (04 + 04 b* = 8 Marks)
   - Disability sports organizations (Special Olympics, Paralympics, Deaflympics), Classification & Divisioning in sports, Concept of Inclusion, Advantages of physical activities for CWSN, Strategies to make sports accessible for CWSN.
5. Unit 5: Sports and Nutrition (7 Marks)
   - Balanced diet, Macro & Micro nutrients, Nutritive vs Non-nutritive components, Weight control (healthy weight, dieting pitfalls, food intolerance, food myths), Sports diet (pre, during, post competition requirements).
6. Unit 6: Test and Measurement in Sports (8 Marks)
   - SAI Khelo India battery (5-8 yrs & 9-18 yrs), Harvard Step Test calculation formula, Computing BMR, Rikli & Jones Senior Citizen Fitness Test (6 items), Johnsen-Methney Test of Motor Educability.
7. Unit 7: Physiology and Injuries in Sport (04 + 04 b* = 8 Marks)
   - Physiological factors determining fitness components, Effect of exercise on Muscular & Cardio-Respiratory systems, Aging changes, Sports injuries classification (soft tissue & bone/joint fractures) and PRICER management.
8. Unit 8: Biomechanics and Sports (10 Marks)
   - Newton's Laws of Motion & applications in sports, Types of Levers (Class I, II, III) & applications in human movement/sports, Equilibrium (Dynamic/Static) & Centre of Gravity, Friction in sports, Projectile motion & trajectory factors.
9. Unit 9: Psychology and Sports (7 Marks)
   - Personality (Jung & Big Five OCEAN), Motivation (intrinsic vs extrinsic & techniques), Exercise adherence, Aggression types (Hostile, Instrumental, Assertive), Psychological attributes (self-esteem, mental imagery, self-talk, goal setting).
10. Unit 10: Training in Sports (9 Marks)
    - Talent Identification & Development, Training cycles (Micro, Meso, Macro), Methods to develop Strength (isometric, isotonic, isokinetic), Endurance (continuous, interval, fartlek), Speed (acceleration & pace runs), Flexibility (ballistic, static, dynamic, PNF), Coordinative abilities, Circuit training.

${targetChaptersDirective}

======================================================================
QUESTION PAPER BLUEPRINT & SECTION-WISE SPECIFICATION (37 QUESTIONS, 70 MARKS)
======================================================================

----------------------------------------------------------------------
SECTION A: Multiple Choice Questions (Q1 to Q18) — 18 Questions x 1 Mark = 18 Marks
----------------------------------------------------------------------
- Exactly 18 MCQs carrying 1 mark each. All questions are compulsory.
- Distributed across all 10 units.
- Must include:
  * Conceptual definition questions (e.g. lever classes, BMR, sports training cycles, personality types).
  * 2 Assertion-Reason Questions: Standard 4 options:
    (A) Both A and R are true and R is the correct explanation of A.
    (B) Both A and R are true but R is not the correct explanation of A.
    (C) A is true but R is false.
    (D) A is false but R is true.
  * 1 Match the Following Question (e.g. Asana matched with Lifestyle disease, or Test item matched with physical fitness component).
  * 1 Statement-based / Data interpretation Question (e.g. BMI category or WHO exercise guidelines).
  * Diagram / Concept-based Question (e.g. identifying lever class from human movement, identifying posture deformity, or projectile angle). For Visually Impaired candidates (b*), the text must provide clear descriptive context so the question is fully answerable from text.
- Every question in Section A must have "choices": exactly 4 distinct, plausible options. Set "marks": 1, "type": "mcq" (or "assertionReason").

----------------------------------------------------------------------
SECTION B: Very Short Answer (VSA) Questions (Q19 to Q24) — 6 Questions (Attempt any 5) x 2 Marks = 10 Marks
----------------------------------------------------------------------
- Exactly 6 questions carrying 2 marks each.
- Candidates have to attempt ANY 5 questions (word limit: 60 to 90 words, 2 distinct evaluated points).
- Testing focused concepts: e.g.
  * Difference between Intramural and Extramural tournaments.
  * Any two objectives of Special Olympics or Deaflympics.
  * Meaning of Food Intolerance and one symptom.
  * Formula for computing Harvard Step Test Fitness Index (short form).
  * Two physiological changes occurring due to aging.
  * Meaning of Interval Training method or Fartlek method.
- Set "marks": 2, "type": "vsa", "choices": null.

----------------------------------------------------------------------
SECTION C: Short Answer (SA) Questions (Q25 to Q30) — 6 Questions (Attempt any 5) x 3 Marks = 15 Marks
----------------------------------------------------------------------
- Exactly 6 questions carrying 3 marks each.
- Candidates have to attempt ANY 5 questions (word limit: 100 to 150 words, 3 distinct evaluated points).
- Testing intermediate analytical sports concepts: e.g.
  * Procedure and rules for drawing a Knock-Out fixture for 11 or 13 teams (calculating matches, byes, upper/lower half).
  * Three corrective exercises for Flat Foot / Knock Knees / Kyphosis.
  * Procedure, benefits, and contraindications of any one Asana for Diabetes or Hypertension.
  * Macro nutrients vs Micro nutrients: functions and sources.
  * Newton's Second Law of Motion and its application in throwing / kicking sports.
  * Techniques for enhancing exercise adherence among individuals.
- Set "marks": 3, "type": "sa", "choices": null.

----------------------------------------------------------------------
SECTION D: Case-Based / Competency-Based Questions (Q31 to Q33) — 3 Questions x 4 Marks = 12 Marks
----------------------------------------------------------------------
- Exactly 3 Case-Based questions carrying 4 marks each. All questions are compulsory.
- In strict adherence to the syllabus blueprint and the 'b*' notation, the 3 case studies are allocated as:
  * Q31: Unit 1 (Management of Sporting Events / Tournament Fixtures):
    A realistic case study describing an inter-school or zonal sports tournament (e.g. 19 teams participating in a knock-out tournament, or organization committees).
    Followed by 4 sub-questions (1 mark each) or (1+1+2 marks):
    (31.1) Sub-question 1 (1 Mark)
    (31.2) Sub-question 2 (1 Mark)
    (31.3) Sub-question 3 (1 Mark)
    (31.4) Sub-question 4 (1 Mark) OR [Alternative sub-question with internal choice] (1 Mark)
  * Q32: Unit 4 (Physical Education & Sports for CWSN - Divyang):
    A case study highlighting an inclusive sports meet in a school or Paralympics athlete story, focusing on divisioning, adaptive physical education, assistive equipment, or benefits of sports for children with special needs.
    Followed by 4 sub-questions (1 mark each):
    (32.1) Sub-question 1 (1 Mark)
    (32.2) Sub-question 2 (1 Mark)
    (32.3) Sub-question 3 (1 Mark)
    (32.4) Sub-question 4 (1 Mark) OR [Alternative sub-question] (1 Mark)
  * Q33: Unit 7 (Physiology and Injuries in Sport):
    A sports case study involving an athlete experiencing an acute sports injury during a football/basketball match or marathon training, analyzing injury classification (sprain/strain/fracture), immediate PRICER management, or cardio-respiratory adaptation.
    Followed by 4 sub-questions (1 mark each):
    (33.1) Sub-question 1 (1 Mark)
    (33.2) Sub-question 2 (1 Mark)
    (33.3) Sub-question 3 (1 Mark)
    (33.4) Sub-question 4 (1 Mark) OR [Alternative sub-question] (1 Mark)
- Set "marks": 4, "type": "caseStudy", "choices": null.

----------------------------------------------------------------------
SECTION E: Long Answer (LA) Questions (Q34 to Q37) — 4 Questions (Attempt any 3) x 5 Marks = 15 Marks
----------------------------------------------------------------------
- Exactly 4 questions carrying 5 marks each.
- Candidates have to attempt ANY 3 questions (word limit: 200 to 300 words, comprehensive point-wise structure).
- Testing in-depth core syllabus domains:
  * Q34 (Unit 8: Biomechanics and Sports): Detailed explanation of Types of Levers (Class I, Class II, Class III) with anatomical fulcrum-effort-load diagram representations, mechanical advantages, and specific sporting examples (e.g. kicking, push-ups, rowing).
  * Q35 (Unit 10: Training in Sports): Explain different methods to develop Strength (Isometric, Isotonic, Isokinetic) OR Endurance (Continuous, Interval, Fartlek) along with their physiological merits and training guidelines.
  * Q36 (Unit 3: Yoga as Preventive measure for Lifestyle Disease): In-depth discussion of Obesity or Back Pain and Arthritis: explain two distinct Asanas with step-by-step procedures, physiological benefits, and contraindications.
  * Q37 (Unit 6: Test and Measurement in Sports): Explain the administration and scoring of Rikli and Jones Senior Citizen Fitness Test (detailing at least 5 test items) OR SAI Khelo India Fitness Test battery for 9–18 years.
- Set "marks": 5, "type": "la", "choices": null.

======================================================================
${solutionDirective}
======================================================================

--- JSON SCHEMA FORMAT ---
Output strictly a valid JSON object matching the following structure. Do not wrap in markdown fences:
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions (1 Mark each, Q1 to Q18 - All questions are compulsory)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [Physical Education MCQ text...]",
          "marks": 1,
          "type": "mcq",
          "choices": ["(A) Choice 1", "(B) Choice 2", "(C) Choice 3", "(D) Choice 4"],
          "orQuestion": null,
          "solution": "(A) Choice 1 - [Detailed scientific/factual explanation]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Very Short Answer Type Questions (2 Marks each, Q19 to Q24 - Attempt any 5 questions, 60–90 words)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q19",
          "text": "19. [2-Mark Very Short Answer Question]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "Marking scheme: [1 Mark for point 1, 1 Mark for point 2]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer Type Questions (3 Marks each, Q25 to Q30 - Attempt any 5 questions, 100–150 words)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q25",
          "text": "25. [3-Mark Short Answer Question]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "Marking scheme: [1 Mark each for 3 distinct points with explanation]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Case-Based / Competency-Based Questions (4 Marks each, Q31 to Q33 - All questions are compulsory)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q31",
          "text": "31. Read the passage given below and answer the questions that follow:\\n\\n[Case study scenario about tournament management / fixtures...]\\n\\n(31.1) [Sub-question 1] (1 Mark)\\n(31.2) [Sub-question 2] (1 Mark)\\n(31.3) [Sub-question 3] (1 Mark)\\n(31.4) [Sub-question 4] (1 Mark)\\nOR\\n[Alternative Sub-question 4] (1 Mark)",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(31.1) [1 Mark answer]\\n(31.2) [1 Mark answer]\\n(31.3) [1 Mark answer]\\n(31.4) [1 Mark answer with explanation]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Long Answer Type Questions (5 Marks each, Q34 to Q37 - Attempt any 3 questions, 200–300 words)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q34",
          "text": "34. [5-Mark Comprehensive Long Answer Question]",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Point-wise marking breakdown: [1 Mark for definition/classification, 2 Marks for anatomical analysis, 2 Marks for sporting applications]",
          "orSolution": null
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 80-Mark, 3-Section, 39-Question examination paper prompt for CBSE Class 10 Science (Subject Code 086).
 * Follows the official CBSE 2026-27 design and deterministic question paper structure:
 * Total Marks: 80 | Time Allowed: 3 Hours | Total Questions: 39 | Total Sections: 3
 * - Section A — Biology: Questions 1 to 16 = 30 Marks
 *     * Q1–Q7: Objective MCQs (7 x 1 = 7 Marks, including visual/diagram MCQ with text-based alternative for visually impaired)
 *     * Q8–Q9: Assertion–Reasoning Questions (2 x 1 = 2 Marks with standard options A, B, C, D)
 *     * Q10: Two-part question A + B (2 Marks)
 *     * Q11: Complete Option A OR B question (2 Marks)
 *     * Q12: Direct Short Answer question (2 Marks)
 *     * Q13: Explanation / Process / Conceptual question (3 Marks)
 *     * Q14: Multi-subpart question A + B + C (3 Marks)
 *     * Q15: Case/Stimulus/Application question A(1) + B(1) + [C(2) OR D(2)] = 4 Marks
 *     * Q16: Complete Option A (I, II) OR Option B (I, II) = 5 Marks (with text-based alternative for visually impaired)
 * - Section B — Chemistry: Questions 17 to 29 = 25 Marks
 *     * Q17–Q23: Objective MCQs (7 x 1 = 7 Marks)
 *     * Q24: Assertion–Reasoning Question (1 Mark with standard options A, B, C, D)
 *     * Q25: Conceptual / Explanatory question (2 Marks)
 *     * Q26: Complete Option A ((i),(ii),(iii)) OR Option B ((i),(ii)) = 3 Marks (with visually impaired alternative)
 *     * Q27: Three-part reasoning question Give reason for A, B, C (3 Marks)
 *     * Q28: Case/Stimulus/Experiment question A(1) + B(1) + [C(2) OR D(2)] = 4 Marks
 *     * Q29: Complete Option A (I, II) OR Option B (I, II) = 5 Marks
 * - Section C — Physics: Questions 30 to 39 = 25 Marks
 *     * Q30: Objective MCQ (1 Mark)
 *     * Q31: Numerical / Conceptual MCQ (1 Mark)
 *     * Q32: Assertion–Reasoning Question (1 Mark with standard options A, B, C, D)
 *     * Q33: Two-part question A + B (2 Marks)
 *     * Q34: Complete Option A (I, II) OR Option B (I, II) = 2 Marks
 *     * Q35: Numerical / Diagram-based question A + B + C (3 Marks, with text alternative for visually impaired)
 *     * Q36: Two-part question A + B (3 Marks)
 *     * Q37: Circuit / Diagram / Numerical question A + B (3 Marks, with text alternative for visually impaired)
 *     * Q38: Case/Stimulus/Application question A(1) + B(1) + [C(2) OR D(2)] = 4 Marks (with text alternative for visually impaired)
 *     * Q39: Complete Option A (I, II, III, IV) OR Option B (I, II, III, IV) = 5 Marks (with text-based alternative for visually impaired)
 * Total: 30 + 25 + 25 = 80 Marks (39 Questions total).
 */
function buildClass10ScienceFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED CHAPTER FOCUS ---
When generating questions across the three sections, strictly prioritize these selected chapters/topics chosen by the user:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated questions originate strictly from these chosen chapters while maintaining the component structure.`
      : `--- FULL SYLLABUS COVERAGE (3-COMPONENT BALANCE: BIOLOGY 30M, CHEMISTRY 25M, PHYSICS 25M) ---
Cover all prescribed chapters across Biology, Chemistry, and Physics in strict accordance with the official CBSE curriculum.`;

  return `
You are a Senior CBSE Examination Paper Setter and Chief Examiner for Class 10 Science (Subject Code 086) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 10 Science Question Paper for Session 2026–27.

Subject: Science (Subject Code 086)
Class: Class 10 (Class X)
Session: 2026–27
Maximum Marks: 80
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Total Questions: Exactly 39
Total Sections: Exactly 3

======================================================================
MANDATORY FRONT PAGE & GENERAL INSTRUCTIONS SPECIFICATION
======================================================================
SCIENCE – CODE NO. 086
SAMPLE QUESTION PAPER
CLASS – X (2026–27)

Max. Marks: 80                         Time Allowed: 3 hours

General Instructions:
(i) This question paper consists of 39 questions in 3 sections.
    Section A is Biology, Section B is Chemistry and Section C is Physics.
(ii) All questions are compulsory. However, an internal choice is provided in some questions. A student is expected to attempt only one of the alternatives in these questions.
(iii) Section A consists of Biology carrying 30 marks (Questions 1 to 16).
(iv) Section B consists of Chemistry carrying 25 marks (Questions 17 to 29).
(v) Section C consists of Physics carrying 25 marks (Questions 30 to 39).

======================================================================
CORE ARCHITECTURAL RULE — STRICTLY DETERMINISTIC QUESTION SLOTS
======================================================================
DO NOT DECIDE OR ALTER THE PAPER STRUCTURE DYNAMICALLY!
The paper structure is 100% PREDEFINED into exactly 39 numbered structural slots across 3 sections.
The application controls the paper structure, question count (39), section arrangement (Biology -> Chemistry -> Physics), question numbers (1 to 39), marks (80), and choice formats.
You MUST generate question content ONLY inside these predefined structural slots:

- SECTION A — BIOLOGY: Questions 1 to 16 = Exactly 30 Marks
  Q1 to Q7:   7 x 1 = 7 Marks (Objective MCQs)
  Q8 to Q9:   2 x 1 = 2 Marks (Assertion–Reason)
  Q10:        2 Marks (Two-part question A + B)
  Q11:        2 Marks (Complete Option A OR Option B)
  Q12:        2 Marks (Direct Short Answer)
  Q13:        3 Marks (Explanation / Process / Conceptual)
  Q14:        3 Marks (Multi-subpart A + B + C)
  Q15:        4 Marks (Case / Stimulus / Application: A(1) + B(1) + [C(2) OR D(2)])
  Q16:        5 Marks (Complete Option A (I, II) OR Option B (I, II))
  Section Total = 7 + 2 + 2 + 2 + 2 + 3 + 3 + 4 + 5 = 30 MARKS.

- SECTION B — CHEMISTRY: Questions 17 to 29 = Exactly 25 Marks
  Q17 to Q23: 7 x 1 = 7 Marks (Objective MCQs)
  Q24:        1 Mark (Assertion–Reason)
  Q25:        2 Marks (Conceptual / Explanatory Short Answer)
  Q26:        3 Marks (Complete Option A ((i),(ii),(iii)) OR Option B ((i),(ii)))
  Q27:        3 Marks (Three-part reasoning Give reason for A, B, C)
  Q28:        4 Marks (Case / Experiment / Application: A(1) + B(1) + [C(2) OR D(2)])
  Q29:        5 Marks (Complete Option A (I, II) OR Option B (I, II))
  Section Total = 7 + 1 + 2 + 3 + 3 + 4 + 5 = 25 MARKS.

- SECTION C — PHYSICS: Questions 30 to 39 = Exactly 25 Marks
  Q30:        1 Mark (Objective MCQ)
  Q31:        1 Mark (Numerical / Conceptual MCQ)
  Q32:        1 Mark (Assertion–Reason)
  Q33:        2 Marks (Two-part question A + B)
  Q34:        2 Marks (Complete Option A (I, II) OR Option B (I, II))
  Q35:        3 Marks (Numerical / Diagram-based: A + B + C)
  Q36:        3 Marks (Two-part question A + B)
  Q37:        3 Marks (Circuit / Diagram / Numerical: A + B)
  Q38:        4 Marks (Case / Stimulus / Application: A(1) + B(1) + [C(2) OR D(2)])
  Q39:        5 Marks (Complete Option A (I, II, III, IV) OR Option B (I, II, III, IV))
  Section Total = 2 + 1 + 2 + 2 + 3 + 3 + 3 + 4 + 5 = 25 MARKS.

OVERALL TOTAL: 30 + 25 + 25 = EXACTLY 80 MARKS | EXACTLY 39 QUESTIONS.

======================================================================
OFFICIAL SYLLABUS BOUNDARIES & PRESCRIBED NCERT TOPICS
======================================================================
1. BIOLOGY (Unit II: World of Living - 25 Marks & Unit V: Natural Resources - 05 Marks = 30 Marks):
   - Life Processes: Nutrition (autotrophic & heterotrophic, stomata, human digestive system), respiration (aerobic & anaerobic, ATP, human respiratory system), transport (circulatory system in humans, blood, lymph, heart, transport of water and food in plants - xylem & phloem) and excretion (human excretory system, nephron structure, excretion in plants).
   - Control and Coordination: Tropic movements in plants (phototropism, geotropism, hydrotropism, thigmotropism, chemotropism); Plant hormones (auxin, gibberellin, cytokinin, abscisic acid); Animal nervous system, reflex arc, reflex action; Endocrine glands and animal hormones (adrenaline, thyroxine, growth hormone, insulin, testosterone, estrogen).
   - How do Organisms Reproduce?: Asexual reproduction (fission, fragmentation, regeneration, budding, vegetative propagation, spore formation); Sexual reproduction in flowering plants (pollination & fertilization); Human male and female reproductive systems; Reproductive health, contraception methods, safe sex vs STDs/HIV.
   - Heredity: Mendel's laws of inheritance (monohybrid & dihybrid cross, phenotype & genotype ratios); Sex determination in human beings (XX and XY chromosomes).
   - STRICT EXCLUSIONS: Evolution; evolution and classification; and evolution equated with progress are strictly EXCLUDED.
   - Our Environment (Unit V - 5 Marks): Ecosystem components (biotic & abiotic), food chains, food webs, trophic levels, 10% law of energy flow, biological magnification, ozone layer depletion (CFCs, Montreal Protocol), biodegradable vs non-biodegradable waste management.
   - STRICT EXCLUSION: "Management of Natural Resources" will NOT be assessed in year-end examination.

2. CHEMISTRY (Unit I: Chemical Substances - Nature and Behaviour = 25 Marks):
   - Chemical Reactions and Equations: Chemical equation, balanced equations, types of reactions: combination, decomposition (thermal, electrolytic, photolytic), displacement, double displacement, precipitation, endothermic and exothermic reactions, redox reactions (oxidation & reduction).
   - Acids, Bases and Salts: Definitions in terms of H+ and OH- ions, general properties, neutralization, pH scale concept and applications in everyday life; Preparation, properties and uses of Sodium Hydroxide (chlor-alkali process), Bleaching powder, Baking soda, Washing soda, and Plaster of Paris (water of crystallization).
   - Metals and Non-Metals: Physical & chemical properties of metals and non-metals; Reactivity series; Formation and properties of ionic compounds; Basic metallurgical processes (roasting, calcination, reduction, electrolytic refining); Corrosion and its prevention (galvanization, alloying).
   - Carbon and its Compounds: Covalent bonding in carbon (tetravalency & catenation); Homologous series; Functional groups (halogens, alcohol, ketones, aldehydes, alkanes, alkenes, alkynes); Saturated vs unsaturated hydrocarbons; Chemical properties (combustion, oxidation, addition, substitution); Properties and reactions of Ethanol and Ethanoic acid (esterification, saponification); Soaps and detergents (micelle structure and cleansing action).

3. PHYSICS (Unit III: Natural Phenomena - 12 Marks & Unit IV: Effects of Current - 13 Marks = 25 Marks):
   - Light – Reflection and Refraction: Spherical mirrors (concave and convex), focal length, mirror formula, magnification. Laws of refraction, refractive index. Spherical lenses, lens formula, magnification, power of a lens (dioptre).
   - The Human Eye and the Colourful World: Functioning of eye lens, defects of vision (myopia, hypermetropia, presbyopia) and corrections. Refraction through glass prism, dispersion of white light, atmospheric refraction (twinkling of stars, advance sunrise), scattering of light (Tyndall effect, blue colour of sky).
   - STRICT EXCLUSION: Colour of the sun at sunrise and sunset is EXCLUDED.
   - Electricity: Electric current, potential difference, Ohm's law, resistance, resistivity, factors affecting resistance. Series and parallel combination of resistors and applications. Heating effect of electric current (Joule's law of heating), electric power (P = VI = I^2*R = V^2/R), commercial unit of energy (kWh).
   - Magnetic Effects of Electric Current: Magnetic field, field lines, field due to straight conductor, circular coil, and solenoid. Force on current-carrying conductor in magnetic field, Fleming's Left-Hand Rule. Electric motor principles, AC vs DC, domestic electric circuits (live, neutral, earth wires, fuse, overloading, short circuit).

${targetChaptersDirective}

======================================================================
DETAILED QUESTION-WISE ARCHITECTURE & SPECIFICATIONS
======================================================================

--- SECTION A — BIOLOGY (Q1 to Q16 = 30 Marks) ---
Q1: 1-mark objective MCQ on Biology concepts.
Q2: 1-mark visual/diagram/experimental MCQ on Biology. Must include descriptive figure/setup context AND provide the mandatory text-based alternative for visually impaired students.
Q3 to Q7: 1-mark objective MCQs on Biology concepts, experiments, or daily life applications.
ASSERTION–REASON BLOCK BEFORE Q8 & Q9:
Use the standard CBSE instructions:
"The following two questions consist of two statements – Assertion (A) and Reason (R). Answer these questions by selecting the appropriate option given below:
A. Both A and R are true, and R is the correct explanation of A.
B. Both A and R are true, and R is not the correct explanation of A.
C. A is true but R is false.
D. A is false but R is true."
Q8: 1-mark Assertion–Reason question on Biology.
Q9: 1-mark Assertion–Reason question on Biology.
Q10: 2-mark two-part question (Common introductory question/situation followed by sub-parts A and B, total 2 marks).
Q11: 2-mark complete internal-choice question:
"Attempt either option A or B.
A. [Biology Question]
OR
B. [Alternative Biology Question]"
Student attempts only one complete option (Option A OR Option B). Set option A in "text" and option B in "orQuestion".
Q12: 2-mark direct short-answer question on Biology.
Q13: 3-mark explanation / process / conceptual question on Biology.
Q14: 3-mark multi-subpart question on Biology: Case / situation / diagram / stimulus followed by three separately labelled sub-parts: A, B, C (Total 3 marks).
Q15: 4-mark case / stimulus / application-based question on Biology:
Detailed experimental or real-world situation followed by:
A. [Sub-question] (1 Mark)
B. [Sub-question] (1 Mark)
Attempt either sub-part C or D:
C. [Sub-question] (2 Marks)
OR
D. [Alternative sub-question] (2 Marks)
Total = 4 Marks (A=1, B=1, C or D=2).
Q16: 5-mark complete internal-choice question on Biology:
"Attempt either option A or B.
A. [Diagram / case / experiment]
   I. [Sub-question]
   II. [Sub-question]
OR
B. [Alternative diagram / case / experiment]
   I. [Sub-question]
   II. [Sub-question]"
Where visual/diagram is involved, provide the text-based version:
"For visually impaired students:
A.
I. [Text-based alternative]
II. [Text-based alternative]
OR
B.
I. [Text-based alternative]
II. [Text-based alternative]"
Set Option A in "text" and Option B in "orQuestion".

--- SECTION B — CHEMISTRY (Q17 to Q29 = 25 Marks) ---
Q17 to Q23: 1-mark objective MCQs on Chemistry (Chemical reactions, acids/bases/salts, metals/non-metals, carbon compounds).
ASSERTION–REASON BLOCK BEFORE Q24:
Standard CBSE instructions:
"The following question consists of two statements – Assertion (A) and Reason (R). Answer this question by selecting the appropriate option given below:
A. Both A and R are true, and R is the correct explanation of A.
B. Both A and R are true, and R is not the correct explanation of A.
C. A is true but R is false.
D. A is false but R is true."
Q24: 1-mark Assertion–Reason question on Chemistry.
Q25: 2-mark conceptual / explanatory short-answer question on Chemistry.
Q26: 3-mark complete Option A OR Option B question on Chemistry:
"Attempt either option A or B.
A. [Case / question]
   (i) [Sub-question]
   (ii) [Sub-question]
   (iii) [Sub-question]
OR
B. [Alternative case / question]
   (i) [Sub-question]
   (ii) [Sub-question]"
(If visual/diagram is involved, provide corresponding visually impaired text-based alternative). Set Option A in "text" and Option B in "orQuestion".
Q27: 3-mark three-part reasoning question on Chemistry:
"Give reason for the following:
A. [Reason-based question]
B. [Reason-based question]
C. [Reason-based question]"
Total = 3 Marks.
Q28: 4-mark case / stimulus + experiment / application question on Chemistry:
Detailed experimental or industrial setup context followed by:
A. [Question] (1 Mark)
B. [Question] (1 Mark)
Attempt either sub-part C or D:
C. [Question] (2 Marks)
OR
D. [Alternative question] (2 Marks)
Total = 4 Marks (A=1, B=1, C or D=2).
Q29: 5-mark complete internal-choice question on Chemistry:
"Attempt either option A or B.
A.
   I. [Sub-question]
   II. [Sub-question]
OR
B.
   I. [Sub-question]
   II. [Sub-question]"
Set Option A in "text" and Option B in "orQuestion".

--- SECTION C — PHYSICS (Q30 to Q39 = 25 Marks) ---
Q30: 1-mark objective MCQ on Physics (Light / Human eye / Electricity / Magnetism).
Q31: 1-mark numerical / conceptual MCQ on Physics.
ASSERTION–REASON BLOCK BEFORE Q32:
Standard CBSE instructions:
"The following question consists of two statements – Assertion (A) and Reason (R). Answer this question by selecting the appropriate option given below:
A. Both A and R are true, and R is the correct explanation of A.
B. Both A and R are true, and R is not the correct explanation of A.
C. A is true but R is false.
D. A is false but R is true."
Q32: 1-mark Assertion–Reason question on Physics.
Q33: 2-mark two-part question on Physics:
A. [Definition / law / concept]
B. [Definition / mathematical expression / concept]
Total = 2 Marks.
Q34: 2-mark complete Option A OR Option B question on Physics:
"Attempt either option A or B.
A.
   I. [Question]
   II. [Question]
OR
B.
   I. [Question]
   II. [Question]"
Set Option A in "text" and Option B in "orQuestion". Total = 2 Marks.
Q35: 3-mark numerical / diagram-based question on Physics (Light / Mirrors / Lenses):
A. [Part]
B. [Part]
C. [Part]
For visually impaired students (where ray diagram is required):
Provide text-based equivalent numerical/question testing the exact same formula and concept.
Total = 3 Marks.
Q36: 3-mark two-part question on Physics (Electricity / Magnetism):
A. [Concept / rule + explanation]
B. [Application / explanation]
Total = 3 Marks.
Q37: 3-mark circuit / diagram / numerical question on Physics:
Regular version: [Circuit diagram / numerical situation with resistors/cells] followed by A and B calculations.
For visually impaired students:
Provide text describing circuit parameters explicitly (e.g. "Three resistors of 4 ohms, 6 ohms, and 12 ohms are connected in parallel across a 6V battery...") followed by calculations A and B.
Total = 3 Marks.
Q38: 4-mark case / stimulus + internal choice question on Physics:
Real-world application or experimental case study followed by:
A. [Question] (1 Mark)
B. [Question] (1 Mark)
Attempt either sub-part C or D:
C. [Question] (2 Marks)
OR
D. [Alternative question] (2 Marks)
(For visually impaired students: provide text-based equivalent scenario).
Total = 4 Marks (A=1, B=1, C or D=2).
Q39: 5-mark complete Option A OR Option B long-answer question on Physics:
"Attempt either option A or B.
A.
   I. [Question]
   II. [Question]
   III. [Question]
   IV. [Question]
OR
B.
   I. [Question]
   II. [Question]
   III. [Question]
   IV. [Question]"
(For visually impaired students: provide equivalent text-based alternatives for sub-parts relying on ray diagrams or field patterns).
Set Option A in "text" and Option B in "orQuestion". Total = 5 Marks.

======================================================================
VISUALLY IMPAIRED ALTERNATIVE LOGIC
======================================================================
Where a question depends on a diagram, figure, circuit, experimental setup, or graph (specifically in Q2, Q16, Q26, Q35, Q37, Q38, Q39):
Include the explicit section within the question:
"For visually impaired students:
[Clear text-based equivalent question assessing the exact same concept, syllabus topic, and marks without visual dependence]"
Preserve the exact question number, marks, sub-parts, and difficulty.

======================================================================
INTERNAL CHOICE ARCHITECTURE
======================================================================
- TYPE 1: COMPLETE OPTION CHOICE (Q11, Q16, Q26, Q29, Q34, Q39)
  The student attempts Complete Option A OR Complete Option B.
  Place Option A in "text" and Option B in "orQuestion".
  In the answer key: place Option A solution in "solution" and Option B solution in "orSolution".
- TYPE 2: SUB-PART CHOICE (Q15, Q28, Q38)
  The student attempts sub-parts A (1M) and B (1M), and chooses either sub-part C (2M) OR D (2M).
  Keep the entire question inside "text", with "orQuestion": null.
  In the answer key: provide answers for A, B, and C OR D inside "solution", with "orSolution": null.

======================================================================
ASSERTION–REASON OPTIONS STANDARD
======================================================================
For Q8, Q9, Q24, and Q32, choices MUST be exactly:
[
  "Both A and R are true, and R is the correct explanation of A.",
  "Both A and R are true, and R is not the correct explanation of A.",
  "A is true but R is false.",
  "A is false but R is true."
]

======================================================================
CRITICAL JSON FORMAT RULES
======================================================================
1. Output MUST be strictly a single valid JSON object. Do not wrap in markdown fences.
2. In the "text" field, do NOT prepend leading question numbers like "1." or "Q1." as the application numbers them dynamically.
3. Escape all LaTeX/backslashes properly (\\\\Omega for Ω, \\\\mu for μ).
4. ${solutionDirective}

======================================================================
MANDATORY JSON OUTPUT SCHEMA
======================================================================
{
  "sections": [
    {
      "name": "Section A",
      "description": "Biology (Q1 to Q16 = 30 Marks)",
      "marksPerQuestion": 0,
      "questions": [
        { "id": "q1", "number": 1, "text": "[Biology MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(A) Option A - [Explanation]", "orSolution": null },
        { "id": "q2", "number": 2, "text": "[Biology Visual/Diagram MCQ text]\\n\\n[Figure/Setup description]\\n\\n(For visually impaired students:\\n[Text-based alternative question])", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(B) Option B - [Explanation]", "orSolution": null },
        { "id": "q3", "number": 3, "text": "[Biology MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(C) Option C - [Explanation]", "orSolution": null },
        { "id": "q4", "number": 4, "text": "[Biology MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(A) Option A - [Explanation]", "orSolution": null },
        { "id": "q5", "number": 5, "text": "[Biology MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(D) Option D - [Explanation]", "orSolution": null },
        { "id": "q6", "number": 6, "text": "[Biology MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(B) Option B - [Explanation]", "orSolution": null },
        { "id": "q7", "number": 7, "text": "[Biology MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(C) Option C - [Explanation]", "orSolution": null },
        { "id": "q8", "number": 8, "text": "The following question consists of two statements – Assertion (A) and Reason (R). Select the appropriate option:\\n\\nAssertion (A): [Biology Assertion Statement]\\nReason (R): [Biology Reason Statement]", "marks": 1, "type": "mcq", "choices": ["Both A and R are true, and R is the correct explanation of A.", "Both A and R are true, and R is not the correct explanation of A.", "A is true but R is false.", "A is false but R is true."], "orQuestion": null, "solution": "(A) Both A and R are true, and R is the correct explanation of A. - [Reasoning]", "orSolution": null },
        { "id": "q9", "number": 9, "text": "The following question consists of two statements – Assertion (A) and Reason (R). Select the appropriate option:\\n\\nAssertion (A): [Biology Assertion Statement]\\nReason (R): [Biology Reason Statement]", "marks": 1, "type": "mcq", "choices": ["Both A and R are true, and R is the correct explanation of A.", "Both A and R are true, and R is not the correct explanation of A.", "A is true but R is false.", "A is false but R is true."], "orQuestion": null, "solution": "(B) Both A and R are true, and R is not the correct explanation of A. - [Reasoning]", "orSolution": null },
        { "id": "q10", "number": 10, "text": "[Common introductory Biology context/question]\\n\\nA. [Sub-question A]\\n\\nB. [Sub-question B]", "marks": 2, "type": "vsa", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer]\\nB. [1-Mark answer]", "orSolution": null },
        { "id": "q11", "number": 11, "text": "Attempt either option A or B.\\n\\nA. [Biology Question]", "marks": 2, "type": "vsa", "choices": null, "orQuestion": "B. [Alternative Biology Question]", "solution": "Option A: [2-Mark point-wise marking scheme solution]", "orSolution": "Option B: [2-Mark point-wise marking scheme solution]" },
        { "id": "q12", "number": 12, "text": "[Direct Biology Short-Answer Question]", "marks": 2, "type": "vsa", "choices": null, "orQuestion": null, "solution": "[2-Mark point-wise marking scheme solution: 1 Mark each for two points]", "orSolution": null },
        { "id": "q13", "number": 13, "text": "[Explanation / Process / Conceptual Biology Question]", "marks": 3, "type": "sa", "choices": null, "orQuestion": null, "solution": "[Detailed 3-Mark solution according to CBSE marking scheme: 1 Mark each for 3 points/steps]", "orSolution": null },
        { "id": "q14", "number": 14, "text": "[Case / Situation / Diagram / Stimulus]\\n\\nA. [Sub-question A]\\n\\nB. [Sub-question B]\\n\\nC. [Sub-question C]", "marks": 3, "type": "sa", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer]\\nB. [1-Mark answer]\\nC. [1-Mark answer]", "orSolution": null },
        { "id": "q15", "number": 15, "text": "Read the following scenario and answer the questions that follow:\\n\\n[Detailed case / experimental / application-based Biology context]\\n\\nA. [Sub-question A] (1 Mark)\\n\\nB. [Sub-question B] (1 Mark)\\n\\nAttempt either sub-part C or D:\\n\\nC. [Sub-question C] (2 Marks)\\n\\nOR\\n\\nD. [Alternative sub-question D] (2 Marks)", "marks": 4, "type": "caseStudy", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer]\\nB. [1-Mark answer]\\nC. [2-Mark answer with explanation] OR D. [Alternative 2-Mark answer]", "orSolution": null },
        { "id": "q16", "number": 16, "text": "Attempt either option A or B.\\n\\nA. [Diagram / case / experiment]\\n   I. [Sub-question]\\n   II. [Sub-question]\\n\\n(For visually impaired students:\\nA.\\nI. [Text-based alternative]\\nII. [Text-based alternative])", "marks": 5, "type": "la", "choices": null, "orQuestion": "B. [Alternative diagram / case / experiment]\\n   I. [Sub-question]\\n   II. [Sub-question]\\n\\n(For visually impaired students:\\nB.\\nI. [Text-based alternative]\\nII. [Text-based alternative])", "solution": "Option A:\\nI. [Detailed solution with marks]\\nII. [Detailed solution with marks]", "orSolution": "Option B:\\nI. [Detailed solution with marks]\\nII. [Detailed solution with marks]" }
      ]
    },
    {
      "name": "Section B",
      "description": "Chemistry (Q17 to Q29 = 25 Marks)",
      "marksPerQuestion": 0,
      "questions": [
        { "id": "q17", "number": 17, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(A) Option A - [Explanation]", "orSolution": null },
        { "id": "q18", "number": 18, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(B) Option B - [Explanation]", "orSolution": null },
        { "id": "q19", "number": 19, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(C) Option C - [Explanation]", "orSolution": null },
        { "id": "q20", "number": 20, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(D) Option D - [Explanation]", "orSolution": null },
        { "id": "q21", "number": 21, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(A) Option A - [Explanation]", "orSolution": null },
        { "id": "q22", "number": 22, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(B) Option B - [Explanation]", "orSolution": null },
        { "id": "q23", "number": 23, "text": "[Chemistry MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(C) Option C - [Explanation]", "orSolution": null },
        { "id": "q24", "number": 24, "text": "The following question consists of two statements – Assertion (A) and Reason (R). Select the appropriate option:\\n\\nAssertion (A): [Chemistry Assertion Statement]\\nReason (R): [Chemistry Reason Statement]", "marks": 1, "type": "mcq", "choices": ["Both A and R are true, and R is the correct explanation of A.", "Both A and R are true, and R is not the correct explanation of A.", "A is true but R is false.", "A is false but R is true."], "orQuestion": null, "solution": "(A) Both A and R are true, and R is the correct explanation of A. - [Chemical explanation]", "orSolution": null },
        { "id": "q25", "number": 25, "text": "[Conceptual / Explanatory Chemistry Short-Answer Question]", "marks": 2, "type": "vsa", "choices": null, "orQuestion": null, "solution": "[2-Mark point-wise marking scheme solution with balanced chemical equation]", "orSolution": null },
        { "id": "q26", "number": 26, "text": "Attempt either option A or B.\\n\\nA. [Chemistry Case / Question]\\n   (i) [Sub-question (i)]\\n   (ii) [Sub-question (ii)]\\n   (iii) [Sub-question (iii)]", "marks": 3, "type": "sa", "choices": null, "orQuestion": "B. [Alternative Chemistry Case / Question]\\n   (i) [Sub-question (i)]\\n   (ii) [Sub-question (ii)]", "solution": "Option A:\\n(i) [1-Mark answer]\\n(ii) [1-Mark answer]\\n(iii) [1-Mark answer]", "orSolution": "Option B:\\n(i) [1.5-Mark answer]\\n(ii) [1.5-Mark answer]" },
        { "id": "q27", "number": 27, "text": "Give reason for the following:\\n\\nA. [Chemistry reason-based question A]\\n\\nB. [Chemistry reason-based question B]\\n\\nC. [Chemistry reason-based question C]", "marks": 3, "type": "sa", "choices": null, "orQuestion": null, "solution": "A. [1-Mark scientific reason]\\nB. [1-Mark scientific reason]\\nC. [1-Mark scientific reason]", "orSolution": null },
        { "id": "q28", "number": 28, "text": "Read the following experimental scenario and answer the questions that follow:\\n\\n[Detailed experimental / real-life Chemistry context, data, or reaction setup]\\n\\nA. [Question A] (1 Mark)\\n\\nB. [Question B] (1 Mark)\\n\\nAttempt either sub-part C or D:\\n\\nC. [Question C] (2 Marks)\\n\\nOR\\n\\nD. [Alternative Question D] (2 Marks)", "marks": 4, "type": "caseStudy", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer]\\nB. [1-Mark answer]\\nC. [2-Mark answer with chemical equation] OR D. [Alternative 2-Mark answer]", "orSolution": null },
        { "id": "q29", "number": 29, "text": "Attempt either option A or B.\\n\\nA.\\n   I. [Sub-question I]\\n   II. [Sub-question II]", "marks": 5, "type": "la", "choices": null, "orQuestion": "B.\\n   I. [Sub-question I]\\n   II. [Sub-question II]", "solution": "Option A:\\nI. [3-Mark detailed answer with balanced reaction]\\nII. [2-Mark detailed answer]", "orSolution": "Option B:\\nI. [3-Mark detailed answer with balanced reaction]\\nII. [2-Mark detailed answer]" }
      ]
    },
    {
      "name": "Section C",
      "description": "Physics (Q30 to Q39 = 25 Marks)",
      "marksPerQuestion": 0,
      "questions": [
        { "id": "q30", "number": 30, "text": "[Physics MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(A) Option A - [Explanation]", "orSolution": null },
        { "id": "q31", "number": 31, "text": "[Physics Numerical / Conceptual MCQ text]", "marks": 1, "type": "mcq", "choices": ["Option A", "Option B", "Option C", "Option D"], "orQuestion": null, "solution": "(B) Option B - [Formula and calculation: ...]", "orSolution": null },
        { "id": "q32", "number": 32, "text": "The following question consists of two statements – Assertion (A) and Reason (R). Select the appropriate option:\\n\\nAssertion (A): [Physics Assertion Statement]\\nReason (R): [Physics Reason Statement]", "marks": 1, "type": "mcq", "choices": ["Both A and R are true, and R is the correct explanation of A.", "Both A and R are true, and R is not the correct explanation of A.", "A is true but R is false.", "A is false but R is true."], "orQuestion": null, "solution": "(A) Both A and R are true, and R is the correct explanation of A. - [Physics reasoning]", "orSolution": null },
        { "id": "q33", "number": 33, "text": "A. [Physics Definition / Law / Concept]\\n\\nB. [Physics Mathematical expression / Concept]", "marks": 2, "type": "vsa", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer]\\nB. [1-Mark answer with formula]", "orSolution": null },
        { "id": "q34", "number": 34, "text": "Attempt either option A or B.\\n\\nA.\\n   I. [Physics Question I]\\n   II. [Physics Question II]", "marks": 2, "type": "vsa", "choices": null, "orQuestion": "B.\\n   I. [Physics Question I]\\n   II. [Physics Question II]", "solution": "Option A:\\nI. [1-Mark answer]\\nII. [1-Mark answer]", "orSolution": "Option B:\\nI. [1-Mark answer]\\nII. [1-Mark answer]" },
        { "id": "q35", "number": 35, "text": "[Physics numerical / ray diagram / experimental situation]\\n\\nA. [Part A]\\nB. [Part B]\\nC. [Part C]\\n\\n(For visually impaired students:\\n[Text-based equivalent numerical/question testing the same concept without diagram])", "marks": 3, "type": "sa", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer / formula]\\nB. [1-Mark calculation with unit]\\nC. [1-Mark final result with ray diagram / convention]", "orSolution": null },
        { "id": "q36", "number": 36, "text": "A. [Physics Concept / Rule + Explanation]\\n\\nB. [Physics Application / Explanation]", "marks": 3, "type": "sa", "choices": null, "orQuestion": null, "solution": "A. [1.5-Mark answer with statement of rule]\\nB. [1.5-Mark answer with application]", "orSolution": null },
        { "id": "q37", "number": 37, "text": "[Physics circuit diagram / numerical situation]\\n\\nA. [Calculation A]\\nB. [Calculation B]\\n\\n(For visually impaired students:\\n[Clear text describing circuit parameters without visual]\\nA. [Calculation A]\\nB. [Calculation B])", "marks": 3, "type": "sa", "choices": null, "orQuestion": null, "solution": "A. [1.5-Mark calculation with step-by-step formula and SI unit]\\nB. [1.5-Mark calculation with step-by-step formula and SI unit]", "orSolution": null },
        { "id": "q38", "number": 38, "text": "Read the following case and answer the questions that follow:\\n\\n[Detailed Physics real-life application / case study situation]\\n\\n(For visually impaired students: [Text-based scenario description])\\n\\nA. [Question A] (1 Mark)\\n\\nB. [Question B] (1 Mark)\\n\\nAttempt either sub-part C or D:\\n\\nC. [Question C] (2 Marks)\\n\\nOR\\n\\nD. [Alternative Question D] (2 Marks)", "marks": 4, "type": "caseStudy", "choices": null, "orQuestion": null, "solution": "A. [1-Mark answer]\\nB. [1-Mark answer]\\nC. [2-Mark calculation / working] OR D. [Alternative 2-Mark calculation / working]", "orSolution": null },
        { "id": "q39", "number": 39, "text": "Attempt either option A or B.\\n\\nA.\\n   I. [Sub-question I]\\n   II. [Sub-question II]\\n   III. [Sub-question III]\\n   IV. [Sub-question IV]\\n\\n(For visually impaired students:\\nA.\\nI. [Text-based alternative]\\nII. [Text-based alternative]\\nIII. [Text-based alternative]\\nIV. [Text-based alternative])", "marks": 5, "type": "la", "choices": null, "orQuestion": "B.\\n   I. [Sub-question I]\\n   II. [Sub-question II]\\n   III. [Sub-question III]\\n   IV. [Sub-question IV]\\n\\n(For visually impaired students:\\nB.\\nI. [Text-based alternative]\\nII. [Text-based alternative]\\nIII. [Text-based alternative]\\nIV. [Text-based alternative])", "solution": "Option A:\\nI. [1.5-Mark answer]\\nII. [1.5-Mark answer]\\nIII. [1-Mark answer]\\nIV. [1-Mark answer]", "orSolution": "Option B:\\nI. [1.5-Mark answer]\\nII. [1.5-Mark answer]\\nIII. [1-Mark answer]\\nIV. [1-Mark answer]" }
      ]
    }
  ]
}
`;
}

/**
 * Builds the official 70-Mark, 5-Section, 33-Question examination paper prompt for CBSE Class 12 Chemistry (Subject Code 043).
 * Follows the official CBSE 2024-25 / 2025-26 / 2026-27 design, question paper blueprint, and competency guidelines:
 * Total Marks: 70 | Time Allowed: 3 Hours
 * - Section A: Questions 1 to 16 (16 Objective Type Questions x 1 Mark = 16 Marks):
 *     * Q1 to Q12: Multiple Choice Questions (12 MCQs distributed across Physical, Inorganic, Organic)
 *     * Q13 to Q16: Assertion-Reasoning Questions (4 A-R Questions with standard options A, B, C, D)
 * - Section B: Questions 17 to 21 (5 Very Short Answer Questions x 2 Marks = 10 Marks, 30–50 words):
 *     * Questions across Physical, Inorganic, and Organic Chemistry with internal choice in 1-2 questions.
 * - Section C: Questions 22 to 28 (7 Short Answer Questions x 3 Marks = 21 Marks, 50–80 words):
 *     * Balanced across branches (Physical 2, Inorganic 2, Organic 3) with internal choices in 2 questions.
 * - Section D: Questions 29 to 30 (2 Case-Based / Source-Based Assessment Units x 4 Marks = 8 Marks):
 *     * Q29: Physical or Inorganic Chemistry Case Study (4 Marks) with sub-questions and internal choice
 *     * Q30: Organic Chemistry Case Study (4 Marks) with sub-questions and internal choice
 * - Section E: Questions 31 to 33 (3 Long Answer Questions x 5 Marks = 15 Marks, 80–120 words):
 *     * Q31: Physical Chemistry (5 Marks) with compulsory internal choice
 *     * Q32: Inorganic Chemistry (5 Marks) with compulsory internal choice
 *     * Q33: Organic Chemistry (5 Marks) with compulsory internal choice
 * Total: 16 + 10 + 21 + 8 + 15 = 70 Marks (33 Questions total).
 * Unit-wise distribution guideline: Solutions 7M, Electrochemistry 9M, Kinetics 7M, d- & f-Block 7M, Coordination 7M, Haloalkanes 6M, Alcohols 6M, Aldehydes 8M, Amines 6M, Biomolecules 7M = 70 Marks.
 */
function buildClass12ChemistryFullExamPrompt(config: PaperConfig, solutionDirective: string): string {
  const targetChaptersDirective =
    config.selectedChapters &&
    config.selectedChapters.length > 0 &&
    !config.selectedChapters.includes("all")
      ? `--- USER SELECTED CHAPTER/UNIT FOCUS ---
When generating questions across all sections, strictly prioritize these selected units/chapters chosen by the user:
${config.selectedChapters.map((c) => `- ${c}`).join("\n")}
Ensure all generated questions originate strictly from these chosen units while maintaining the 5-section paper blueprint.`
      : `--- FULL SYLLABUS COVERAGE (OFFICIAL 10 UNITS WEIGHTAGE) ---
Ensure comprehensive, balanced coverage across all 10 prescribed units in strict accordance with official CBSE blueprints:
- Unit 1: Solutions (7 Marks)
- Unit 2: Electrochemistry (9 Marks)
- Unit 3: Chemical Kinetics (7 Marks)
- Unit 4: d- and f-Block Elements (7 Marks)
- Unit 5: Coordination Compounds (7 Marks)
- Unit 6: Haloalkanes and Haloarenes (6 Marks)
- Unit 7: Alcohols, Phenols and Ethers (6 Marks)
- Unit 8: Aldehydes, Ketones and Carboxylic Acids (8 Marks)
- Unit 9: Amines (6 Marks)
- Unit 10: Biomolecules (7 Marks)
Total: 70 Marks Theory (plus 30 Marks Practical Assessment = 100 Marks).`;

  return `
You are a Senior CBSE Examination Paper Setter and Chief Examiner for Class 12 Chemistry (Subject Code 043) with 25+ years of experience.
Your task is to generate the COMPLETE, OFFICIAL, 100% CBSE-COMPLIANT Class 12 Chemistry Question Paper for 2026.

Total Marks: 70
Time Allowed: 3 Hours
Target Exam Type: ${config.examType}
Difficulty Level: ${config.difficulty}
Subject: Chemistry (Subject Code 043)
Class: Class 12 (Class XII)

======================================================================
MANDATORY COMPETENCY DISTRIBUTION (70 MARKS)
======================================================================
1. Remembering and Understanding (40% - 28 Marks): Definitions, statements of laws, nomenclature, direct conceptual recall.
2. Applying (30% - 21 Marks): Numericals, solving organic conversions, predicting products, calculating cell EMF, rate constants.
3. Analysing, Evaluating and Creating (30% - 21 Marks): Deducing reaction mechanisms, reasoning transition metal anomalies, interpreting case-based experimental data.

======================================================================
OFFICIAL SYLLABUS & UNIT WEIGHTAGE (70 MARKS)
======================================================================
1. PHYSICAL CHEMISTRY (23 Marks):
   - Unit 1: Solutions (7 Marks) - Types, Henry's law, Raoult's law, colligative properties (relative lowering of VP, elevation of boiling point Kb, depression of freezing point Kf, osmotic pressure), abnormal molar mass, van't Hoff factor (i).
   - Unit 2: Electrochemistry (9 Marks) - Galvanic cells, Nernst equation, Gibbs energy, molar conductivity, Kohlrausch's law, Faraday's laws of electrolysis, batteries, fuel cells, corrosion.
   - Unit 3: Chemical Kinetics (7 Marks) - Rate law, order and molecularity, integrated rate equations for zero and first order reactions, half-life, Arrhenius equation and activation energy (Ea), collision theory.

2. INORGANIC CHEMISTRY (14 Marks):
   - Unit 4: d- and f-Block Elements (7 Marks) - 3d series trends, oxidation states, standard electrode potentials, catalytic properties, interstitial compounds, K2Cr2O7 and KMnO4 preparation and oxidizing properties, Lanthanoids and Actinoids (lanthanoid contraction and consequences).
   - Unit 5: Coordination Compounds (7 Marks) - Werner's theory, IUPAC nomenclature, isomerism (structural and stereoisomerism), Valence Bond Theory (hybridisation, magnetic moment), Crystal Field Theory (octahedral and tetrahedral splitting, spectrochemical series, colour), metal carbonyl bonding.

3. ORGANIC CHEMISTRY (33 Marks):
   - Unit 6: Haloalkanes and Haloarenes (6 Marks) - Nomenclature, preparations, SN1 and SN2 mechanisms, stereochemistry, elimination reactions, organometallics (Grignard), electrophilic substitution in haloarenes, polyhalogen compounds.
   - Unit 7: Alcohols, Phenols and Ethers (6 Marks) - Nomenclature, preparations, acidity of phenols vs alcohols, Lucas test, dehydration mechanism, Kolbe's and Reimer-Tiemann reactions, Williamson ether synthesis, ether cleavage by HI.
   - Unit 8: Aldehydes, Ketones and Carboxylic Acids (8 Marks) - Carbonyl reactions: nucleophilic addition, Clemmensen and Wolff-Kishner reduction, Tollens' and Fehling's tests, haloform reaction, aldol condensation, Cannizzaro reaction, carboxylic acid acidity and HVZ reaction.
   - Unit 9: Amines (6 Marks) - Classification, basic character in gas and aqueous phases, Gabriel phthalimide and Hoffmann bromamide reactions, carbylamine test, Hinsberg's reagent test, diazonium salts preparation and synthetic applications (Sandmeyer, Gattermann, coupling reactions).
   - Unit 10: Biomolecules (7 Marks) - Carbohydrates (glucose structure proof, anomers, Haworth formulas, sucrose, starch, cellulose), proteins (amino acids, zwitterion, peptide bond, primary/secondary/tertiary structures, denaturation), enzymes, vitamins, nucleic acids (DNA/RNA, replication, transcription), hormones.

STRICTLY FORMATIVE-ONLY TOPICS (NEVER GENERATE BOARD EXAM QUESTIONS FROM THESE):
- Surface Chemistry
- General Principles and Processes of Isolation of Elements (Metallurgy)
- Polymers
- Chemistry in Everyday Life
(These four units are strictly for formative assessment and MUST NEVER appear in year-end board examination papers!)

${targetChaptersDirective}

======================================================================
MANDATORY 5-SECTION, 33-QUESTION BLUEPRINT STRUCTURE (EXACTLY 70 MARKS)
======================================================================
The paper MUST consist of exactly 5 sections (Section A to Section E) and exactly 33 sequentially numbered questions (Q1 to Q33):

----------------------------------------------------------------------
SECTION A: Objective Type Questions (Q1 to Q16) — 16 Questions x 1 Mark = 16 Marks
----------------------------------------------------------------------
- Exactly 16 questions carrying 1 mark each. All compulsory.
- Composition:
  * Questions 1 to 12: Multiple Choice Questions (12 MCQs)
    - Balanced distribution: Physical (~4 MCQs), Inorganic (~3 MCQs), Organic (~5 MCQs).
    - Provide exactly 4 options in the "choices" array: ["(A) ...", "(B) ...", "(C) ...", "(D) ..."].
  * Questions 13 to 16: Assertion-Reason Questions (4 A-R Questions)
    - Distributed across Physical, Inorganic, and Organic Chemistry.
    - Exactly 4 standard CBSE options in the "choices" array:
      "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A)."
      "(B) Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A)."
      "(C) Assertion (A) is true but Reason (R) is false."
      "(D) Assertion (A) is false but Reason (R) is true."

----------------------------------------------------------------------
SECTION B: Very Short Answer Type Questions (Q17 to Q21) — 5 Questions x 2 Marks = 10 Marks
----------------------------------------------------------------------
- Exactly 5 VSA questions carrying 2 marks each.
- Word limit: 30 to 50 words each.
- Subject distribution:
  * Q17: Physical Chemistry (Solutions / Electrochemistry / Chemical Kinetics)
  * Q18: Inorganic Chemistry (d & f Block Elements / Coordination Compounds)
  * Q19: Organic Chemistry (Haloalkanes / Alcohols / Phenols)
  * Q20: Organic Chemistry (Aldehydes, Ketones, Carboxylic Acids) with internal choice
  * Q21: Organic Chemistry (Amines / Biomolecules)
- Provide internal choice ("orQuestion" and "orSolution") in at least 1 question.

----------------------------------------------------------------------
SECTION C: Short Answer Type Questions (Q22 to Q28) — 7 Questions x 3 Marks = 21 Marks
----------------------------------------------------------------------
- Exactly 7 SA questions carrying 3 marks each.
- Word limit: 50 to 80 words each.
- Subject distribution:
  * Q22: Physical Chemistry (Numerical calculation on Colligative Properties or Nernst Equation)
  * Q23: Physical Chemistry (Chemical Kinetics / Rate Law / Arrhenius Equation) with internal choice
  * Q24: Inorganic Chemistry (d- and f-Block trends / Lanthanoid Contraction / Potassium Permanganate)
  * Q25: Inorganic Chemistry (Coordination Compounds - IUPAC nomenclature / CFT / Isomerism)
  * Q26: Organic Chemistry (Reaction mechanisms - SN1/SN2 or acid-catalysed dehydration, or chemical distinguishing tests)
  * Q27: Organic Chemistry (Conversions / Named Reactions / Aldol / Cannizzaro) with internal choice
  * Q28: Organic Chemistry (Biomolecules - Glucose reactions, peptide bonds, denaturation, vitamins, DNA/RNA)
- Provide internal choice ("orQuestion" and "orSolution") in at least 2 questions.

----------------------------------------------------------------------
SECTION D: Case-Based / Source-Based Assessment Units (Q29 to Q30) — 2 Questions x 4 Marks = 8 Marks
----------------------------------------------------------------------
- Exactly 2 Case-Based questions carrying 4 marks each.
- Each case consists of a factual/experimental scenario (approx. 80-120 words), followed by 3 sub-questions:
  * Sub-question (i): 1 Mark
  * Sub-question (ii): 1 Mark
  * Sub-question (iii): 2 Marks (with an internal choice: (iii) OR (iii))
- Allocation:
  * Q29: Physical or Inorganic Chemistry Case Study (e.g. Molar conductivity & Kohlrausch law, or Fuel cells & batteries, or Crystal field splitting and colour of transition metal complexes).
  * Q30: Organic Chemistry Case Study (e.g. Nucleophilic addition to carbonyls, acidity of carboxylic acids, nucleic acids DNA/RNA structures, or synthetic diazonium transformations).
- Sub-question (iii) of each case study MUST include an internal choice ("OR" alternative sub-question for 2 marks).

----------------------------------------------------------------------
SECTION E: Long Answer Type Questions (Q31 to Q33) — 3 Questions x 5 Marks = 15 Marks
----------------------------------------------------------------------
- Exactly 3 LA questions carrying 5 marks each.
- Word limit: 80 to 120 words each (structured into multi-parts, e.g. (a) 2 marks, (b) 3 marks, or (a) 3 marks, (b) 2 marks).
- EVERY QUESTION IN SECTION E MUST HAVE A COMPULSORY INTERNAL CHOICE ("orQuestion" and "orSolution") from the same branch:
  * Q31: Physical Chemistry (Solutions / Electrochemistry / Chemical Kinetics - combination of numerical calculation + conceptual theory) with compulsory INTERNAL CHOICE!
  * Q32: Inorganic Chemistry (d- and f-Block Elements / Coordination Compounds - reasoning on transition metal anomalies, electronic configurations, crystal field theory splitting, isomerism) with compulsory INTERNAL CHOICE!
  * Q33: Organic Chemistry (Aldehydes, Ketones, Carboxylic Acids / Haloalkanes / Alcohols / Amines - road-map/A,B,C identification problem, organic conversions, and chemical distinguishing tests) with compulsory INTERNAL CHOICE!

======================================================================
CRITICAL CHEMISTRY ACCURACY DIRECTIVES
======================================================================
1. Physical Chemistry:
   - All numerical calculations must have logically consistent data and realistic physical values.
   - Use correct formulas and standard SI units (g/mol, S cm^2 mol^-1, mol L^-1 s^-1, J/mol, etc.).
2. Inorganic Chemistry:
   - Correctly balance redox equations (e.g. MnO4- and Cr2O7 2- reactions in acidic medium).
   - Write accurate electronic configurations and IUPAC names for coordination complexes.
3. Organic Chemistry:
   - Chemical structures, IUPAC names, reagent conditions, and mechanisms must be 100% scientifically valid.
   - Named reactions and conversions must proceed via authentic, syllabus-compliant pathways.
4. JSON Escaping:
   - Double-escape all backslashes in mathematical symbols or chemical representations: write \\\\Delta for Delta, \\\\alpha for alpha, \\\\mu for mu, etc.
5. Strict Question Numbering:
   - Number questions sequentially from 1 to 33 across all 5 sections.
6. ${solutionDirective}

======================================================================
MANDATORY JSON OUTPUT FORMAT
======================================================================
Output MUST be strictly a single valid JSON object following this exact schema. Do NOT wrap the JSON in markdown fences, do NOT add introductory or concluding text:

{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions & Assertion-Reason (1 Mark each, Q1 to Q16 - All questions compulsory)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [Physical/Inorganic/Organic MCQ text]",
          "marks": 1,
          "type": "mcq",
          "choices": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
          "orQuestion": null,
          "solution": "(A) Option 1 - [Reasoning/explanation]",
          "orSolution": null
        },
        ...
        {
          "id": "q13",
          "text": "13. Assertion (A): [Assertion text]\\nReason (R): [Reason text]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
            "(B) Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).",
            "(C) Assertion (A) is true but Reason (R) is false.",
            "(D) Assertion (A) is false but Reason (R) is true."
          ],
          "orQuestion": null,
          "solution": "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section B",
      "description": "Very Short Answer Type Questions (2 Marks each, Q17 to Q21 - 30 to 50 words)",
      "marksPerQuestion": 2,
      "questions": [
        {
          "id": "q17",
          "text": "17. [Physical Chemistry 2-Mark VSA Question]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Point-wise 2-Mark marking scheme answer]",
          "orSolution": null
        },
        ...
        {
          "id": "q20",
          "text": "20. [Organic Chemistry 2-Mark VSA Question with Internal Choice]",
          "marks": 2,
          "type": "vsa",
          "choices": null,
          "orQuestion": "[Alternative Organic Chemistry 2-Mark VSA Question]",
          "solution": "[Solution for main question: 1 Mark per point]",
          "orSolution": "[Solution for alternative question: 1 Mark per point]"
        }
      ]
    },
    {
      "name": "Section C",
      "description": "Short Answer Type Questions (3 Marks each, Q22 to Q28 - 50 to 80 words)",
      "marksPerQuestion": 3,
      "questions": [
        {
          "id": "q22",
          "text": "22. [Physical Chemistry 3-Mark Numerical/Conceptual Question]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "[Detailed 3-Mark step-by-step solution: 1M formula, 1M substitution, 1M final answer with unit]",
          "orSolution": null
        },
        ...
        {
          "id": "q27",
          "text": "27. [Organic Chemistry 3-Mark Question with Internal Choice]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative Organic Chemistry 3-Mark Question]",
          "solution": "[Detailed 3-Mark solution]",
          "orSolution": "[Detailed 3-Mark solution for alternative]"
        }
      ]
    },
    {
      "name": "Section D",
      "description": "Case-Based / Source-Based Assessment Units (4 Marks each, Q29 to Q30 - All questions compulsory with internal choice in sub-question iii)",
      "marksPerQuestion": 4,
      "questions": [
        {
          "id": "q29",
          "text": "29. Read the following source and answer the questions that follow:\\n\\n[Authentic Physical or Inorganic Chemistry experimental/data passage, approx 80-120 words]\\n\\n(i) [Sub-question (i)] (1 Mark)\\n(ii) [Sub-question (ii)] (1 Mark)\\n(iii) [Sub-question (iii)] (2 Marks)\\nOR\\n[Alternative Sub-question (iii)] (2 Marks)",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1-Mark answer]\\n(ii) [1-Mark answer]\\n(iii) [2-Mark answer with explanation] OR [Alternative 2-Mark answer]",
          "orSolution": null
        },
        {
          "id": "q30",
          "text": "30. Read the following source and answer the questions that follow:\\n\\n[Authentic Organic Chemistry reaction context or biochemical passage, approx 80-120 words]\\n\\n(i) [Sub-question (i)] (1 Mark)\\n(ii) [Sub-question (ii)] (1 Mark)\\n(iii) [Sub-question (iii)] (2 Marks)\\nOR\\n[Alternative Sub-question (iii)] (2 Marks)",
          "marks": 4,
          "type": "caseStudy",
          "choices": null,
          "orQuestion": null,
          "solution": "(i) [1-Mark answer]\\n(ii) [1-Mark answer]\\n(iii) [2-Mark answer with explanation] OR [Alternative 2-Mark answer]",
          "orSolution": null
        }
      ]
    },
    {
      "name": "Section E",
      "description": "Long Answer Type Questions (5 Marks each, Q31 to Q33 - 80 to 120 words, with compulsory internal choice in each question)",
      "marksPerQuestion": 5,
      "questions": [
        {
          "id": "q31",
          "text": "31. (a) [Physical Chemistry sub-part (a) - Conceptual/Theory] (3 Marks)\\n(b) [Physical Chemistry sub-part (b) - Numerical calculation] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Physical Chemistry sub-part (a)] (3 Marks)\\n(b) [Alternative Physical Chemistry sub-part (b)] (2 Marks)",
          "solution": "Marking Scheme Breakdown:\\n(a) [Detailed 3-Mark answer]\\n(b) [Step-by-step 2-Mark numerical calculation with formula and unit]",
          "orSolution": "Marking Scheme Breakdown for Alternative:\\n(a) [Detailed 3-Mark answer]\\n(b) [Detailed 2-Mark answer]"
        },
        {
          "id": "q32",
          "text": "32. (a) [Inorganic Chemistry sub-part (a) - Transition elements/CFT reasoning] (3 Marks)\\n(b) [Inorganic Chemistry sub-part (b) - Isomerism/balanced equation] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Inorganic Chemistry sub-part (a)] (3 Marks)\\n(b) [Alternative Inorganic Chemistry sub-part (b)] (2 Marks)",
          "solution": "Marking Scheme Breakdown:\\n(a) [Detailed 3-Mark answer]\\n(b) [Detailed 2-Mark answer]",
          "orSolution": "Marking Scheme Breakdown for Alternative:\\n(a) [Detailed 3-Mark answer]\\n(b) [Detailed 2-Mark answer]"
        },
        {
          "id": "q33",
          "text": "33. (a) [Organic Chemistry sub-part (a) - Road-map/A,B,C identification problem] (3 Marks)\\n(b) [Organic Chemistry sub-part (b) - Chemical test to distinguish compounds] (2 Marks)",
          "marks": 5,
          "type": "la",
          "choices": null,
          "orQuestion": "(a) [Alternative Organic Chemistry sub-part (a) - Conversions/Mechanism] (3 Marks)\\n(b) [Alternative Organic Chemistry sub-part (b) - Named reaction/Reasoning] (2 Marks)",
          "solution": "Marking Scheme Breakdown:\\n(a) [Identification of A, B, C with chemical equations: 1 Mark each]\\n(b) [Chemical test with observation: 2 Marks]",
          "orSolution": "Marking Scheme Breakdown for Alternative:\\n(a) [Step-by-step organic conversion: 3 Marks]\\n(b) [Detailed explanation: 2 Marks]"
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds an authentic, official CBSE Class 12 Accountancy Board / Pre-Board / Sample / Half-Yearly Exam Prompt.
 * Theory Marks: 80 | Duration: 3 Hours | Total Questions: 34
 *
 * Course Structure (80 Marks Theory):
 * - Part A: Accounting for Partnership Firms and Companies (60 Marks, Q1 to Q26)
 *   * Unit 1: Accounting for Partnership Firms (36 Marks)
 *   * Unit 2: Accounting for Companies (24 Marks)
 * - Part B: Financial Statement Analysis (20 Marks, Q27 to Q34)
 *   * Unit 3: Analysis of Financial Statements (12 Marks)
 *   * Unit 4: Cash Flow Statement (8 Marks)
 *
 * Question Paper Typology (Image 1):
 * - Remembering and Understanding: 32 Marks (40%)
 * - Applying: 24 Marks (30%)
 * - Analysing, Evaluating and Creating: 24 Marks (30%)
 *
 * Questions Breakdown (34 Questions Total):
 * - 1-Mark Questions (20 Questions = 20 Marks): Q1-Q16 in Part A, Q27-Q30 in Part B (MCQs & Assertion-Reason)
 * - 3-Mark Questions (6 Questions = 18 Marks): Q17-Q20 in Part A, Q31-Q32 in Part B (Short Answer SA-I)
 * - 4-Mark Questions (3 Questions = 12 Marks): Q21-Q22 in Part A, Q33 in Part B (Short Answer SA-II)
 * - 6-Mark Questions (5 Questions = 30 Marks): Q23-Q26 in Part A, Q34 in Part B (Long Answer LA)
 * Internal Choices provided in at least 7 questions (3 in 3-mark, 2 in 4-mark, 3 in 6-mark).
 */
function buildClass12AccountancyFullExamPrompt(
  config: PaperConfig,
  solutionDirective: string
): string {
  const selectedChapters =
    config.selectedChapters && config.selectedChapters.length > 0
      ? config.selectedChapters.join(", ")
      : "All Prescribed Units & Chapters (Full Syllabus - Part A: Partnership & Companies; Part B: Financial Statement Analysis & Cash Flow Statement)";

  return `
You are a Senior CBSE Examination Paper Setter and Chief Moderator for Class 12 Accountancy (Subject Code: 055) with over 20 years of experience.
Your task is to generate an authentic, fully curriculum-compliant, and mathematically exact CBSE Class 12 Accountancy Question Paper (80 Marks, 3 Hours) strictly according to the latest CBSE Examination Blueprint and Course Structure.

TARGET SUBJECT: CBSE Class 12 Accountancy (Subject Code: 055)
EXAM TYPE: ${config.examType.toUpperCase().replace("_", " ")}
TARGET CHAPTERS / SYLLABUS:
${selectedChapters}

--- OFFICIAL COURSE STRUCTURE & PRESCRIBED UNITS (80 MARKS TOTAL) ---
PART A: ACCOUNTING FOR PARTNERSHIP FIRMS AND COMPANIES (60 MARKS - 150 PERIODS)
1. Unit 1: Accounting for Partnership Firms (36 Marks)
   - Partnership Fundamentals:
     * Features of Partnership, Partnership Deed, Provisions of the Indian Partnership Act 1932 in absence of deed.
     * Note: Interest on partner's loan is to be treated as a CHARGE AGAINST PROFITS (debited to P&L Account, not P&L Appropriation Account).
     * Fixed vs Fluctuating capital accounts. Preparation of Profit and Loss Appropriation Account: division of profit, guarantee of profits.
     * Past adjustments (relating to interest on capital, interest on drawing, salary, profit sharing ratio) using Statement Showing Adjustments.
     * Goodwill: Meaning, nature, factors affecting, valuation methods (Average profit, Super profit, Capitalisation). Adjusted through partners' capital/current accounts strictly as per AS 26.
   - Reconstitution & Dissolution of Partnership Firms:
     * Change in Profit Sharing Ratio: Sacrificing ratio, gaining ratio, revaluation of assets and reassessment of liabilities, treatment of reserves and accumulated profits/losses, Revaluation Account & Balance Sheet.
     * Admission of a Partner: New PSR, sacrificing ratio, treatment of goodwill as per AS 26, revaluation of assets/liabilities, reserves, adjustment of capital accounts, Balance Sheet.
     * Retirement & Death of a Partner: Gaining ratio, goodwill treatment as per AS 26, revaluation, accumulated reserves/profits, capital adjustments, Retiring Partner's Loan Account.
     * Deceased Partner: Calculation of deceased partner's share of profit till death (time or sales basis, via P&L Suspense A/c or gaining partners), preparation of Deceased Partner's Capital Account and his Executor's Account.
     * Dissolution of a Partnership Firm: Types of dissolution, settlement of accounts, preparation of Realisation Account, Partners' Capital Accounts, and Cash/Bank Account.
     * MANDATORY REALISATION RULES (CBSE OFFICIAL SYLLABUS NOTES):
       (i) If realised value of tangible assets is not given, realise at book value itself.
       (ii) If realised value of intangible assets is not given, realise at nil (zero value).
       (iii) In case realisation expenses are borne by a partner, clear indication must be given regarding payment.

2. Unit 2: Accounting for Companies (24 Marks)
   - Accounting for Share Capital:
     * Features and types of companies. Nature and types of share capital.
     * Issue and allotment of equity and preference shares: Over-subscription (pro-rata allotment) and under-subscription; issue at par and at premium; calls in advance and calls in arrears (excluding interest); issue for consideration other than cash.
     * Concept of Private Placement, Employee Stock Option Plan (ESOP), Sweat Equity.
     * Accounting treatment of forfeiture and re-issue of shares:
       - Forfeiture of shares issued at par and premium (premium received vs not received).
       - Reissue of forfeited shares at par, premium, or discount (maximum discount cannot exceed forfeited amount on those shares).
       - Transfer to Capital Reserve = (Amount forfeited on reissued shares - Discount allowed on reissue).
     * Disclosure of share capital in the Balance Sheet of a company as per Schedule III Part I of Companies Act, 2013 (Notes to Accounts: Authorised, Issued, Subscribed and fully paid-up, Subscribed but not fully paid-up, Less Calls-in-arrears, Add Share Forfeited Account).
   - Accounting for Debentures:
     * Meaning, types. Issue at par, premium, discount. Issue for consideration other than cash.
     * Issue of debentures with terms of redemption (different conditions: issued at par/discount/premium, redeemable at par/premium).
     * Debentures as collateral security (concept, balance sheet presentation, journal entries).
     * Interest on debentures (concept of TDS is excluded).
     * MANDATORY DEBENTURES RULE (AS 16 DIRECTIVE):
       Discount or loss on issue of debentures to be written off in the year debentures are allotted: FIRST from Securities Premium Reserve (if available) and then balance from Statement of Profit and Loss as Finance Cost (AS 16).

PART B: FINANCIAL STATEMENT ANALYSIS (20 MARKS)
3. Unit 3: Analysis of Financial Statements (12 Marks)
   - Financial Statements of a Company:
     * Meaning, nature, uses and importance. Statement of Profit and Loss and Balance Sheet in prescribed format with major headings and sub-headings as per Schedule III to Companies Act, 2013.
   - Tools of Financial Statement Analysis: Comparative Statements, Common Size Statements, Ratio Analysis, Cash Flow Analysis.
   - Accounting Ratios: Meaning, objectives, classification and computation:
     * Liquidity Ratios: Current Ratio (Current Assets / Current Liabilities) and Quick Ratio (Quick Assets / Current Liabilities).
     * Solvency Ratios: Debt to Equity Ratio, Total Assets to Debt Ratio, Proprietary Ratio, Interest Coverage Ratio (in times).
     * Activity / Turnover Ratios (in Times): Inventory Turnover Ratio, Trade Receivables Turnover Ratio, Trade Payables Turnover Ratio, Working Capital Turnover Ratio.
     * Profitability Ratios (in %): Gross Profit Ratio, Operating Ratio, Operating Profit Ratio, Net Profit Ratio, Return on Investment (ROI).

4. Unit 4: Cash Flow Statement (8 Marks)
   - Meaning, objectives, benefits, and preparation (Indirect Method only as per AS 3 Revised).
   - Cash flows from Operating Activities, Investing Activities, and Financing Activities.
   - Adjustments: Depreciation and amortization, profit/loss on sale of assets/investments, dividend (final proposed/paid and interim dividend), provision for tax and tax paid.
   - MANDATORY CASH FLOW RULES (CBSE OFFICIAL SYLLABUS NOTES):
     (i) Bank overdraft and cash credit are short-term borrowings under FINANCING ACTIVITIES.
     (ii) Current investments are Marketable Securities / Cash Equivalents unless specified otherwise.
     (iii) Proposed dividend of current year is ignored (contingent liability); only proposed dividend of previous year declared/paid is added in Operating and deducted in Financing.
     (iv) Interim dividend paid during the year is added back to Net Profit in Operating and deducted in Financing.

QUESTION PAPER TYPOLOGY & COMPETENCY DISTRIBUTION (80 MARKS TOTAL - IMAGE 1):
1. Remembering and Understanding (40% - 32 Marks): Recalling accounting terms, rules of partnership act, Schedule III headings, journal entry rules, ratio definitions, theory of debentures and shares.
2. Applying (30% - 24 Marks): Journal entries for issue/forfeiture/reissue of shares, issue of debentures with redemption terms, partnership revaluation/admission calculations, ratio computations, cash flow adjustments.
3. Analysing, Evaluating and Creating (30% - 24 Marks): Case-based partnership profit appropriation, past adjustments statements, pro-rata allotment tables, dissolution realisation accounts, comprehensive Cash Flow Statement preparation.

--- QUESTION PAPER STRUCTURE & SECTION ALLOCATION (34 QUESTIONS, 80 MARKS) ---
The question paper is divided into TWO PARTS:

PART A: Accounting for Partnership Firms and Companies (Questions 1 to 26 - 60 Marks)
- Questions 1 to 16: 16 Questions × 1 Mark = 16 Marks (14 MCQs + 2 Assertion-Reason Questions)
  * Q1: Partnership Deed & provisions in absence of deed (MCQ)
  * Q2: P&L Appropriation / Interest on drawings calculation (MCQ)
  * Q3: Goodwill calculation & valuation methods (MCQ)
  * Q4: Change in PSR / Sacrificing & Gaining ratio calculation (MCQ)
  * Q5: Admission of a partner / Hidden goodwill / New PSR (MCQ)
  * Q6: Retirement of a partner / Gaining ratio calculation (MCQ)
  * Q7: Death of a partner / Share of profit till death (MCQ)
  * Q8: Dissolution / Realisation account profit or loss / Tangible vs Intangible asset realization rule (MCQ)
  * Q9: Shares / Minimum subscription / Calls in advance / Calls in arrears (MCQ)
  * Q10: Shares / Pro-rata allotment / Application money adjustment (MCQ)
  * Q11: Shares / Forfeiture of shares issued at premium (MCQ)
  * Q12: Shares / Maximum discount on reissue of forfeited shares / Capital reserve (MCQ)
  * Q13: Debentures / Issue as collateral security / Debenture Suspense (MCQ)
  * Q14: Debentures / Writing off discount on issue as per AS 16 (MCQ)
  * Q15: Assertion-Reason on Partnership (e.g. Partner's loan is a charge against profit, AS 26 goodwill adjustment)
  * Q16: Assertion-Reason on Companies (e.g. Securities Premium utilization / forfeiture & reissue / ESOP)
- Questions 17 to 20: 4 Questions × 3 Marks = 12 Marks (Short Answer SA-I)
  * Q17: Partnership Fundamentals: Past Adjustments (Statement Showing Adjustments + single adjusting journal entry) OR Guarantee of Profits to a Partner (3 Marks) [internal choice provided]
  * Q18: Goodwill Valuation: Calculation of Goodwill by Super Profit Method or Capitalisation Method with adjustments for abnormal profits/losses (3 Marks)
  * Q19: Accounting for Debentures: Issue of Debentures for consideration other than cash OR Issue of Debentures as Collateral Security with extract of Balance Sheet (3 Marks) [internal choice provided]
  * Q20: Dissolution of Partnership Firm: 3 distinct journal entries for realization of assets, settlement of liabilities, or realization expenses borne by a partner (3 Marks)
- Questions 21 to 22: 2 Questions × 4 Marks = 8 Marks (Short Answer SA-II)
  * Q21: Accounting for Share Capital: Presentation of Share Capital in the Balance Sheet of a company as per Schedule III Part I of Companies Act, 2013 with complete Notes to Accounts (Authorised, Issued, Subscribed & fully paid-up, Subscribed but not fully paid-up, Less Calls-in-arrears, Add Forfeited shares) (4 Marks)
  * Q22: Death of a Partner: Preparation of Deceased Partner's Capital Account and his Executor's Account (incorporating share of goodwill as per AS 26, revaluation profit, interest on capital, and share of profit till death via P&L Suspense A/c) OR Retirement of a Partner (preparation of capital accounts and retiring partner's loan account) (4 Marks) [internal choice provided]
- Questions 23 to 26: 4 Questions × 6 Marks = 24 Marks (Long Answer LA)
  * Q23: Reconstitution of Partnership: Comprehensive Admission of a Partner (Revaluation Account, Partners' Capital Accounts, and Balance Sheet of reconstituted firm with capital adjustments) OR Comprehensive Retirement of a Partner (Revaluation Account, Partners' Capital Accounts, Retiring Partner's Loan Account, and Balance Sheet) (6 Marks) [internal choice provided]
  * Q24: Dissolution of a Partnership Firm: Comprehensive preparation of Realisation Account, Partners' Capital Accounts, and Cash/Bank Account, applying mandatory tangible asset (book value) and intangible asset (nil) realization rules (6 Marks)
  * Q25: Accounting for Share Capital: Comprehensive Pro-rata Allotment problem (e.g., Company invited applications for shares, oversubscription, pro-rata allotment, excess adjusted towards allotment, one shareholder fails to pay allotment and calls, shares forfeited, reissued at discount, transfer to Capital Reserve) with complete Journal Entries, Working Notes, and calculations OR Alternative Pro-rata problem with multiple categories of applicants (6 Marks) [internal choice provided]
  * Q26: Accounting for Debentures: Comprehensive Journal Entries for Issue of Debentures under three different redemption terms (e.g. issued at par redeemable at premium, issued at discount redeemable at premium, issued at premium redeemable at premium) and writing off Loss on Issue of Debentures as per AS 16 at year-end from Securities Premium and Statement of P&L OR Alternative Debentures problem (6 Marks) [internal choice provided]

PART B: Financial Statement Analysis (Questions 27 to 34 - 20 Marks)
- Questions 27 to 30: 4 Questions × 1 Mark = 4 Marks (3 MCQs + 1 Assertion-Reason Question)
  * Q27: Schedule III Balance Sheet major heads and sub-heads classification (MCQ)
  * Q28: Accounting Ratios: Effect of a transaction on Current Ratio / Quick Ratio (Increase, Decrease, No change) (MCQ)
  * Q29: Cash Flow Statement: Classification of cash flow activity (Operating / Investing / Financing) or treatment of bank overdraft / marketable securities (MCQ)
  * Q30: Assertion-Reason question on Financial Statement Analysis / Cash Flow Statement (MCQ)
- Questions 31 to 32: 2 Questions × 3 Marks = 6 Marks (Short Answer SA-I)
  * Q31: Schedule III Financial Statements: State the Major Head and Sub-head under which 6 specific items are presented in the Balance Sheet of a company as per Schedule III Part I of Companies Act, 2013 (0.5 Mark each = 3 Marks)
  * Q32: Accounting Ratios: Calculation of Operating Ratio and Operating Profit Ratio OR Solvency Ratios (Debt to Equity Ratio and Proprietary Ratio) (3 Marks) [internal choice provided]
- Question 33: 1 Question × 4 Marks = 4 Marks (Short Answer SA-II)
  * Q33: Comprehensive Accounting Ratios: Calculation of Inventory Turnover Ratio and Trade Receivables Turnover Ratio (or Return on Investment) from given financial data, with internal choice (Alternative Ratio problem) (4 Marks) [internal choice provided]
- Question 34: 1 Question × 6 Marks = 6 Marks (Long Answer LA)
  * Q34: Comprehensive Cash Flow Statement: Preparation of Cash Flow Statement strictly as per AS 3 (Revised) Indirect Method from given comparative Balance Sheets, Notes to Accounts, and additional information (depreciation on machinery, tax paid / provision for tax, sale of fixed assets/investments, proposed dividend of previous year / interim dividend), with internal choice (Alternative Cash Flow problem) (6 Marks) [internal choice provided]

--- CRITICAL ACCOUNTANCY ACCURACY & NUMERICAL INTEGRITY DIRECTIVES ---
1. Double-Entry Accuracy: Every journal entry MUST balance (Debit total = Credit total). Always include brief, clear narrations ("Being...").
2. Standard Ledger Accounts: Revaluation A/c, Realisation A/c, Partners' Capital A/cs, Cash/Bank A/c must have proper Dr. / Cr. and column headers.
3. Schedule III Compliance: Balance sheet disclosure of share capital must provide Notes to Accounts with Authorised, Issued, Subscribed & fully paid-up, Subscribed but not fully paid-up, Less Calls-in-arrears, Add Share forfeited a/c.
4. Mathematical & Data Consistency: Provide complete, logically consistent numbers. When calculating ratios or cash flow, all required balance sheet figures and adjustments must correlate perfectly.
5. ${solutionDirective}

--- STRICT JSON FORMATTING MANDATE ---
Output strictly a SINGLE valid JSON object matching the schema below.
Do NOT wrap the output in markdown code blocks (\`\`\`json). Output the raw JSON text directly.
Do NOT use invalid escape sequences. Always double-escape backslashes (\\\\).

{
  "sections": [
    {
      "name": "PART A",
      "description": "Accounting for Partnership Firms and Companies (Questions 1 to 26 - 60 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "text": "1. [Partnership Deed / Absence of deed MCQ text]",
          "marks": 1,
          "type": "mcq",
          "choices": ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
          "orQuestion": null,
          "solution": "(A) Option A - [Explanation/reasoning]",
          "orSolution": null
        },
        ...
        {
          "id": "q15",
          "text": "15. Assertion (A): [Assertion text regarding Partnership]\\nReason (R): [Reason text]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
            "(B) Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).",
            "(C) Assertion (A) is true but Reason (R) is false.",
            "(D) Assertion (A) is false but Reason (R) is true."
          ],
          "orQuestion": null,
          "solution": "(A) [Correct option with 1-2 sentence justification]",
          "orSolution": null
        },
        {
          "id": "q16",
          "text": "16. Assertion (A): [Assertion text regarding Company Accounts]\\nReason (R): [Reason text]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
            "(B) Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).",
            "(C) Assertion (A) is true but Reason (R) is false.",
            "(D) Assertion (A) is false but Reason (R) is true."
          ],
          "orQuestion": null,
          "solution": "(A) [Correct option with justification]",
          "orSolution": null
        },
        {
          "id": "q17",
          "text": "17. [Partnership Past Adjustment / Guarantee Question, 3 Marks]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative Guarantee / Past Adjustment Question, 3 Marks]",
          "solution": "Statement Showing Adjustments:\\n[Table]\\nAdjusting Journal Entry:\\n[Entry with narration]\\nMarking Scheme: [1.5M Table + 1.5M Journal Entry]",
          "orSolution": "[Detailed 3-Mark step-by-step solution for alternative question]"
        },
        ...
        {
          "id": "q21",
          "text": "21. [Share Capital Balance Sheet Disclosure Question as per Schedule III, 4 Marks]",
          "marks": 4,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "An Extract of Balance Sheet of Company as at ... :\\n[Balance sheet extract]\\nNotes to Accounts:\\n1. Share Capital:\\n   Authorised Capital ...\\n   Issued Capital ...\\n   Subscribed Capital ...\\nMarking Scheme: [1M Balance Sheet + 3M Notes to Accounts]",
          "orSolution": null
        },
        ...
        {
          "id": "q23",
          "text": "23. [Comprehensive Admission of Partner Question, 6 Marks]",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Comprehensive Retirement of Partner Question, 6 Marks]",
          "solution": "Dr. Revaluation Account Cr.:\\n[Full ledger]\\nDr. Partners' Capital Accounts Cr.:\\n[Full ledger]\\nBalance Sheet of new firm as at ... :\\n[Full balance sheet]\\nMarking Scheme: [2M Revaluation A/c + 2.5M Capital A/cs + 1.5M Balance Sheet]",
          "orSolution": "[Detailed 6-Mark solution for alternative retirement question with Revaluation, Capital, and Loan A/c]"
        },
        {
          "id": "q24",
          "text": "24. [Comprehensive Dissolution of Firm Question, 6 Marks]",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": null,
          "solution": "Dr. Realisation Account Cr.:\\n[Full ledger following tangible book value and intangible nil rule]\\nDr. Partners' Capital Accounts Cr.:\\n[Full ledger]\\nDr. Cash/Bank Account Cr.:\\n[Full ledger]\\nMarking Scheme: [3M Realisation A/c + 2M Capital A/cs + 1M Cash/Bank A/c]",
          "orSolution": null
        },
        {
          "id": "q25",
          "text": "25. [Comprehensive Pro-rata Allotment Share Capital Problem with Forfeiture & Reissue, 6 Marks]",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Comprehensive Pro-rata Allotment Problem, 6 Marks]",
          "solution": "Journal of Company Ltd.:\\n[Complete Journal entries with proper Date, Particulars, L.F., Debit ₹, Credit ₹ and narrations]\\nWorking Notes:\\n1. Table showing application money received and adjusted\\n2. Calls in arrears calculation on allotment\\n3. Forfeiture calculation\\n4. Capital Reserve calculation\\nMarking Scheme: [4M Journal Entries + 2M Working Notes]",
          "orSolution": "[Complete Journal entries and working notes for alternative pro-rata question]"
        },
        {
          "id": "q26",
          "text": "26. [Comprehensive Accounting for Debentures with terms of redemption and writing off loss as per AS 16, 6 Marks]",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Debentures Comprehensive Problem, 6 Marks]",
          "solution": "Journal Entries:\\n[Case (a) Issue entries: 2 Marks]\\n[Case (b) Issue entries: 2 Marks]\\n[Case (c) Issue entries and writing off loss from Securities Premium & Statement of P&L as per AS 16: 2 Marks]",
          "orSolution": "[Complete journal entries for alternative debentures question]"
        }
      ]
    },
    {
      "name": "PART B",
      "description": "Financial Statement Analysis (Questions 27 to 34 - 20 Marks)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q27",
          "text": "27. [Schedule III Major Head / Sub-head MCQ text]",
          "marks": 1,
          "type": "mcq",
          "choices": ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
          "orQuestion": null,
          "solution": "(A) Option A - [Explanation]",
          "orSolution": null
        },
        ...
        {
          "id": "q30",
          "text": "30. Assertion (A): [Assertion text regarding Cash Flow / Financial Statements]\\nReason (R): [Reason text]",
          "marks": 1,
          "type": "mcq",
          "choices": [
            "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
            "(B) Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).",
            "(C) Assertion (A) is true but Reason (R) is false.",
            "(D) Assertion (A) is false but Reason (R) is true."
          ],
          "orQuestion": null,
          "solution": "(A) [Correct option with explanation]",
          "orSolution": null
        },
        {
          "id": "q31",
          "text": "31. Under which Major Heads and Sub-heads will the following items be shown in the Balance Sheet of a company as per Schedule III Part I of the Companies Act, 2013?\\n(i) [Item 1]\\n(ii) [Item 2]\\n(iii) [Item 3]\\n(iv) [Item 4]\\n(v) [Item 5]\\n(vi) [Item 6]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": null,
          "solution": "Item | Major Head | Sub-head\\n(i) ... | ... | ...\\n(ii) ... | ... | ...\\n(iii) ... | ... | ...\\n(iv) ... | ... | ...\\n(v) ... | ... | ...\\n(vi) ... | ... | ...\\nMarking Scheme: [0.5 Mark for each correct item, total 3 Marks]",
          "orSolution": null
        },
        {
          "id": "q32",
          "text": "32. [Accounting Ratios Problem (e.g. Operating Ratio & Operating Profit Ratio), 3 Marks]",
          "marks": 3,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative Solvency Ratios Problem (e.g. Debt to Equity & Proprietary Ratio), 3 Marks]",
          "solution": "Formula & Calculation:\\n1. Operating Ratio = [(Cost of Revenue from Operations + Operating Expenses) / Revenue from Operations] * 100 = ...% [1.5 Marks]\\n2. Operating Profit Ratio = 100 - Operating Ratio = ...% [1.5 Marks]",
          "orSolution": "[Detailed 3-Mark solution for alternative ratios problem with formulas and steps]"
        },
        {
          "id": "q33",
          "text": "33. [Comprehensive Accounting Ratios Problem (e.g. Inventory Turnover Ratio & Trade Receivables Turnover Ratio / ROI), 4 Marks]",
          "marks": 4,
          "type": "sa",
          "choices": null,
          "orQuestion": "[Alternative Comprehensive Ratios Problem, 4 Marks]",
          "solution": "Step-by-step Formulas & Working:\\n1. Calculation of Cost of Revenue from Operations ...\\n2. Inventory Turnover Ratio = Cost of Revenue from Operations / Average Inventory = ... Times [2 Marks]\\n3. Trade Receivables Turnover Ratio = Net Credit Revenue from Operations / Average Trade Receivables = ... Times [2 Marks]",
          "orSolution": "[Detailed 4-Mark step-by-step solution for alternative question]"
        },
        {
          "id": "q34",
          "text": "34. From the following Balance Sheets and additional information of ABC Ltd., prepare a Cash Flow Statement as per AS 3 (Revised) (Indirect Method):\\n\\n[Complete Comparative Balance Sheet as at 31st March 2024 and 31st March 2025 with Notes to Accounts]\\n\\nAdditional Information:\\n1. During the year a piece of machinery costing ₹... was sold for ₹... (Accumulated depreciation thereon was ₹...).\\n2. Tax paid during the year was ₹...\\n3. Proposed dividend for the year ended 31st March 2024 was ₹... and for 31st March 2025 was ₹...",
          "marks": 6,
          "type": "la",
          "choices": null,
          "orQuestion": "[Alternative Comprehensive Cash Flow Statement Problem from given financial data, 6 Marks]",
          "solution": "ABC Ltd.\\nCASH FLOW STATEMENT for the year ended 31st March 2025 (As per AS 3 Revised - Indirect Method):\\n\\nI. Cash Flow from Operating Activities:\\n   Net Profit before Tax & Extraordinary Items: ₹...\\n   Adjustments for Non-cash and Non-operating items:\\n   Add: Depreciation: ₹...\\n   Operating Profit before Working Capital Changes: ₹...\\n   Cash Generated from Operations: ₹...\\n   Less: Tax Paid: (₹...)\\n   Net Cash from Operating Activities: ₹... [3 Marks]\\n\\nII. Cash Flow from Investing Activities:\\n   Sale of Machinery: ₹...\\n   Purchase of Machinery / Non-current Investments: (₹...)\\n   Net Cash from / (used in) Investing Activities: ₹... [1.5 Marks]\\n\\nIII. Cash Flow from Financing Activities:\\n   Issue of Share Capital: ₹...\\n   Redemption of Debentures: (₹...)\\n   Dividend Paid: (₹...)\\n   Bank Overdraft (increase/decrease): ₹...\\n   Net Cash from / (used in) Financing Activities: ₹... [1.5 Marks]\\n\\nNet Increase/(Decrease) in Cash and Cash Equivalents: ₹...\\nAdd: Cash and Cash Equivalents at the beginning: ₹...\\nCash and Cash Equivalents at the end: ₹...\\n\\nWorking Notes:\\n1. Calculation of Net Profit before Tax\\n2. Machinery Account & Accumulated Depreciation Account\\n3. Provision for Tax Account",
          "orSolution": "[Complete step-by-step Cash Flow Statement and working notes for alternative question]"
        }
      ]
    }
  ]
}
`;
}



