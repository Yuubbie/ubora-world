// seed-gst105.js
// Seeds GST105 as a shared (isGST) course under Social Science, 100L 1st
// Semester. Reuses the existing Social Science faculty/departments from
// seed-gst101.js. Question bank covers the 18 real study units (Module 4's
// two "Revision" units have no new content, so are not turned into questions).
//
// Run from the project root:
//   node seed-gst105.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Module 1: The Nature and Method of Science ----
const module1 = [
  {
    text: 'The word "science" is derived from the Latin word "scientia," which means what?',
    options: ['Nature', 'Knowledge', 'Method', 'Discovery'],
    correctOptionIndex: 1,
    explanation: 'The word "science" comes from the Latin "scientia," meaning "knowledge."',
  },
  {
    text: 'According to Nwala (1997), science is generally regarded in three main ways. Which of the following is one of them?',
    options: ['A religion', 'A body of knowledge', 'An art form', 'A language'],
    correctOptionIndex: 1,
    explanation: 'Science is regarded as a body of knowledge, a method for acquiring knowledge, and an institution.',
  },
  {
    text: 'Which two branches of science use the scientific method to acquire knowledge?',
    options: ['Empirical and formal sciences', 'Ancient and modern sciences', 'African and Western sciences', 'Applied and theoretical sciences'],
    correctOptionIndex: 0,
    explanation: 'The two branches, empirical and formal sciences, both use what is called the scientific method.',
  },
  {
    text: 'Sciences can also be grouped into natural sciences and social sciences. What determines this grouping?',
    options: ['The class of objects or phenomena they deal with', 'The country where they are studied', 'Whether they use mathematics', 'Whether they have laboratories'],
    correctOptionIndex: 0,
    explanation: 'Natural and social sciences are grouped according to the class of objects or phenomena they deal with; natural sciences deal with natural objects.',
  },
  {
    text: 'What is the first step of the scientific method, according to Unit 2?',
    options: ['Observation', 'Conclusion', 'Hypothesis formulation', 'Experimentation'],
    correctOptionIndex: 0,
    explanation: 'The scientific method begins with observation, which can be direct or indirect, spontaneous or induced, and must be repeatable.',
  },
  {
    text: 'What must scientific questions be, according to the "problem definition" step of the scientific method?',
    options: ['Relevant and testable', 'Emotional and persuasive', 'Long and detailed', 'Impossible to answer'],
    correctOptionIndex: 0,
    explanation: 'Problem definition involves asking questions about an observation; scientific questions must be relevant and testable.',
  },
  {
    text: 'Why does the scientific method require experimentation after forming a hypothesis?',
    options: ['Because answers without evidence are unsupported opinions', 'Because experiments are required by law', 'Because hypotheses are always wrong', 'Because experimentation replaces the need for observation'],
    correctOptionIndex: 0,
    explanation: 'Experimentation provides the necessary evidence for accepting or rejecting a hypothesis; without it, an answer is just an unsupported opinion.',
  },
  {
    text: 'What is a scientific theory, according to Unit 3?',
    options: ['An explanation about the cause(s) of a broad range of related phenomena', 'A guess with no supporting evidence', 'A law that can never be revised', 'A religious belief'],
    correctOptionIndex: 0,
    explanation: 'A scientific theory is an explanation about the cause or causes of a broad range of related phenomena, showing how things are related.',
  },
  {
    text: 'Which of the following forms can a scientific theory take, according to Unit 3?',
    options: ['Diagrams, equations, statistical or propositional formulations', 'Only spoken word', 'Only religious text', 'Only artistic illustration'],
    correctOptionIndex: 0,
    explanation: 'Theories can be formulated as diagrams, equations, or statistical and propositional formulations.',
  },
  {
    text: 'What are laws of nature, according to Unit 4?',
    options: ['Theories that have proved to be so universally valid that they have a very high degree of probability', 'Random guesses by scientists', 'Rules created by governments', 'Religious commandments'],
    correctOptionIndex: 0,
    explanation: 'Laws of nature are theories that have proved to be so universally valid or true, with such a high degree of probability, that they are treated as established.',
  },
  {
    text: 'Which of the following is listed as an example of a law of nature in Unit 4?',
    options: ['The law of the uniformity of nature', 'The law of supply and demand', 'The law of gravity applies only on Earth', 'The law of diminishing musical returns'],
    correctOptionIndex: 0,
    explanation: 'Examples given include the law of the uniformity of nature and the law of causation.',
  },
  {
    text: 'According to Unit 5, where did science originate?',
    options: ['Egypt and Babylonia (present-day Iraq)', 'Greece and Rome', 'China and India', 'Nigeria and Ghana'],
    correctOptionIndex: 0,
    explanation: 'Science originated in Egypt and Babylonia, which is present-day Iraq.',
  },
  {
    text: 'Which document provides evidence for the Egyptian origins of mathematics, according to Unit 5?',
    options: ['The Rind Mathematical Papyrus', 'The Dead Sea Scrolls', 'The Rosetta Stone', 'The Code of Hammurabi'],
    correctOptionIndex: 0,
    explanation: 'Evidence for the Egyptian origins of mathematics can be found in the Rind Mathematical Papyrus, while medicine evidence is in the Edwin Papyrus.',
  },
];

