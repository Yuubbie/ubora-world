// add-gst105-questions-batch2.js
// Appends a second batch of questions to the EXISTING GST105 question bank.
// Does NOT recreate the course - looks up the existing GST105 course and
// question bank by code, then inserts new questions only. Safe to run once.
//
// Run from the project root:
//   node add-gst105-questions-batch2.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Module 1 additions ----
const module1Extra = [
  {
    text: 'Which of the following is an example of a formal science, according to Unit 1?',
    options: ['Mathematics', 'Medicine', 'Economics', 'Biology'],
    correctOptionIndex: 0,
    explanation: 'Formal sciences include mathematics (geometry, algebra, trigonometry, arithmetic), logic, theoretical physics, and statistics.',
  },
  {
    text: 'What does the mnemonic "BODMAS," mentioned in Unit 1, help remember?',
    options: ['The order of operations in mathematics (bracket, of, division, multiplication, addition, subtraction)', 'The steps of the scientific method', 'The branches of empirical science', 'The founders of modern physics'],
    correctOptionIndex: 0,
    explanation: 'BODMAS stands for Bracket, Of, Division, Multiplication, Addition, Subtraction, the order in which mathematical operations should be carried out.',
  },
  {
    text: 'Which of the following is listed as an empirical science, according to Unit 1?',
    options: ['Chemistry', 'Logic', 'Theoretical physics', 'Pure mathematics'],
    correctOptionIndex: 0,
    explanation: 'Empirical sciences include physics, chemistry, biology, psychology, botany, zoology, biochemistry, microbiology, geology, and medical sciences.',
  },
  {
    text: 'According to Unit 1, what makes an object or phenomenon a subject of empirical science?',
    options: ['It can be observed through the senses or measured with instruments', 'It must be spiritual in nature', 'It must be impossible to measure', 'It must be a purely abstract concept'],
    correctOptionIndex: 0,
    explanation: 'Empirical sciences study objects that can be observed through the senses (sight, touch, hearing, taste, smell) or measured with instruments like telescopes or rulers.',
  },
  {
    text: 'Which of the following is given as an example of a "non-sense perception object," outside empirical science?',
    options: ['Goodness/virtue', 'A cow', 'The weather', 'A plant'],
    correctOptionIndex: 0,
    explanation: 'Values such as goodness, rightness, virtue, beauty, holiness, and truth cannot be observed by the senses or measured, so they fall outside empirical science.',
  },
  {
    text: 'According to Unit 1, what are the two overarching aims of science?',
    options: ['To equip us with theoretical knowledge and practical knowledge/power to control objects', 'To replace religion entirely', 'To only describe historical events', 'To provide entertainment'],
    correctOptionIndex: 0,
    explanation: 'Science equips us with theoretical knowledge (concepts, laws, theories) and practical knowledge that lets us control objects and phenomena; science is "a source of knowledge and a source of power."',
  },
  {
    text: 'How does religion differ fundamentally from science, according to Unit 1?',
    options: ['Religion is speculative and based on faith/dogma; science is concerned with nature and natural phenomena', 'Religion and science use identical methods', 'Religion is empirical; science is not', 'There is no meaningful difference between them'],
    correctOptionIndex: 0,
    explanation: 'Religion is speculative and based on faith or dogma, concerned with the supernatural, while science is concerned with nature and natural phenomena.',
  },
  {
    text: 'What is the role of a hypothesis in the scientific method, according to Unit 2?',
    options: ['A proposed answer or guess about the questions posed after observation', 'A final, unchangeable conclusion', 'A religious belief used to guide research', 'An experiment that has already been completed'],
    correctOptionIndex: 0,
    explanation: 'Hypothesis formulation involves guessing or proposing answers to the questions posed after observation, which is then tested through experimentation.',
  },
  {
    text: 'Which sub-branch of natural science deals with physical and inanimate objects such as rocks, rivers, and mountains?',
    options: ['Physical sciences', 'Biological sciences', 'Medical sciences', 'Pharmaceutical sciences'],
    correctOptionIndex: 0,
    explanation: 'Physical sciences (physics, chemistry, geology, applied mathematics, astronomy) deal with physical and inanimate objects.',
  },
  {
    text: 'Which discipline is listed under social sciences in Unit 1?',
    options: ['Sociology and anthropology', 'Zoology', 'Pharmacology', 'Astronomy'],
    correctOptionIndex: 0,
    explanation: 'Social sciences include economics, social psychology, geography, sociology and anthropology, and social philosophy.',
  },
];

