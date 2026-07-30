// seed-gst101.js
// Seeds: Faculty of Social Science, 8 departments, GST101 as a shared
// (isGST) course not tied to any single department, plus a 240-question
// CBT bank across 4 modules matching the CSS121 explanation format.
//
// Run from the project root:
//   node seed-gst101.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEPARTMENTS = [
  'Criminology and Security Studies',
  'Economics',
  'Political Science',
  'International Relations and Diplomacy',
  'Mass Communication',
  'Peace and Conflict Resolution',
  'Tourism',
  'Development Studies',
];

// ---- Module 1: Listening Skills (Units 1-5) ----
const module1 = [
  {
    text: 'According to the unit, who qualifies as "a listener"?',
    options: ['Only people studying broadcasting', 'Anybody capable of listening to anything said', 'Only people without hearing impairments', 'Only lecturers'],
    correctOptionIndex: 1,
    explanation: 'A listener is anybody capable of listening to anything said and possibly participating in what was demanded of them.',
  },
  {
    text: 'Listening activities are divided into which two major parts?',
    options: ['Formal and informal listening', 'Listening in general social settings and listening for specific purposes', 'Active and passive listening', 'Silent and vocal listening'],
    correctOptionIndex: 1,
    explanation: 'The unit divides listening activities into listening in general, social settings and listening for specific purposes such as gathering information or academic lectures.',
  },
  {
    text: 'Which of the following is listed as a listening enabling skill?',
    options: ['Fast typing', 'Concentration', 'Public speaking', 'Memorization techniques'],
    correctOptionIndex: 1,
    explanation: 'The listening enabling skills listed are functioning ears, concentration, ability to think along with the speaker, ability to anticipate, and ability to note signposts.',
  },
  {
    text: 'What does the "ability to anticipate" as a listening skill mean?',
    options: ['Guessing the topic before the speaker begins', 'Predicting what the speaker is about to say next based on cues', 'Reading the transcript in advance', 'Recording the speech for later review'],
    correctOptionIndex: 1,
    explanation: 'Anticipation means being able to predict what a speaker is about to say next, aided by cues such as "first of all... secondly."',
  },
  {
    text: 'Which expression signals a "relationship" connection in listening, according to the unit?',
    options: ['"For example"', '"As I said before"', '"The end"', '"Chapter one"'],
    correctOptionIndex: 1,
    explanation: 'Relationship in listening is signalled by expressions such as "as I said before," "on the one hand," and "consequently."',
  },
  {
    text: 'What is the primary relationship between listening and comprehension described in Unit 2?',
    options: ['They are unrelated skills', 'Listening is useless without comprehension', 'Comprehension only matters in written texts', 'Listening always guarantees comprehension'],
    correctOptionIndex: 1,
    explanation: 'The unit stresses that listening is closely related to comprehension, and listening is useless if there is no comprehension.',
  },
  {
    text: 'Which of these is listed as a step toward effective listening-comprehension?',
    options: ['Listening passively without engagement', 'Possessing a wide range of vocabulary related to the topic', 'Avoiding note-taking entirely', 'Ignoring the speaker\'s tone'],
    correctOptionIndex: 1,
    explanation: 'To comprehend, a listener should listen attentively, follow the speaker, and possess a wide range of vocabulary related to the subject.',
  },
  {
    text: 'What distinguishes note-taking from note-making, according to Unit 3?',
    options: ['They mean exactly the same thing', 'Note-taking is from lectures/talks; note-making is from textbooks/study texts', 'Note-making only applies to science subjects', 'Note-taking is only done after class'],
    correctOptionIndex: 1,
    explanation: 'Note-taking refers to taking notes from lectures, talks, or speeches, while note-making refers to making notes from textbooks, journal articles, or study texts.',
  },
  {
    text: 'What is recommended when taking notes to keep them attractive and easy to learn from?',
    options: ['Writing in one continuous paragraph', 'Using headings, sub-headings, and leaving wide margins', 'Avoiding all abbreviations', 'Copying every word the lecturer says'],
    correctOptionIndex: 1,
    explanation: 'The unit recommends leaving space between headings/sub-headings, wide margins, and consistent formatting to make notes neat and easy to learn from.',
  },
  {
    text: 'What is one of the most important "dos" of note-taking mentioned in the unit?',
    options: ['Writing down everything the lecturer says word for word', 'Always removing irrelevances from your notes', 'Avoiding abbreviations completely', 'Taking notes only after the lecture ends'],
    correctOptionIndex: 1,
    explanation: 'The unit stresses that one of the most important "dos" of note-taking is to always remove irrelevances rather than writing everything the lecturer says.',
  },
  {
    text: 'Through listening-comprehension, what types of information can typically be retrieved, according to Unit 4?',
    options: ['Only numerical statistics', 'Instructions, directions, and facts', 'Only opinions of the speaker', 'Only historical dates'],
    correctOptionIndex: 1,
    explanation: 'Unit 4 teaches that instructions, directions, and facts are among the types of information that can be retrieved through listening-comprehension.',
  },
  {
    text: 'In Unit 5, how should a listener retrieve information from diagrams during a listening-comprehension exercise?',
    options: ['By ignoring the diagram entirely', 'Through careful observation of the diagram as the speaker speaks', 'By reading the diagram after the audio finishes', 'By guessing without listening'],
    correctOptionIndex: 1,
    explanation: 'Unit 5 explains that information from diagrams should be retrieved through careful observation of the diagram as the speaker is speaking.',
  },
];

