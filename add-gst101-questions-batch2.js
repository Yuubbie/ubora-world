// add-gst101-questions-batch2.js
// Appends a second batch of questions to the EXISTING GST101 question bank.
// Does NOT recreate the Faculty, Departments, or Course - it looks up the
// existing GST101 course and question bank by code, then inserts new
// questions only. Safe to run once; re-running will insert duplicates,
// so only run this a single time.
//
// Run from the project root:
//   node add-gst101-questions-batch2.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Module 1 additions (Units 1-5: Listening Skills) ----
const module1Extra = [
  {
    text: 'What is the difference between "day to day activity" listening and "listening for specific purposes"?',
    options: ['They are the same thing', 'The latter includes gathering information, directions, and critical evaluation of a speaker', 'The former only happens at work', 'The latter never involves academic lectures'],
    correctOptionIndex: 1,
    explanation: 'Listening for specific purposes includes gathering information, listening for directions, academic lectures, and critically evaluating what a speaker says.',
  },
  {
    text: 'Which requirement is listed as necessary for active listening, regardless of location?',
    options: ['A quiet private office', 'Functioning ears', 'A written transcript', 'A second listener present'],
    correctOptionIndex: 1,
    explanation: 'The unit lists functioning ears as one of the basic requirements for active listening, alongside concentration and the ability to anticipate.',
  },
  {
    text: 'According to Unit 2, what can hinder comprehension while listening?',
    options: ['Factors that were outlined as hindering comprehension during the listening process', 'Only physical deafness', 'Comprehension is never hindered once you are listening', 'Reading too fast'],
    correctOptionIndex: 0,
    explanation: 'Unit 2 explicitly covers factors that hinder comprehension during listening, which learners are advised to keep in mind while studying.',
  },
  {
    text: 'What is one difference between casual listening and listening with proper attention, as demonstrated in Unit 2?',
    options: ['There is no difference in outcome', 'Casual listening yields only major points; attentive listening captures specific details', 'Casual listening always yields more detail', 'Proper attention only applies to written texts'],
    correctOptionIndex: 1,
    explanation: 'The unit shows that casual listening produces minimal comprehension of only major points, while listening with proper attention allows capture of specific details.',
  },
  {
    text: 'In note-taking (Unit 3), what should be done with irrelevant information from a lecture?',
    options: ['It should be written down in full for completeness', 'It should always be removed from the notes', 'It should replace the main heading', 'It should be recorded but never read again'],
    correctOptionIndex: 1,
    explanation: 'A key "do" of note-taking is to always remove irrelevances rather than writing down everything the lecturer says.',
  },
  {
    text: 'What formatting habits are recommended for making notes attractive and easy to learn from?',
    options: ['Writing in a single dense block of text', 'Neatness, consistent headings/sub-headings, and good handwriting', 'Avoiding all punctuation', 'Never using capitalisation'],
    correctOptionIndex: 1,
    explanation: 'The unit recommends neatness, systematic organisation, and consistent use of headings and sub-headings to make notes attractive and easy to learn from.',
  },
  {
    text: 'Through listening-comprehension and information retrieval (Unit 4), which is an example of information type covered?',
    options: ['Only fictional stories', 'Instructions and directions', 'Only song lyrics', 'Only grammar rules'],
    correctOptionIndex: 1,
    explanation: 'Unit 4 covers retrieving instructions, directions, and facts as types of information obtainable through listening-comprehension.',
  },
  {
    text: 'What general impression-forming skill does Unit 4 teach?',
    options: ['Forming a general impression from various sets of information at your disposal', 'Ignoring all information sets', 'Memorising verbatim only', 'Skipping information retrieval entirely'],
    correctOptionIndex: 0,
    explanation: 'Unit 4 teaches how to form a general impression by combining various sets of information gathered through listening.',
  },
  {
    text: 'In Unit 5, how should a listener retrieve information presented as figures during a listening exercise?',
    options: ['By ignoring numerical data', 'By paying special attention to the figures/data presented and tracing them on the figure', 'By waiting until after the exercise to check figures', 'Figures are not covered in this unit'],
    correctOptionIndex: 1,
    explanation: 'Unit 5 teaches retrieving information from figures through paying special attention to the data presented and tracing it on the relevant figure.',
  },
  {
    text: 'How should a listener handle charts and tables during a listening-comprehension exercise, per Unit 5?',
    options: ['By filling in the charts and tables as you listen', 'By skipping them entirely', 'By only reviewing them the next day', 'Charts and tables are not part of this unit'],
    correctOptionIndex: 0,
    explanation: 'Unit 5 explains that charts and tables are handled by filling them in as you listen to the relevant information being presented.',
  },
];