// ---- Module 2: History of Science and the Lost Sciences of Africa ----
const module2 = [
  {
    text: 'The Middle Ages of Western Europe, covered in Unit 1, comprise which two phases?',
    options: ['The Dark Ages and the Renaissance', 'The Bronze Age and the Iron Age', 'The Enlightenment and the Reformation', 'Antiquity and Modernity'],
    correctOptionIndex: 0,
    explanation: 'The Middle Ages comprise the Dark Ages (450 to 800 AD) and the Renaissance (9th to 15th century AD).',
  },
  {
    text: 'During the Dark Ages, how was knowledge of nature typically valued, according to Unit 1?',
    options: ['Only as a means of edification or illustration of scripture', 'As the highest form of human achievement', 'As equal to religious authority', 'As entirely separate from religion'],
    correctOptionIndex: 0,
    explanation: 'In the Dark Ages, knowledge of nature was valued only as a means of edification or as an illustration of scriptural passages, and science declined rapidly.',
  },
  {
    text: 'Who made the first great change in scientific outlook by disproving the Ptolemaic (Geocentric) system, according to Unit 2?',
    options: ['Nicolaus Copernicus', 'Isaac Newton', 'Galileo Galilei', 'Charles Darwin'],
    correctOptionIndex: 0,
    explanation: 'Nicolaus Copernicus (1473-1543) disproved the Geocentric theory, proposing instead that the sun was the centre of the universe.',
  },
  {
    text: 'What did the Ptolemaic (Geocentric) system claim, which Copernicus disproved?',
    options: ['That the earth was the centre of the universe', 'That the sun was the centre of the universe', 'That the universe had no centre', 'That planets do not move'],
    correctOptionIndex: 0,
    explanation: 'The Ptolemaic system claimed the earth was the centre of the universe, with all other heavenly bodies moving around it in circles.',
  },
  {
    text: 'Which discovery by Wilhelm Röntgen in 1895 helped drive the 20th century scientific revolution, per Unit 3?',
    options: ['X-rays', 'Electricity', 'The telephone', 'Penicillin'],
    correctOptionIndex: 0,
    explanation: 'Wilhelm Röntgen discovered x-rays in 1895, one of the key discoveries behind the 20th century revolution in physics.',
  },
  {
    text: 'Who formulated the Theory of Relativity in 1905, per Unit 3?',
    options: ['Albert Einstein', 'Isaac Newton', 'Max Planck', 'Niels Bohr'],
    correctOptionIndex: 0,
    explanation: 'Albert Einstein formulated the Theory of Relativity in 1905, a major discovery of the 20th century scientific revolution.',
  },
  {
    text: 'According to Unit 4, what did Peter Schmidt and Donald Avery announce in 1978 about the Haya people?',
    options: ['That Africans near Lake Victoria had produced carbon steel 1,500-2,000 years ago', 'That the Haya people invented the wheel', 'That the Haya people built the pyramids', 'That the Haya people discovered electricity'],
    correctOptionIndex: 0,
    explanation: 'In 1978, Peter Schmidt and Donald Avery of Brown University announced that the Haya people, near Lake Victoria, had produced carbon steel 1,500-2,000 years ago.',
  },
  {
    text: 'What did Peter Schmidt excavate from the Haya site, according to Unit 4?',
    options: ['Iron crystals', 'Gold ornaments', 'Pottery shards', 'Stone tools only'],
    correctOptionIndex: 0,
    explanation: 'Peter Schmidt excavated iron crystals from the site associated with Haya oral history about an ancient king and a pillar of iron.',
  },
  {
    text: 'According to Unit 5, where was one of the earliest pieces of evidence of number use in Africa discovered?',
    options: ['Ishango, on Lake Edward, Democratic Republic of Congo', 'Cairo, Egypt', 'Timbuktu, Mali', 'Great Zimbabwe'],
    correctOptionIndex: 0,
    explanation: 'A carved bone found at the Ishango fishing site on Lake Edward, DR Congo, is among the earliest evidence of number use in Africa, discovered by Dr Jean de Heinzelin.',
  },
  {
    text: 'What is distinctive about the Yoruba number system, according to Unit 5?',
    options: ['It is based on twenty and relies heavily on subtraction', 'It has no concept of zero', 'It uses only even numbers', 'It was borrowed entirely from Arabic numerals'],
    correctOptionIndex: 0,
    explanation: 'The Yoruba number system is based on twenty and relies on subtraction to a very high degree, an unusual feature among number systems.',
  },
];