// ---- Module 2: Main Idea, Critical Listening, Effective Reading, Skimming/Scanning ----
const module2 = [
  {
    text: 'What is the focus of Unit 1 in Module 2?',
    options: ['Listening for the main idea of a lecture or talk', 'Writing formal letters', 'Reading scientific diagrams', 'Grammar correction'],
    correctOptionIndex: 0,
    explanation: 'Unit 1 of Module 2 teaches why and how to listen for the main idea of a lecture, talk, or speech.',
  },
  {
    text: 'According to the unit, how does a speaker often signal the main idea?',
    options: ['By speaking faster', 'By repeating the main idea directly or indirectly', 'By whispering', 'By changing languages'],
    correctOptionIndex: 1,
    explanation: 'The unit explains that speakers often draw attention to and repeat the main idea, directly or indirectly, through various speech patterns.',
  },
  {
    text: 'What does listening for "interpretation and critical evaluation" involve, per Unit 2?',
    options: ['Only memorizing facts', 'Interpreting a speaker\'s viewpoints and critically evaluating what is said', 'Ignoring the speaker\'s opinions', 'Repeating the speech verbatim'],
    correctOptionIndex: 1,
    explanation: 'Unit 2 focuses on interpreting a speaker\'s viewpoints and critically evaluating what is heard, using suggested words and expressions for analysis.',
  },
  {
    text: 'Why is "effective reading" strategy important, according to Unit 3?',
    options: ['It has no real academic benefit', 'It allows deciding your purpose for reading and improves comprehension', 'It only applies to fiction', 'It replaces the need for listening skills'],
    correctOptionIndex: 1,
    explanation: 'Effective reading involves deciding the purpose of reading, deciding what to read, previewing content, and forming notes on what is read to improve comprehension.',
  },
  {
    text: 'Which of the following is a step in effective reading listed in the unit?',
    options: ['Getting an overview of what is to be read', 'Reading without any prior purpose', 'Skipping all notes', 'Reading only the last paragraph'],
    correctOptionIndex: 0,
    explanation: 'One of the effective reading steps listed is getting an overview of the material before reading it in depth.',
  },
  {
    text: 'What is skimming used for, according to Unit 4?',
    options: ['Detailed memorization of every fact', 'Getting a general idea, impression, or gist of a passage quickly', 'Slow, careful reading for exams', 'Translating a passage'],
    correctOptionIndex: 1,
    explanation: 'Skimming is the fastest reading speed, used to get a general idea, overview, or gist of a passage without requiring high comprehension.',
  },
  {
    text: 'What is scanning primarily used for?',
    options: ['Locating specific information quickly within a text', 'Reading for pleasure', 'Memorizing an entire passage', 'Writing a summary'],
    correctOptionIndex: 0,
    explanation: 'Scanning is a reading skill used to locate specific, important information within a passage rather than reading it in full.',
  },
  {
    text: 'What reading speed is described as the slowest, used for proper understanding?',
    options: ['Skimming speed', 'Study speed', 'Scanning speed', 'Speed reading'],
    correctOptionIndex: 1,
    explanation: 'Study speed is described as the slowest reading speed, requiring high concentration and understanding, with attention to details.',
  },
  {
    text: 'What reading speed is typically used for novels read for enjoyment, per the unit?',
    options: ['Study speed', 'Average reading speed', 'Skimming speed only', 'No specific speed is recommended'],
    correctOptionIndex: 1,
    explanation: 'Average reading speed is used for materials that require intensive reading and comprehension but are easier than textbooks, such as many novels.',
  },
  {
    text: 'Unit 5 (Reading and Comprehending at Varying Speed Levels I) primarily builds on which two earlier reading skills?',
    options: ['Note-taking and note-making', 'Skimming and scanning', 'Listening and speaking', 'Writing and editing'],
    correctOptionIndex: 1,
    explanation: 'The unit builds on skimming and scanning as it trains varying reading speed levels for different comprehension purposes.',
  },
  {
    text: 'What warning does the unit give about reading speed and comprehension?',
    options: ['Reading slowly always increases comprehension', 'Reading too fast with no comprehension, or too slowly for no reason, are both discouraged', 'Speed has no relationship to comprehension', 'Only fast reading is acceptable in this course'],
    correctOptionIndex: 1,
    explanation: 'The unit warns against reading too fast with no comprehension or too slowly simply for the sake of comprehension, noting research shows slow reading does not guarantee better comprehension.',
  },
  {
    text: 'What is the ultimate goal of learning both skimming and scanning together, according to the unit?',
    options: ['To read every word of a text carefully', 'To build flexible reading strategies suited to different academic and pleasure reading purposes', 'To avoid reading altogether', 'To eliminate the need for listening skills'],
    correctOptionIndex: 1,
    explanation: 'Skimming and scanning are taught as complementary, flexible strategies that support varying academic and pleasure-reading purposes.',
  },
];