// ---- Module 2 additions ----
const module2Extra = [
  {
    text: 'In the Dark Ages, what happened to people\'s ability to critically evaluate knowledge, according to Unit 1?',
    options: ['They lost the ability to criticise and believed anything in accordance with scripture', 'Critical thinking flourished more than ever before', 'Only scientists retained critical thinking ability', 'Critical thinking was unaffected by the period'],
    correctOptionIndex: 0,
    explanation: 'In the Dark Ages, people lost the ability to criticise and believed anything that was in accordance with the scriptures, causing science and learning to decline rapidly.',
  },
  {
    text: 'Who, according to Unit 1, translated ancient works and helped preserve knowledge during the Dark Ages?',
    options: ['Monks in monasteries', 'Roman senators', 'Egyptian priests', 'Greek philosophers'],
    correctOptionIndex: 0,
    explanation: 'During the Dark Ages, monks in monasteries translated ancient works, helping preserve some scientific and philosophical knowledge.',
  },
  {
    text: 'According to Unit 3, what characterised 20th century physics?',
    options: ['A true revolution in thought', 'A period of no significant discovery', 'A return to purely religious explanations', 'A complete rejection of Einstein\'s work'],
    correctOptionIndex: 0,
    explanation: 'Physics of the 20th century was characterised by a true revolution in thought, driven by discoveries such as x-rays and the theory of relativity.',
  },
  {
    text: 'What did 20th century chemists use to improve their understanding of chemical reactions, according to Unit 3?',
    options: ['New information on the structure of the atom reported by physicists', 'Ancient alchemical texts', 'Purely theoretical mathematics with no physical basis', 'Techniques borrowed exclusively from biology'],
    correctOptionIndex: 0,
    explanation: 'Chemists of the 20th century used new information on the structure of the atom, reported by physicists, to improve their field.',
  },
  {
    text: 'According to Unit 4, who are the present-day occupants of the western shores of Lake Victoria associated with ancient carbon steel production?',
    options: ['The Haya people', 'The Zulu people', 'The Yoruba people', 'The Maasai people'],
    correctOptionIndex: 0,
    explanation: 'The Haya people are the present occupants of the western shores of Lake Victoria, associated with ancient carbon steel production discovered by Schmidt and Avery.',
  },
  {
    text: 'What method did Peter Schmidt use to test the Haya oral history about ancient ironworking, according to Unit 4?',
    options: ['He persuaded Haya blacksmiths to carry out a smelting demonstration', 'He relied purely on written historical records', 'He used only carbon dating with no practical demonstration', 'He excavated European archaeological sites for comparison'],
    correctOptionIndex: 0,
    explanation: 'Peter Schmidt persuaded some Haya blacksmiths to carry out a smelting process to test whether the oral history about ancient ironworking was technically possible.',
  },
  {
    text: 'In the Yoruba number system described in Unit 5, what number is used as an intermediate figure for numbers going by tens?',
    options: ['Five', 'Three', 'Seven', 'Two'],
    correctOptionIndex: 0,
    explanation: 'In the Yoruba number system, for numbers going by tens, five is used as the intermediate figure, five less than the next higher stage.',
  },
];