// ---- Module 2 additions (Units 6-10: Main Idea, Critical Eval, Effective Reading, Skim/Scan, Varying Speed I) ----
const module2Extra = [
  {
    text: 'Why is determining the main idea important for exam preparation, according to Unit 6?',
    options: ['It has no relevance to exams', 'It helps you know what to study and reduces excessive, unfocused study time', 'It is only useful for essay-writing courses', 'It replaces the need to attend lectures'],
    correctOptionIndex: 1,
    explanation: 'The unit explains that knowing the main idea helps determine what to study for exams, reducing wasted study time and eventual confusion during the exam.',
  },
  {
    text: 'What common mistake does the unit warn against regarding main ideas and supporting details?',
    options: ['Trying to learn everything, both main ideas and every supporting detail, without distinction', 'Focusing only on main ideas', 'Ignoring supporting details entirely', 'Writing only in point form'],
    correctOptionIndex: 0,
    explanation: 'The unit warns against the common mistake of trying to learn everything indiscriminately, both facts/fables and main ideas/supporting details, which leads to burnout.',
  },
  {
    text: 'Which is one way speakers signal the main idea, according to Unit 6?',
    options: ['By announcing it in the title of the talk or lecture', 'By speaking only in a monotone voice', 'By avoiding eye contact', 'By using only technical jargon'],
    correctOptionIndex: 0,
    explanation: 'One method covered is that speakers may announce the main idea directly in the title of the talk or lecture, though this is not always the case.',
  },
  {
    text: 'Which phrase is given as an example of a speaker calling attention to a main idea in the body of a lecture?',
    options: ['"By the way"', '"The crucial issue we are grappling with is..."', '"Once upon a time"', '"The end"'],
    correctOptionIndex: 1,
    explanation: 'Phrases like "the crucial issue we are grappling with is," "the most important point is," and "let\'s go to the point" signal main ideas within a lecture body.',
  },
  {
    text: 'What is the key difference between interpretation and critical analysis, as explained in Unit 7?',
    options: ['They are identical processes', 'Interpretation derives meaning from what is said; critical analysis weighs merits and demerits', 'Critical analysis only applies to written texts', 'Interpretation never involves inferencing'],
    correctOptionIndex: 1,
    explanation: 'Interpretation involves deriving meaning (surface and deeper) from what is said, while critical analysis involves weighing merits and demerits to determine strengths and weaknesses.',
  },
  {
    text: 'What does critical analysis and evaluation involve, according to Unit 7?',
    options: ['Passing value judgements, making generalisations, and drawing conclusions after careful analysis', 'Simply repeating what was heard', 'Avoiding all judgement of the material', 'Only summarising facts without opinion'],
    correctOptionIndex: 0,
    explanation: 'The unit defines critical analysis and evaluation as involving value judgements, generalisations, and conclusions drawn after careful, deliberate analysis.',
  },
  {
    text: 'According to Unit 7, what does "interpretation" involve beyond surface meaning?',
    options: ['Inferencing and thinking between and beyond what has been said', 'Only repeating the speaker\'s exact words', 'Ignoring the deeper meaning entirely', 'Translating into another language'],
    correctOptionIndex: 0,
    explanation: 'Interpretation involves inferencing — thinking between and beyond what was explicitly said — to establish trends and deeper meaning.',
  },
  {
    text: 'What is the importance of reading, as emphasized at the start of Unit 8 (Effective Reading)?',
    options: ['Reading has no academic value', 'Effective reading strategies improve comprehension and academic performance', 'Reading is only relevant for literature students', 'Reading should always be done at maximum speed'],
    correctOptionIndex: 1,
    explanation: 'Unit 8 stresses the importance of reading and systematically presents strategies for effective reading to improve comprehension.',
  },
  {
    text: 'Which is a recommended step for effective reading, according to Unit 8?',
    options: ['Deciding the purpose of reading before you begin', 'Reading without any specific goal', 'Avoiding note formation entirely', 'Reading the conclusion only'],
    correctOptionIndex: 0,
    explanation: 'One key step for effective reading is deciding your purpose for reading before starting, which shapes how you approach the material.',
  },
  {
    text: 'What role does "forming a guiding question" play in effective reading?',
    options: ['It has no real function', 'It guides your reading and helps you stay focused as you read along', 'It replaces the need to read the passage', 'It is only used in scientific texts'],
    correctOptionIndex: 1,
    explanation: 'Asking yourself a guiding question is one of the effective reading steps, helping direct your attention and comprehension as you read.',
  },
  {
    text: 'Skimming, as defined in Unit 9, is best described as which type of reading speed?',
    options: ['The slowest reading speed for detailed study', 'The fastest reading speed used for a general idea or overview', 'A speed used exclusively for scientific texts', 'A speed reserved only for exam conditions'],
    correctOptionIndex: 1,
    explanation: 'Skimming is described as the fastest reading speed, used to get a general idea, impression, overview, or gist without needing high comprehension.',
  },
  {
    text: 'What does the unit warn happens if you take more than the allotted time (e.g. 3 minutes) while attempting to skim a passage?',
    options: ['You are still skimming correctly', 'You are likely reading at average speed instead of skimming', 'Skimming has no time constraint', 'The passage becomes easier to understand'],
    correctOptionIndex: 1,
    explanation: 'The unit notes that if skimming takes longer than the allotted time, the reader is probably reading at average speed rather than truly skimming.',
  },
  {
    text: 'According to Unit 9, does reading more slowly always guarantee better comprehension?',
    options: ['Yes, slower reading always improves comprehension', 'No — research shows the slower you read is not necessarily correlated with higher comprehension', 'Comprehension is unrelated to reading speed in all cases', 'Only skimming guarantees comprehension'],
    correctOptionIndex: 1,
    explanation: 'The unit explicitly warns that research studies show you are not necessarily gaining more comprehension simply because you are reading more slowly.',
  },
  {
    text: 'Which reading speed is described as suited for novels read largely for enjoyment?',
    options: ['Study speed', 'Average reading speed', 'Skimming speed exclusively', 'No speed is specified for novels'],
    correctOptionIndex: 1,
    explanation: 'Average reading speed is described as suited for materials requiring intensive reading and comprehension but easier than textbooks, such as many novels.',
  },
  {
    text: 'What foundational reading skills does Unit 10 (Reading and Comprehending at Varying Speed Levels I) build on?',
    options: ['Skimming and scanning', 'Only listening skills', 'Only vocabulary lists', 'Note-taking symbols only'],
    correctOptionIndex: 0,
    explanation: 'Unit 10 builds directly on the skimming and scanning skills taught in the previous unit, extending them into varying reading speed practice.',
  },
];