// ---- Module 3: Study-Speed Reading & Vocabulary Development ----
const module3 = [
  {
    text: 'What does Unit 1 of Module 3 (Reading and Comprehending at Varying Speed Levels II) focus on?',
    options: ['Study-type reading speed and note-making from books', 'Skimming only', 'Grammar rules', 'Public speaking'],
    correctOptionIndex: 0,
    explanation: 'This unit offers practice in study-type reading speed (the slowest, most detailed type), along with note-making from books.',
  },
  {
    text: 'Why does the unit emphasize accuracy over pure speed in study-type reading?',
    options: ['Speed does not matter at all', 'Speed and accuracy together are the watchword for effective study reading', 'Only accuracy matters, speed is irrelevant', 'The unit does not discuss accuracy'],
    correctOptionIndex: 1,
    explanation: 'The unit states that as students increase reading speed, "speed and accuracy" together remain the watchword for effective study reading.',
  },
  {
    text: 'What is the primary way to find word meanings introduced in Unit 2 (Reading for Vocabulary Development I)?',
    options: ['Ignoring unfamiliar words', 'Word attack and searching round the passage for context clues', 'Memorizing a dictionary cover to cover', 'Asking a classmate every time'],
    correctOptionIndex: 1,
    explanation: 'Unit 2 teaches finding word meanings through word attack strategies and searching the surrounding passage for contextual clues.',
  },
  {
    text: 'Which additional vocabulary-development strategy is introduced in Unit 3?',
    options: ['Using lexical familiarisation and past experience to determine word meaning', 'Avoiding dictionaries entirely', 'Only guessing without context', 'Translating to another language first'],
    correctOptionIndex: 0,
    explanation: 'Unit 3 introduces lexical familiarisation and drawing on past experience, along with effective dictionary use, as vocabulary strategies.',
  },
  {
    text: 'Which academic field\'s vocabulary is covered first in Unit 4 (Vocabulary Development in Various Academic Contexts Part I)?',
    options: ['Psychology', 'Tourism', 'Architecture', 'Music'],
    correctOptionIndex: 0,
    explanation: 'Unit 4 covers vocabulary items associated with psychology, along with legal, medical/paramedical, and education fields.',
  },
  {
    text: 'Which fields are covered together in Unit 4\'s vocabulary development exercises?',
    options: ['Psychology, law, medical/paramedical, and education', 'Only mathematics', 'Only sports', 'Only agriculture'],
    correctOptionIndex: 0,
    explanation: 'Unit 4 exposes students to vocabulary items associated with psychology, the legal field, medical and paramedical fields, and education.',
  },
  {
    text: 'Which academic fields does Unit 5 (Vocabulary Development in Various Academic Contexts Part II) cover?',
    options: ['Arts, accounting, and natural sciences', 'Only fine arts', 'Only computer science', 'Only history'],
    correctOptionIndex: 0,
    explanation: 'Unit 5 continues vocabulary development by covering terms associated with the arts, accounting, and natural sciences.',
  },
  {
    text: 'What does the unit say about words like "continuous," "corrective," and "primary" in the accounting field context?',
    options: ['They are exclusively accounting terms', 'They can be used in other fields, though meanings may change by context', 'They have no meaning outside accounting', 'They cannot appear in any other passage'],
    correctOptionIndex: 1,
    explanation: 'The unit notes that words like "continuous," "corrective," "vital," and "primary" can be used in fields other than accounting, though their meanings may shift depending on context.',
  },
  {
    text: 'Why does the unit emphasize reading extensively across fields, even outside your specialization?',
    options: ['It has no real benefit', 'It is the only way to truly increase vocabulary power and be well educated', 'It is required only for science students', 'It replaces the need for a dictionary'],
    correctOptionIndex: 1,
    explanation: 'The unit argues that reading materials outside your own field is the only way to truly increase vocabulary power and be regarded as truly educated.',
  },
  {
    text: 'In the vocabulary development units, what determines whether a word\'s meaning is scientific or non-scientific?',
    options: ['The dictionary edition used', 'The context in which the word is used', 'The length of the word', 'The number of syllables'],
    correctOptionIndex: 1,
    explanation: 'The unit explains that words such as "conclusion," "business," and "heating" can have scientific or non-scientific meanings depending on the context they appear in.',
  },
  {
    text: 'What is the overall aim of the Module 3 vocabulary units, as stated in the unit conclusions?',
    options: ['To test spelling ability only', 'To expose students to words of different academic fields and build reading habits', 'To prepare students for a spelling bee', 'To eliminate the need for reading comprehension practice'],
    correctOptionIndex: 1,
    explanation: 'The vocabulary units aim to expose students to words from various academic fields, encourage extensive reading, and show that word meanings can shift across contexts.',
  },
  {
    text: 'What reading skill from Module 1 (Unit 3) is explicitly reused in Module 3\'s study-speed reading unit for note-making?',
    options: ['The note-making format suggested earlier in the course', 'A brand-new format never used before', 'No note-making is required in Module 3', 'Only mental notes, never written'],
    correctOptionIndex: 0,
    explanation: 'The study-speed reading unit builds on the note-making format introduced in Module 1, applying it to reading passages from books.',
  },
];