// ---- Module 3: Science, Technology, Philosophy and Man ----
const module3 = [
  {
    text: 'According to Unit 1, what has been the most potent force for social change in the history of man?',
    options: ['Science and technology', 'Religion alone', 'Political systems', 'Weather patterns'],
    correctOptionIndex: 0,
    explanation: 'Science and technology have been the most potent forces for social change, especially visible when comparing lifestyles today to 100 years ago.',
  },
  {
    text: 'What is the key difference between science and technology, according to Unit 1?',
    options: ['Science is the process and product of investigation; technology is what can be done with those products', 'Science and technology are exactly the same thing', 'Technology existed before science', 'Science only exists in universities'],
    correctOptionIndex: 0,
    explanation: 'Science is both the process and product of investigation and research, while technology is what can be done with the products of that investigation.',
  },
  {
    text: 'According to Unit 2, which of the following is listed as a problem brought about or worsened by science and technology?',
    options: ['Pollution of air, land and water', 'Increased literacy', 'Longer life expectancy alone', 'Reduced population growth'],
    correctOptionIndex: 0,
    explanation: 'Problems associated with technological advancement include population increase, pollution, poverty, and threats to the pursuit of peace.',
  },
  {
    text: 'What is "philosophy of science," according to Unit 3?',
    options: ['The systematic study of the nature of science, especially its methods, concepts, and presuppositions', 'A religious doctrine about scientists', 'A branch of physics only', 'A historical account of famous scientists'],
    correctOptionIndex: 0,
    explanation: 'Philosophy of science is defined as the systematic study of the nature of science, especially its methods, concepts, and presuppositions.',
  },
  {
    text: 'Which of the following is listed as a common characteristic of philosophy of science, per Unit 3?',
    options: ['It is critical in nature and lays emphasis on methods', 'It rejects all scientific findings', 'It only studies ancient science', 'It has no relation to the definition of science'],
    correctOptionIndex: 0,
    explanation: 'Common characteristics of philosophy of science include being critical in nature, showing curiosity, and laying emphasis on methods.',
  },
  {
    text: 'According to Unit 4, what are the two main views on the origin of man?',
    options: ['The religious/creationist view and the scientific/evolutionist view', 'The African view and the European view', 'The ancient view and the modern view', 'The Eastern view and the Western view'],
    correctOptionIndex: 0,
    explanation: 'The two main views on the origin of man are the religious or creationist view and the scientific or evolutionist view.',
  },
  {
    text: 'According to Unit 4, roughly when did the first hominids emerge?',
    options: ['5 to 10 million years ago', '10,000 years ago', '500,000 years ago', '1 million years ago'],
    correctOptionIndex: 0,
    explanation: 'The first hominids emerged approximately 5 to 10 million years ago, with Australopithecus as the earliest known hominid genus.',
  },
  {
    text: 'Which early human species is described in Unit 4 as omnivorous, having a larger brain, and using simple tools?',
    options: ['Homo habilis', 'Homo sapiens sapiens', 'Neanderthal man only', 'Australopithecus afarensis only'],
    correctOptionIndex: 0,
    explanation: 'Homo habilis succeeded Australopithecus, was omnivorous with a larger brain, used simple tools, and showed some social development.',
  },
  {
    text: 'According to Unit 5, what capacity distinguishes man from all other earthly creatures?',
    options: ['His infinite capacity to create', 'His larger physical size', 'His ability to swim', 'His resistance to disease'],
    correctOptionIndex: 0,
    explanation: 'What distinguishes man and places him above other earthly creatures is described as his infinite capacity to create.',
  },
  {
    text: 'How many chromosomes does a human reproductive cell carry, according to Unit 5?',
    options: ['46', '23', '92', '12'],
    correctOptionIndex: 0,
    explanation: 'The unit states that the human reproductive cell has 46 chromosomes, which carry hereditary material.',
  },
];