// ---- Module 3 additions (Units 11-15: Study-Speed Reading & Vocabulary) ----
const module3Extra = [
  {
    text: 'What is "study-type" reading speed, as covered in Unit 11?',
    options: ['The fastest possible reading speed', 'The slowest, most detailed reading speed used for proper understanding', 'A speed only used for skimming novels', 'A speed with no connection to comprehension'],
    correctOptionIndex: 1,
    explanation: 'Study-type reading speed is the slowest reading speed, requiring high concentration and attention to detail for proper understanding.',
  },
  {
    text: 'What additional skill does Unit 11 combine with study-speed reading practice?',
    options: ['Note-making from books', 'Public speaking', 'Listening comprehension only', 'Grammar correction exercises'],
    correctOptionIndex: 0,
    explanation: 'Unit 11 combines study-type reading speed practice with note-making from books, reusing the note-making format introduced earlier in the course.',
  },
  {
    text: 'What phrase does the unit use to summarise the goal of increasing reading speed responsibly?',
    options: ['"Read fast, understand later"', '"Speed and accuracy is the watchword"', '"Comprehension is optional"', '"Only speed matters"'],
    correctOptionIndex: 1,
    explanation: 'The unit\'s closing advice is that "speed and accuracy is the watchword" as students work on increasing their reading speed.',
  },
  {
    text: 'What is "word attack," as introduced in Unit 12 for finding word meanings?',
    options: ['A strategy for determining meaning using searching round the passage and other cues', 'A method for memorising a dictionary', 'A grammar rule', 'A punctuation technique'],
    correctOptionIndex: 0,
    explanation: 'Word attack is introduced as a strategy for determining a word\'s meaning, alongside searching the surrounding passage for contextual clues.',
  },
  {
    text: 'What is emphasized as important for increasing "vocabulary power," per Unit 12\'s objectives?',
    options: ['Avoiding new or unfamiliar words', 'Applying different ways of finding word meaning from context', 'Memorising isolated word lists only', 'Relying solely on translation'],
    correctOptionIndex: 1,
    explanation: 'Unit 12\'s objectives include applying different ways of finding the meaning of words in their contexts to build vocabulary power.',
  },
  {
    text: 'Which additional strategy does Unit 13 introduce for determining word meanings, beyond word attack and context search?',
    options: ['Lexical familiarisation and drawing on past experience', 'Ignoring the dictionary completely', 'Guessing randomly with no method', 'Translating into a foreign language first'],
    correctOptionIndex: 0,
    explanation: 'Unit 13 introduces lexical familiarisation and using your past experiences as additional strategies for determining word meanings, plus effective dictionary use.',
  },
  {
    text: 'Unit 14 covers vocabulary associated with which set of academic fields?',
    options: ['Psychology, law, medical/paramedical, and education', 'Only mathematics and physics', 'Only sports science', 'Only music theory'],
    correctOptionIndex: 0,
    explanation: 'Unit 14 exposes students to vocabulary items associated with psychology, the legal field, medical and paramedical fields, and education.',
  },
  {
    text: 'What is the stated purpose of exposing students to vocabulary from fields outside their own specialization?',
    options: ['To discourage reading outside one\'s major', 'To expose students to other fields, build extensive reading habits, and show that word meanings shift by context', 'It serves no clear academic purpose', 'To replace core coursework'],
    correctOptionIndex: 1,
    explanation: 'The stated aims are to expose students to other fields, build a habit of extensive reading, and demonstrate that word meanings can change depending on academic context.',
  },
  {
    text: 'Unit 15 covers vocabulary items associated with which fields?',
    options: ['Arts, accounting, and natural sciences', 'Only agriculture', 'Only computer programming', 'Only foreign languages'],
    correctOptionIndex: 0,
    explanation: 'Unit 15 teaches vocabulary items associated with the arts, accounting, and natural sciences, continuing from Unit 14.',
  },
  {
    text: 'According to Unit 15, what determines whether accounting-associated words like "continuous" or "primary" carry a different meaning?',
    options: ['The font used in the passage', 'The context in which the word is used', 'The length of the sentence', 'The reader\'s native language'],
    correctOptionIndex: 1,
    explanation: 'The unit notes that words associated with accounting can be used in other fields, with their meaning shifting depending on the context.',
  },
];