// ---- Module 3 additions ----
const module3Extra = [
  {
    text: 'What comparison does Unit 1 use to illustrate how much science and technology have changed lifestyles?',
    options: ['Comparing lifestyles today with lifestyles 100 years ago', 'Comparing rural and urban lifestyles only', 'Comparing Nigerian and American lifestyles only', 'Comparing lifestyles in different seasons'],
    correctOptionIndex: 0,
    explanation: 'The impact of science and technology on lifestyle is described as most obvious when comparing today\'s lifestyle with that of 100 years ago.',
  },
  {
    text: 'What motivates scientists to carry out investigations and research, according to Unit 1?',
    options: ['Curiosity', 'Financial reward alone', 'Government mandate', 'Competition with other countries only'],
    correctOptionIndex: 0,
    explanation: 'Curiosity motivates scientists to carry out investigations and research, while the desire to apply ideas practically drives technological development.',
  },
  {
    text: 'Which of the following areas of human life does Unit 2 say has been improved by technological development?',
    options: ['Agriculture, medicine, architecture, engineering, transport, and communication', 'Only entertainment', 'Only military capability', 'Only academic research'],
    correctOptionIndex: 0,
    explanation: 'Technological development has improved agriculture, medicine, architecture, engineering, transport, and communication, among other areas.',
  },
  {
    text: 'What does the study of "definition of science, aims of science, and analysis of scientific concepts" fall under, per Unit 3?',
    options: ['Philosophy of science', 'Pure mathematics', 'Applied engineering', 'Religious studies'],
    correctOptionIndex: 0,
    explanation: 'Philosophy of science covers the definition of science, its aims, analysis of scientific concepts and theories, and the nature of scientific knowledge.',
  },
  {
    text: 'What is the earliest known genus of hominid, according to Unit 4?',
    options: ['Australopithecus', 'Homo sapiens', 'Homo erectus', 'Homo neanderthalensis'],
    correctOptionIndex: 0,
    explanation: 'Australopithecus is identified as the earliest known genus of hominid, emerging roughly 5 to 10 million years ago.',
  },
  {
    text: 'Which early human species is described as having a larger brain than its predecessors and living by gathering and scavenging?',
    options: ['Homo erectus', 'Australopithecus only', 'Modern Homo sapiens only', 'None of the early hominids show these traits'],
    correctOptionIndex: 0,
    explanation: 'Homo erectus, which came after Homo habilis, had a larger brain than its predecessors and lived by gathering and scavenging.',
  },
  {
    text: 'According to Unit 5, what are the six kinds of specialised cells found in man?',
    options: ['Skin, bone/connective tissue, muscle, blood, nervous tissue, and reproductive cells', 'Only skin and bone cells', 'Only blood cells', 'Only nervous tissue and muscle cells'],
    correctOptionIndex: 0,
    explanation: 'The six specialised cell types in man are: epithelium (skin), bone/connective tissue, muscle, blood, nervous tissue, and reproductive cells.',
  },
  {
    text: 'What is the function of epithelium tissue (skin cells), according to Unit 5?',
    options: ['Covering the outside of the body and parts that communicate with the outside', 'Carrying oxygen through the bloodstream', 'Transmitting nerve signals', 'Producing hereditary material'],
    correctOptionIndex: 0,
    explanation: 'Epithelium tissues cover the outside of the body and the parts that communicate with the outside, such as the mouth, throat, and digestive canal.',
  },
];