// ---- Module 4: Reading Diverse Texts ----
const module4 = [
  {
    text: 'Why are narrative texts described as the most common texts students will read?',
    options: ['Because they are the shortest', 'Because they tell stories and many people enjoy interesting stories', 'Because they contain no vocabulary challenges', 'Because they are always non-fiction'],
    correctOptionIndex: 1,
    explanation: 'Narrative texts are described as the most common because they tell stories, and stories are widely enjoyed and easy to engage with.',
  },
  {
    text: 'Which of the following is listed as a characteristic of narrative texts?',
    options: ['They are always highly formal in style', 'They follow a storyline including background, plot, climax, and resolution', 'They never keep the reader in suspense', 'They must be written by scientists'],
    correctOptionIndex: 1,
    explanation: 'A key characteristic of narrative texts is that they follow a storyline: background, plot (unfolding of events), climax, and the final resolution.',
  },
  {
    text: 'What is the "climax" of a narrative text?',
    options: ['The opening background information', 'The most exciting or important event/point in the story', 'The list of references', 'The table of contents'],
    correctOptionIndex: 1,
    explanation: 'The climax is defined as the most exciting or important event or point in a story, often referred to as its most thrilling part.',
  },
  {
    text: 'How do narratives typically organize their events?',
    options: ['Randomly, with no order', 'In sequential order, often chronological', 'Only in reverse chronological order', 'Alphabetically by character name'],
    correctOptionIndex: 1,
    explanation: 'Narratives follow a sequential order, with events typically organized chronologically or by order of importance/seriousness.',
  },
  {
    text: 'How do expository texts differ from narrative texts, according to Unit 2?',
    options: ['Expository texts tell stories; narrative texts explain concepts', 'Expository texts explain issues/concepts rather than telling stories', 'They are identical in purpose', 'Expository texts are always shorter'],
    correctOptionIndex: 1,
    explanation: 'Unlike narrative texts which tell stories, expository texts explain an issue, theory, concept, or plan and do not tell stories.',
  },
  {
    text: 'What style tendency do expository texts have compared to narrative texts?',
    options: ['They are more informal with heavy use of slang', 'They are more formal, limiting contractions and colloquialisms', 'They have no formal structure at all', 'They are always written in the first person'],
    correctOptionIndex: 1,
    explanation: 'Expository texts are more formal than narrative texts; contractions, conversational style, and colloquialisms common in narratives are limited.',
  },
  {
    text: 'What is expected of the factual accuracy of expository texts?',
    options: ['Exaggeration is encouraged for effect', 'Points should be factual and supported with concrete evidence', 'Facts are optional if the writing is engaging', 'Illogicality is acceptable if brief'],
    correctOptionIndex: 1,
    explanation: 'Expository texts are expected to be factual, with all points supported by concrete evidence, avoiding exaggeration and illogicality.',
  },
  {
    text: 'Why does Unit 3 introduce reading passages that include tables?',
    options: ['Because reading-comprehension sometimes involves non-verbal forms like tables and figures, not just words', 'Because tables are unrelated to reading skills', 'Because tables replace the need for reading altogether', 'Because tables are only used in science fields'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that reading-comprehension can involve non-verbal forms such as tables, figures, and diagrams, requiring specific skills to interpret them.',
  },
  {
    text: 'What advantage does a table have over paragraphs of text, as noted in the unit?',
    options: ['A table can present facts more vividly and briefly than two or three paragraphs', 'A table is always less accurate than text', 'A table cannot present statistical data', 'A table takes longer to read than text'],
    correctOptionIndex: 0,
    explanation: 'The unit notes that what a table can convey may be more efficient and vivid than what two or three paragraphs of text could illustrate.',
  },
  {
    text: 'Why does the course include a unit on reading scientific texts, even for non-science students?',
    options: ['Because science has no relevance to other fields', 'Because the world is highly centered on scientific inventions and discoveries relevant to all fields', 'Because it is required only for medical students', 'Because scientific texts are easier than other texts'],
    correctOptionIndex: 1,
    explanation: 'The unit explains that reading scientific texts matters for all students because science dominates transport, telecommunications, medicine, agriculture, and many other spheres of life.',
  },
  {
    text: 'What is one reason given in the unit for reading scientific texts?',
    options: ['To avoid all other types of reading', 'To gain knowledge of the world and utilise scientific knowledge for growth and development', 'Because scientific texts contain no new vocabulary', 'Because they are shorter than narrative texts'],
    correctOptionIndex: 1,
    explanation: 'Reasons given include gaining knowledge of the world, understanding the by-products of scientific inventions, and utilising scientific knowledge for growth and development.',
  },
  {
    text: 'What is the focus of the final unit of the course (Unit 5, Module 4)?',
    options: ['Reading for interpretation and critical evaluation of passages', 'Basic spelling rules', 'Listening enabling skills only', 'Note-taking symbols'],
    correctOptionIndex: 0,
    explanation: 'The final unit focuses on reading for interpretation, critical analysis, and evaluation of sample reading passages, closing out the reading-comprehension component of the course.',
  },
];

const moduleQuestionSets = [module1, module2, module3, module4];

async function main() {
  console.log('Seeding Faculty of Social Science...');
  const faculty = await prisma.faculty.upsert({
    where: { name: 'Social Science' },
    update: {},
    create: { name: 'Social Science' },
  });
  console.log(`Faculty ready: ${faculty.id}`);

  console.log('Seeding departments...');
  const departmentRecords = [];
  for (const name of DEPARTMENTS) {
    let dept = await prisma.department.findFirst({
      where: { name, facultyId: faculty.id },
    });
    if (!dept) {
      dept = await prisma.department.create({
        data: { name, facultyId: faculty.id },
      });
      console.log(`  Created department: ${name}`);
    } else {
      console.log(`  Department already exists: ${name}`);
    }
    departmentRecords.push(dept);
  }

  console.log('Seeding GST101 as a shared (isGST) course...');
  let course = await prisma.course.findUnique({ where: { code: 'GST101' } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: 'GST101',
        title: 'Use of English and Communication Skills I',
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
        createdBy: 'system-seed-gst101',
        approvedBy: 'system-seed-gst101',
        approvedAt: new Date(),
      },
    });
    console.log(`  Created question bank: ${bank.id}`);
  } else {
    console.log(`  Question bank already exists: ${bank.id}, skipping question insert to avoid duplicates.`);
    console.log('  If you need to re-seed questions, delete the existing bank/questions first.');
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
  console.log(`GST101 course id: ${course.id}`);
  console.log(`Question bank id: ${bank.id}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