// ---- Module 4 additions (Units 16-20: Reading Diverse Texts) ----
const module4Extra = [
  {
    text: 'What experiences do stories typically portray, according to Unit 16 (Narratives)?',
    options: ['Only positive experiences like joy', 'A range including joy, sadness, conflict, suffering, greed, and affluence', 'Only conflict and destruction', 'Narratives do not portray any emotional experience'],
    correctOptionIndex: 1,
    explanation: 'Unit 16 explains that stories give readers various experiences including joy, sadness, conflict, destruction, suffering, affluence, and greed, which often develop into the story\'s theme.',
  },
  {
    text: 'How does reading narrative stories benefit a reader\'s vocabulary, according to Unit 16?',
    options: ['It has no effect on vocabulary', 'Reading extensively exposes readers to many new words and expressions', 'Narratives use only basic, repetitive vocabulary', 'Vocabulary growth only comes from textbooks'],
    correctOptionIndex: 1,
    explanation: 'The unit notes that reading stories increases vocabulary power because readers come across many new words and expressions through extensive reading.',
  },
  {
    text: 'What quality keeps a reader engaged throughout a good narrative, per Unit 16?',
    options: ['Predictability from the very first page', 'Suspense that is gradually unfolded until the end', 'A complete absence of conflict', 'Repetition of the same event throughout'],
    correctOptionIndex: 1,
    explanation: 'A good narrative keeps the reader in suspense, gradually unfolding a mystery or tension until it is resolved by the end of the story.',
  },
  {
    text: 'What organizational pattern do narrative texts generally follow, according to Unit 16?',
    options: ['No particular order', 'A sequential order, often chronological', 'Strictly alphabetical order', 'Random ordering of events for effect'],
    correctOptionIndex: 1,
    explanation: 'Narrative texts follow a sequential order, with events typically organized chronologically or by order of importance/seriousness.',
  },
  {
    text: 'What is the core purpose of an expository text, as defined in Unit 17?',
    options: ['To tell an entertaining story', 'To explain an issue, theory, concept, or plan', 'To provide only personal opinions with no support', 'To replace narrative texts entirely'],
    correctOptionIndex: 1,
    explanation: 'Expository texts are defined as reading materials that explain an issue, theory, concept, or plan — they do not tell stories.',
  },
  {
    text: 'Which feature distinguishes expository texts stylistically from narrative texts?',
    options: ['Expository texts are more informal', 'Expository texts are more formal, with limited contractions and colloquialisms', 'They have identical style requirements', 'Expository texts are always written in dialogue form'],
    correctOptionIndex: 1,
    explanation: 'Expository texts are more formal than narrative texts; contractions and colloquialisms common in narratives are limited in expository writing.',
  },
  {
    text: 'What standard of accuracy is expected of expository texts, according to Unit 17?',
    options: ['Exaggeration is encouraged to persuade the reader', 'Points should be factual and supported with concrete evidence', 'Accuracy is optional if the writing style is strong', 'Illogicality is acceptable in short passages'],
    correctOptionIndex: 1,
    explanation: 'Expository texts are expected to be factual, with all points guarded jealously for truth and supported with concrete evidence.',
  },
  {
    text: 'Why does Unit 18 introduce reading passages mixed with tables and diagrams?',
    options: ['Because reading-comprehension can involve non-verbal forms, not just words', 'Because tables replace the need to read text entirely', 'Because tables are irrelevant to comprehension', 'Because only science students need this skill'],
    correctOptionIndex: 0,
    explanation: 'Unit 18 explains that some reading-comprehension activities involve non-verbal or concrete materials like tables, figures, and diagrams alongside text.',
  },
  {
    text: 'What advantage does presenting information in a table offer over paragraphs of prose, per Unit 18?',
    options: ['A table can present facts vividly and briefly, sometimes more than two or three paragraphs could', 'Tables are always less accurate than prose', 'Tables cannot present statistical data', 'Tables take longer to interpret than equivalent prose'],
    correctOptionIndex: 0,
    explanation: 'The unit notes that what a table conveys may be more efficient and vivid than what two or three paragraphs of prose could illustrate.',
  },
  {
    text: 'Why does the course require reading scientific texts even for non-science majors, according to Unit 19?',
    options: ['Because science has no bearing on other fields', 'Because science dominates transport, telecommunications, medicine, agriculture, and many other spheres of life', 'Because scientific texts are always shorter', 'Because it satisfies an unrelated grammar requirement'],
    correctOptionIndex: 1,
    explanation: 'Unit 19 explains that science dominates nearly every sphere of life, so reading scientific texts benefits students regardless of their specialization.',
  },
  {
    text: 'Which is listed as a reason for reading scientific texts in Unit 19?',
    options: ['To gain knowledge of the world and utilise scientific knowledge for growth and development', 'To avoid reading any other type of text', 'Because scientific texts contain no new vocabulary', 'Because they require no comprehension skill'],
    correctOptionIndex: 0,
    explanation: 'Reasons given include gaining knowledge of the world, understanding scientific inventions, and utilising scientific knowledge for growth and development.',
  },
  {
    text: 'What is the first stage of reading for interpretation, according to the final unit (Unit 20)?',
    options: ['Reading and understanding the passage very well before attempting interpretation', 'Skipping straight to forming an opinion', 'Reading only the introduction', 'Memorising the passage word for word'],
    correctOptionIndex: 0,
    explanation: 'Unit 20 explains that the first stage of reading for interpretation is reading and understanding the passage thoroughly, since interpretation is impossible without basic understanding.',
  },
  {
    text: 'What does the second stage of reading for interpretation involve, per Unit 20?',
    options: ['Reading between and above the lines to infer what is implicitly stated', 'Ignoring anything not explicitly stated', 'Rewriting the passage in your own words only', 'Comparing the passage to an unrelated text'],
    correctOptionIndex: 0,
    explanation: 'The second stage involves reading between and above the lines to determine what the writer has stated and infer what has not been explicitly stated.',
  },
  {
    text: 'Which type of question is suggested for reading critically, according to Unit 20?',
    options: ['"To what extent?" and "How effective or successful?"', '"What color is the cover?"', '"How many pages does this have?"', '"Who published this book?"'],
    correctOptionIndex: 0,
    explanation: 'Unit 20 suggests critical-reading questions such as "to what extent," "how important or relevant," and "how effective or successful."',
  },
  {
    text: 'What reading speed is recommended when reading for critical analysis and evaluation, according to Unit 20?',
    options: ['The fastest possible speed (skimming)', 'A careful, study reading speed', 'No particular speed is recommended', 'Only audio playback speed'],
    correctOptionIndex: 1,
    explanation: 'The unit specifies that reading for critical analysis and evaluation should be done carefully, usually at a study reading speed.',
  },
];

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'GST101' } });
  if (!course) {
    console.error('GST101 course not found. Run seed-gst101.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const bank = await prisma.questionBank.findFirst({ where: { courseId: course.id } });
  if (!bank) {
    console.error('No question bank found for GST101. Run seed-gst101.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found GST101 course (${course.id}) and question bank (${bank.id}).`);

  const batches = [
    { module: 1, questions: module1Extra },
    { module: 2, questions: module2Extra },
    { module: 3, questions: module3Extra },
    { module: 4, questions: module4Extra },
  ];

  let totalInserted = 0;
  for (const { module, questions } of batches) {
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
  console.log(`GST101 question bank total is now: ${finalCount}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Batch insert failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