// ---- Module 4 additions ----
const module4Extra = [
  {
    text: 'What does man depend on the cosmos for, according to Unit 1?',
    options: ['Air, heat, water, and other natural resources for survival', 'Nothing; man is entirely self-sufficient', 'Only decorative purposes', 'Only religious symbolism'],
    correctOptionIndex: 0,
    explanation: 'Man depends, for his survival, on air, heat, water, and other natural resources from the entire cosmos, particularly his own planet.',
  },
  {
    text: 'What does "vegetation," discussed in Unit 2, refer to?',
    options: ['The plant life of a region', 'Only cultivated crops', 'Only forests', 'Only ornamental gardens'],
    correctOptionIndex: 0,
    explanation: 'Vegetation refers to the plant life of a region, and it influences the type of food and resources available to people living there.',
  },
  {
    text: 'Which Nigerian-born scientist, featured in Unit 3, is known for founding an Automation and Robotic Laboratory in the United States?',
    options: ['Prof. Bartholomew Nnaji', 'Prof. Chinua Achebe', 'Prof. Wole Soyinka', 'Prof. Chike Obi'],
    correctOptionIndex: 0,
    explanation: 'Prof. Bartholomew Nnaji founded the Automation and Robotic Laboratory at the University of Massachusetts at Amherst.',
  },
  {
    text: 'What kind of consulting work did Prof. Bartholomew Nnaji do, according to Unit 3?',
    options: ['Consulting for organisations including Digital Equipment Corporation and NATO', 'Only teaching undergraduate classes', 'Only writing textbooks', 'Only working on unrelated business ventures'],
    correctOptionIndex: 0,
    explanation: 'Prof. Nnaji consulted for Digital Equipment Corporation, NATO, the American Army, and the United Nations Development Programme, among others.',
  },
  {
    text: 'Why does Unit 3 highlight Nigerian-born scientists specifically, in the context of this course?',
    options: ['To show that Nigerians have made real, documented contributions to science and technology globally', 'To argue that Nigeria has no scientific tradition', 'To focus only on ancient history, not modern achievement', 'To compare Nigerian scientists unfavourably to others'],
    correctOptionIndex: 0,
    explanation: 'The unit profiles Nigerian-born scientists to demonstrate real, documented Nigerian contributions to global science and technology, connecting the course\'s historical material to present-day achievement.',
  },
];

// ---- Module 1 additions batch 2 (Scientific method detail) ----
const module1Extra2 = [
  {
    text: 'According to Unit 2, what is described as the true excitement of science, more than just the collected facts?',
    options: ['The process of intriguing observation and carefully designed experiments', 'Memorising established facts', 'Winning academic awards', 'Publishing papers quickly'],
    correctOptionIndex: 0,
    explanation: 'The unit states that the excitement of science lies in the observation and carefully designed experiments scientists use to learn about nature, not just the facts themselves.',
  },
  {
    text: 'What is the difference between direct and indirect observation, according to Unit 2?',
    options: ['Direct observation uses the senses directly; indirect observation uses instruments', 'Direct observation is always wrong; indirect is always correct', 'There is no real difference between them', 'Direct observation only applies to biology'],
    correctOptionIndex: 0,
    explanation: 'Direct observations are made with the aid of the senses, while indirect observations use instruments, for things like atomic nuclei that cannot be perceived directly.',
  },
  {
    text: 'What is the difference between spontaneous and induced observation, according to Unit 2?',
    options: ['Spontaneous observations are unexpected; induced observations are deliberately sought', 'Spontaneous observations are always wrong', 'Induced observations require no equipment', 'There is no meaningful difference'],
    correctOptionIndex: 0,
    explanation: 'Spontaneous (passive) observations are unexpected, while induced (active) observations are deliberately looked out for.',
  },
  {
    text: 'Why must a scientific observation be repeatable, according to Unit 2?',
    options: ['Because science does not take any single observation at face value; other scientists must confirm it', 'Because repetition makes an observation more entertaining', 'Because instruments always fail the first time', 'Because repeatability is only required in physics'],
    correctOptionIndex: 0,
    explanation: 'Scientific observation must be repeatable because science does not accept an observation at face value; several scientists must independently confirm it.',
  },
  {
    text: 'What does the unit identify as a major difficulty in making correct observations?',
    options: ['Unsuspected bias, since people tend to see what they want or expect to see', 'A lack of available instruments', 'The high cost of laboratory equipment', 'Government restrictions on research'],
    correctOptionIndex: 0,
    explanation: 'The unit notes that correct observation is difficult largely because of unsuspected bias; people tend to see what they want or expect to see.',
  },
];