// ---- Module 4: Man, His Environment, and Nigerian Scientists ----
const module4 = [
  {
    text: 'What is the "cosmos," as defined in Unit 1?',
    options: ['The world or entire universe regarded as one orderly system', 'Only the Earth and Moon', 'A synonym for outer space debris', 'A term used only in ancient Egyptian texts'],
    correctOptionIndex: 0,
    explanation: 'The cosmos is defined as the world or entire universe regarded as one orderly system, with parts linked together in an orderly manner.',
  },
  {
    text: 'What is the difference between cosmology and cosmogony, per Unit 1?',
    options: ['Cosmology studies the structure of the universe; cosmogony studies its evolution and origin', 'They are two names for the same field', 'Cosmology is religious; cosmogony is scientific', 'Cosmogony only applies to the solar system'],
    correctOptionIndex: 0,
    explanation: 'Cosmology is the area of study concerned with the structure of the universe, while cosmogony deals with the evolution and origin of the universe.',
  },
  {
    text: 'Which of the following is listed as part of the structure of the cosmos, per Unit 1?',
    options: ['Galaxies (groups of stars)', 'Only the Earth', 'Only man-made satellites', 'Only the solar system'],
    correctOptionIndex: 0,
    explanation: 'The structure of the cosmos includes the earth and other planets, their satellites, the sun and other stars, and galaxies (groups of stars).',
  },
  {
    text: 'Which basic types of food does Unit 2 identify as needed by man?',
    options: ['Carbohydrates, fats and oils, proteins, minerals and vitamins', 'Only proteins and water', 'Only carbohydrates', 'Only vitamins and minerals'],
    correctOptionIndex: 0,
    explanation: 'The basic types of food needed by man include carbohydrates, fats and oils, proteins, minerals, and vitamins.',
  },
  {
    text: 'According to Unit 2, what determines man\'s ability to produce food and meet other agricultural needs?',
    options: ['The type of climate, weather, and soil of the region', 'Only the availability of modern machinery', 'Only government policy', 'Only population size'],
    correctOptionIndex: 0,
    explanation: 'Man\'s ability to produce food and other agricultural needs depends on the climate, weather, and soil of the region he lives in.',
  },
  {
    text: 'What field did Prof. Bartholomew Nnaji, a Nigerian-born scientist featured in Unit 3, become known for founding?',
    options: ['The Automation and Robotic Laboratory at the University of Massachusetts', 'A national airline', 'A pharmaceutical company', 'A film studio'],
    correctOptionIndex: 0,
    explanation: 'Prof. Bartholomew Nnaji founded the Automation and Robotic Laboratory at the University of Massachusetts at Amherst and became a distinguished professor of engineering.',
  },
  {
    text: 'What organisation did Prof. Bartholomew Nnaji consult for, according to Unit 3?',
    options: ['NATO, the American Army, and the United Nations Development Programme', 'Only local Nigerian government agencies', 'Only private Nigerian companies', 'No organisations; he worked independently'],
    correctOptionIndex: 0,
    explanation: 'Prof. Nnaji consulted for Digital Equipment Corporation, NATO, the American Army, and the United Nations Development Programme, among other bodies.',
  },
];

const moduleQuestionSets = [module1, module2, module3, module4];

async function main() {
  console.log('Looking up Social Science faculty...');
  const faculty = await prisma.faculty.findUnique({ where: { name: 'Social Science' } });
  if (!faculty) {
    console.error('Social Science faculty not found. Run seed-gst101.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Faculty found: ${faculty.id}`);

  console.log('Seeding GST105 as a shared (isGST) course...');
  let course = await prisma.course.findUnique({ where: { code: 'GST105' } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: 'GST105',
        title: 'History and Philosophy of Science',
        isGST: true,
        departmentId: null,
        level: 100,
        semester: 'first',
      },
    });
    console.log(`  Created course: ${course.id}`);
  } else {
    console.log(`  Course already exists: ${course.id}`);
  }

  console.log('Creating question bank...');
  let bank = await prisma.questionBank.findFirst({
    where: { courseId: course.id },
  });
  if (!bank) {
    bank = await prisma.questionBank.create({
      data: {
        courseId: course.id,
        status: 'approved',
        createdBy: 'system-seed-gst105',
        approvedBy: 'system-seed-gst105',
        approvedAt: new Date(),
      },
    });
    console.log(`  Created question bank: ${bank.id}`);
  } else {
    console.log(`  Question bank already exists: ${bank.id}, skipping question insert to avoid duplicates.`);
    await prisma.$disconnect();
    return;
  }

  console.log('Inserting questions...');
  let totalInserted = 0;
  for (let moduleIndex = 0; moduleIndex < moduleQuestionSets.length; moduleIndex++) {
    const moduleNumber = moduleIndex + 1;
    const questions = moduleQuestionSets[moduleIndex];
    for (const q of questions) {
      await prisma.question.create({
        data: {
          questionBankId: bank.id,
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          module: moduleNumber,
        },
      });
      totalInserted++;
    }
    console.log(`  Module ${moduleNumber}: ${questions.length} questions inserted.`);
  }

  console.log(`Done. Total questions inserted: ${totalInserted}`);
  console.log(`GST105 course id: ${course.id}`);
  console.log(`Question bank id: ${bank.id}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