// ---- Module 2 additions batch 2 ----
const module2Extra2 = [
  {
    text: 'What phase of the Middle Ages followed the Dark Ages, according to Unit 1?',
    options: ['The Renaissance', 'The Industrial Revolution', 'The Enlightenment', 'Antiquity'],
    correctOptionIndex: 0,
    explanation: 'The Middle Ages comprised the Dark Ages (450-800 AD) followed by the Renaissance (9th to 15th century AD).',
  },
  {
    text: 'What did the discovery of x-rays and the theory of relativity have in common, according to Unit 3?',
    options: ['Both were key discoveries that drove the 20th century revolution in scientific thought', 'Both were disproven within a decade', 'Both were discovered by the same scientist', 'Neither had any lasting scientific impact'],
    correctOptionIndex: 0,
    explanation: 'Both the discovery of x-rays (Röntgen, 1895) and the theory of relativity (Einstein, 1905) were key discoveries that drove the scientific revolution of the 20th century.',
  },
];

// ---- Module 3 additions batch 2 ----
const module3Extra2 = [
  {
    text: 'What does Unit 1 say about the relationship between curiosity and scientific investigation?',
    options: ['Curiosity is what motivates scientists to carry out investigation and research', 'Curiosity is discouraged in formal scientific training', 'Curiosity only matters for amateur scientists', 'Curiosity has no documented role in science'],
    correctOptionIndex: 0,
    explanation: 'Curiosity motivates scientists to carry out investigations and research, distinct from the practical desire to apply findings that drives technology.',
  },
  {
    text: 'According to Unit 2, technological advancement has both benefited and worsened human life. Which of these is listed as a negative outcome?',
    options: ['Threats to the pursuit of peace', 'Universal literacy', 'Elimination of all disease', 'Guaranteed economic equality'],
    correctOptionIndex: 0,
    explanation: 'Alongside its benefits, technological advancement has been linked to problems including population increase, pollution, poverty, and threats to peace.',
  },
];

// ---- Module 4 additions batch 2 ----
const module4Extra2 = [
  {
    text: 'What are the two main components used to describe the structure of the cosmos, alongside planets and stars, per Unit 1?',
    options: ['Satellites and galaxies (groups of stars)', 'Only asteroids', 'Only comets', 'Only man-made satellites'],
    correctOptionIndex: 0,
    explanation: 'The structure of the cosmos includes the earth and planets, their satellites, the sun and other stars, and galaxies (groups of stars).',
  },
];

const moduleQuestionSets = [
  { module: 1, questions: [...module1Extra, ...module1Extra2] },
  { module: 2, questions: [...module2Extra, ...module2Extra2] },
  { module: 3, questions: [...module3Extra, ...module3Extra2] },
  { module: 4, questions: [...module4Extra, ...module4Extra2] },
];

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'GST105' } });
  if (!course) {
    console.error('GST105 course not found. Run seed-gst105.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const bank = await prisma.questionBank.findFirst({ where: { courseId: course.id } });
  if (!bank) {
    console.error('No question bank found for GST105. Run seed-gst105.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found GST105 course (${course.id}) and question bank (${bank.id}).`);

  let totalInserted = 0;
  for (const { module, questions } of moduleQuestionSets) {
    for (const q of questions) {
      await prisma.question.create({
        data: {
          questionBankId: bank.id,
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          module,
        },
      });
      totalInserted++;
    }
    console.log(`  Module ${module}: ${questions.length} additional questions inserted.`);
  }

  const finalCount = await prisma.question.count({ where: { questionBankId: bank.id } });
  console.log(`Batch 2 done. Inserted ${totalInserted} new questions.`);
  console.log(`GST105 question bank total is now: ${finalCount}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Batch insert failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
