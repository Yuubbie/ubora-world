// add-gst102-questions-batch2.js
// Appends a second batch of questions to the EXISTING GST102 question bank.
// Does NOT recreate the course - it looks up the existing GST102 course
// and question bank by code, then inserts new questions only. Safe to
// run once; re-running will insert duplicates.
//
// Run from the project root:
//   node add-gst102-questions-batch2.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Module 1 additions (Formal letter brevity, comparison/contrast, definitions) ----
const module1Extra = [
  {
    text: 'According to the unit, why should formal letters be kept as brief as possible?',
    options: ['Because the recipient likely has no time to read a long, rambling letter', 'Because formal letters are legally limited in length', 'Because longer letters cost more to post', 'Because brevity is required only for emails'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that a recipient without time to read a long letter is likely to set it aside for "later," so brevity helps ensure it is actually read.',
  },
  {
    text: 'Roughly how long should most formal letters be, according to the unit?',
    options: ['Rarely more than one or two pages', 'At least five pages', 'Exactly one paragraph, no more', 'There is no length guidance given'],
    correctOptionIndex: 0,
    explanation: 'Most formal letters are restricted to one or two main points and rarely exceed one page of single-spaced typing, with very few longer than two pages.',
  },
  {
    text: 'What should happen to a topic that is too complex for a normal formal letter?',
    options: ['It should generally be made the subject of a report instead', 'It should be ignored entirely', 'It should be split across ten separate letters', 'It should be written entirely in bullet points'],
    correctOptionIndex: 0,
    explanation: 'Topics too complex for the space of a usual formal letter are generally made the subject of a report, with a short covering letter if needed.',
  },
  {
    text: 'What three qualities should a formal letter have, according to the unit?',
    options: ['Clear, precise, and complete', 'Long, detailed, and repetitive', 'Emotional, persuasive, and vague', 'Technical, jargon-heavy, and formal-sounding'],
    correctOptionIndex: 0,
    explanation: 'A good formal letter should be clear, precise, and complete — giving all necessary information while avoiding unnecessary detail.',
  },
  {
    text: 'In the unit\'s example of a poorly organized business letter, what was the main problem identified?',
    options: ['It contained too many unnecessary and distracting details', 'It was too short to be understood', 'It used no punctuation at all', 'It was written in the wrong language'],
    correctOptionIndex: 0,
    explanation: 'The example letter\'s main flaw was including unnecessary, distracting details (like unrelated background information) instead of staying focused on the main points.',
  },
  {
    text: 'What technique does "comparison and contrast," covered in Unit 3, involve when developing a paragraph?',
    options: ['Showing similarities and differences between two or more things', 'Only listing dates in chronological order', 'Only using dialogue', 'Avoiding any examples'],
    correctOptionIndex: 0,
    explanation: 'Comparison and contrast is a paragraph development technique that shows similarities and differences between the things being discussed.',
  },
  {
    text: 'What does "definition" as a paragraph development technique involve, per Unit 3?',
    options: ['Clearly explaining what a term or concept means as the basis for the paragraph', 'Listing synonyms only', 'Avoiding any explanation of terms', 'Using only technical jargon'],
    correctOptionIndex: 0,
    explanation: 'Using definition as a development technique means building a paragraph around clearly explaining what a term or concept means.',
  },
  {
    text: 'What should be arranged in a "logical sequence" within a formal letter, according to the unit?',
    options: ['The main points being communicated', 'Only the greeting and signature', 'Only the postmark date', 'The font sizes used'],
    correctOptionIndex: 0,
    explanation: 'The unit stresses that the main points of a formal letter should be arranged in a logical sequence, with unnecessary details avoided.',
  },
  {
    text: 'What is emphasized as essential before writing a paragraph developed by illustration?',
    options: ['Choosing concrete, specific examples that support the main idea', 'Avoiding any specific examples', 'Writing only in the passive voice', 'Using only one-word sentences'],
    correctOptionIndex: 0,
    explanation: 'Illustration as a development technique relies on concrete, specific examples chosen to clearly support the paragraph\'s main idea.',
  },
];

// ---- Module 2 additions (Reports, job letters, summarising detail) ----
const module2Extra = [
  {
    text: 'What must be prepared first before writing a report, according to Unit 2?',
    options: ['An outline', 'The conclusion', 'A cover page', 'A bibliography'],
    correctOptionIndex: 0,
    explanation: 'The unit states that a report must be carefully planned with an outline prepared first, before the introduction, body, and conclusion are written.',
  },
  {
    text: 'When reporting on an accident, what information should be included, according to Unit 2?',
    options: ['The precise time and place, casualties/injuries, property damage, and cause', 'Only the names of witnesses', 'Only a general summary with no specific details', 'Only the writer\'s personal opinion of the incident'],
    correctOptionIndex: 0,
    explanation: 'An accident report should give the precise time and place, information about people killed or injured, property damage, and the cause of the accident.',
  },
  {
    text: 'What kind of letters does Unit 1 of Module 2 cover regarding employment?',
    options: ['Job applications, including accepting and declining offers', 'Only resignation letters', 'Only letters recommending a coworker', 'Only complaint letters about a job'],
    correctOptionIndex: 0,
    explanation: 'Unit 1 covers applications for jobs, including how to write letters accepting and declining offers.',
  },
  {
    text: 'Besides job letters, what other formal letter types are covered in Module 2, Unit 1?',
    options: ['Letters ordering goods and letters to government/organizations', 'Only postcards', 'Only wedding invitations', 'Only thank-you notes'],
    correctOptionIndex: 0,
    explanation: 'Unit 1 also covers letters ordering goods and letters addressed to government departments and other organizations.',
  },
  {
    text: 'What is the second step in writing an experimental report, after planning the experiment?',
    options: ['Arrange the apparatus', 'Write the conclusion', 'Publish the results', 'Skip to observations without setup'],
    correctOptionIndex: 0,
    explanation: 'The steps are: plan the experiment, arrange the apparatus, observe what happens, record observations, then write the report.',
  },
  {
    text: 'According to Unit 4, what is one thing a good summary must remove from the original passage?',
    options: ['Repetition or re-statement of major points', 'All punctuation', 'Every proper noun', 'The passage\'s title'],
    correctOptionIndex: 0,
    explanation: 'A key summarising technique is removing repetition or re-statement from major points or ideas in the original passage.',
  },
  {
    text: 'Why does the unit emphasize paying attention to "linking words" when summarising?',
    options: ['Because they show how ideas in a passage are systematically connected to one another', 'Because they are always removed from a summary', 'Because they determine the passage\'s word count only', 'Because they are irrelevant to meaning'],
    correctOptionIndex: 0,
    explanation: 'Linking words are important because they reveal how ideas are systematically connected, which helps a writer preserve the passage\'s logic in the summary.',
  },
  {
    text: 'What should a summary writer do with details versus main ideas, according to Unit 4?',
    options: ['Separate essential ideas from non-essential details', 'Include every detail without exception', 'Ignore the main ideas entirely', 'Focus only on statistics'],
    correctOptionIndex: 0,
    explanation: 'A core technique of summarising taught in Unit 4 is separating essential ideas from non-essential details in the original passage.',
  },
];

// ---- Module 3 additions (Sounds & speaking detail) ----
const module3Extra = [
  {
    text: 'What does the unit say about stress patterns in English words?',
    options: ['They can affect whether a speaker is understood correctly', 'They have no effect on communication', 'They only matter in written English', 'They are identical in every English word'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that the stress patterns of English words can make a speaker be understood or misunderstood.',
  },
  {
    text: 'Besides stress, what other sound pattern does Unit 1 (Letters and Sounds) introduce?',
    options: ['English intonational patterns', 'Only punctuation patterns', 'Only spelling patterns', 'Only rhyme patterns'],
    correctOptionIndex: 0,
    explanation: 'Unit 1 introduces both stress patterns and English intonational patterns as important aspects of spoken English.',
  },
  {
    text: 'What should a candidate be in control of to perform well in an interview, per Unit 3?',
    options: ['The English medium (spoken language)', 'Only their handwriting', 'Only their typing speed', 'Only their choice of clothing color'],
    correctOptionIndex: 0,
    explanation: 'Good interview performance requires being in control of the English medium, alongside knowing your subject and being mentally prepared.',
  },
  {
    text: 'Who sometimes inaugurates a seminar, according to Unit 4?',
    options: ['A distinguished person who says a few words about the theme', 'A random audience member', 'No one; seminars have no opening', 'Only the youngest participant'],
    correctOptionIndex: 0,
    explanation: 'A seminar is sometimes inaugurated by a distinguished person who briefly addresses the theme and welcomes participants.',
  },
  {
    text: 'How is a seminar typically organized, according to Unit 4?',
    options: ['Into a number of different sessions, each addressing an aspect of the main theme', 'As one single continuous session with no breaks', 'Randomly, with no structure', 'Only as a written document with no spoken component'],
    correctOptionIndex: 0,
    explanation: 'A seminar is organized into a number of different sessions, with each session dealing with a particular aspect of the main theme.',
  },
  {
    text: 'What are the three stages of a public speech covered in Unit 5?',
    options: ['Beginning, body, and conclusion', 'Introduction, footnotes, and appendix', 'Title, table of contents, and index', 'Warm-up, Q&A, and closing remarks only'],
    correctOptionIndex: 0,
    explanation: 'Unit 5 covers how to begin a public speech, how to present the body, and how to conclude it.',
  },
  {
    text: 'What is recommended as the key to producing English vowel and consonant sounds correctly, per Unit 2?',
    options: ['Constant practice of the sounds', 'Reading about the sounds without practicing aloud', 'Avoiding difficult sounds altogether', 'Only listening, never speaking'],
    correctOptionIndex: 0,
    explanation: 'The unit emphasizes that constant practice of vowel and consonant sounds is what makes a person a good speaker of English.',
  },
];

// ---- Module 4 additions (Grammar detail: concord, tenses, gerunds, passive) ----
const module4Extra = [
  {
    text: 'Which form of the verb "be" is used with "I" in the present tense?',
    options: ['am', 'is', 'are', 'were'],
    correctOptionIndex: 0,
    explanation: '"Am" is used specifically with "I" in the present tense (e.g. "I am a Nigerian").',
  },
  {
    text: 'Which form of the verb "be" is used with "he," "she," "it," and singular nouns in the present tense?',
    options: ['is', 'am', 'are', 'were'],
    correctOptionIndex: 0,
    explanation: '"Is" is used with he, she, it, and singular nouns in the present tense.',
  },
  {
    text: 'Which form of "do" is used with the third person singular?',
    options: ['does', 'do', 'did', 'doing'],
    correctOptionIndex: 0,
    explanation: '"Does" is used with the third person singular (e.g. "Does your father know?"), while "do" is used with plurals, "I," and "you."',
  },
  {
    text: 'Which form of "have" is used with the third person singular?',
    options: ['has', 'have', 'having', 'had'],
    correctOptionIndex: 0,
    explanation: '"Has" is used with the third person singular, while "have" is used with plurals and with "I" and "you."',
  },
  {
    text: 'How is the simple present tense typically formed for a third person singular subject?',
    options: ['The plain verb with -s or -es added', 'The plain verb with no changes', 'The verb "be" plus the -ing form', 'The verb "have" plus the past participle'],
    correctOptionIndex: 0,
    explanation: 'The simple present tense uses the plain infinitive form of the verb, with -s or -es added for a third person singular subject (e.g. "he speaks").',
  },
  {
    text: 'How is the present continuous tense formed?',
    options: ['A form of the verb "be" plus the -ing form of the main verb', 'The plain infinitive with -s added', 'The verb "have" plus the past participle', 'The modal auxiliary plus the base verb'],
    correctOptionIndex: 0,
    explanation: 'The present continuous tense is formed with a form of the verb "be" (agreeing with the subject) plus the -ing (present participle) form of the verb.',
  },
  {
    text: 'What does the simple present tense typically express, according to the unit?',
    options: ['Habits or things that are always true', 'Only actions happening at this exact moment', 'Only future plans', 'Only past completed actions'],
    correctOptionIndex: 0,
    explanation: 'The simple present tense is generally used for habits (e.g. "I go for a walk every morning") and things that are always true (e.g. "The sun rises in the east").',
  },
  {
    text: 'Which of the following verbs is generally NOT used in the present continuous form, even for present meaning?',
    options: ['know', 'run', 'jump', 'write'],
    correctOptionIndex: 0,
    explanation: 'Verbs like "know," "hear," "like," and "want" are generally not used in the present continuous; "I am knowing" is a common error rather than correct usage.',
  },
  {
    text: 'What is a gerund, as defined in Unit 3?',
    options: ['A verbal noun formed with the -ing ending that functions as a noun', 'A type of formal letter', 'A modal auxiliary', 'A punctuation mark'],
    correctOptionIndex: 0,
    explanation: 'A gerund is a verbal noun — a noun formed from a verb using the -ing ending — that can perform different noun functions in a sentence.',
  },
  {
    text: 'In the sentence "The building of the bridge was slow work," what role does "building" play?',
    options: ['It functions as a gerund (a noun)', 'It functions as a modal auxiliary', 'It functions as an article', 'It functions as a preposition'],
    correctOptionIndex: 0,
    explanation: 'In this sentence, "building" is a gerund functioning as the subject noun of the sentence.',
  },
  {
    text: 'What is the passive voice particularly useful for, according to Unit 4?',
    options: ['Focusing on a particular thing and creating an impersonal tone', 'Making a sentence shorter than the active voice always', 'Avoiding the use of verbs entirely', 'Replacing the need for articles'],
    correctOptionIndex: 0,
    explanation: 'The passive voice is useful for focusing attention on a particular thing (the object of the action) and for an impersonal style, such as describing a procedure.',
  },
  {
    text: 'When is the passive voice especially useful, according to the unit\'s examples?',
    options: ['When explaining a procedure impersonally, without naming who performed the action', 'Only when writing personal letters', 'Only in public speeches', 'Only in poetry'],
    correctOptionIndex: 0,
    explanation: 'The unit shows the passive voice being used to explain procedures (like manufacturing oil or printing a report) impersonally, without focus on who specifically performed each action.',
  },
];

// ---- Module 1 additions batch 3 (Mechanics of writing a formal letter) ----
const module1Extra2 = [
  {
    text: 'What is the recommended first step when drafting a formal letter, according to the unit?',
    options: ['Prepare an outline of the points you wish to make', 'Type the final copy immediately', 'Choose the envelope colour', 'Write the closing signature first'],
    correctOptionIndex: 0,
    explanation: 'The unit recommends preparing an outline first — jotting down the points you wish to make and the order you want to say them in.',
  },
  {
    text: 'Into how many main parts does the unit suggest organizing the content of a formal letter?',
    options: ['Three: why you\'re writing, the important facts, and what you want the reader to do', 'Ten separate sections', 'Only one continuous paragraph', 'Five, matching the five paragraph essay format'],
    correctOptionIndex: 0,
    explanation: 'The unit suggests organizing a formal letter into three parts: saying why you\'re writing, highlighting the important facts, and describing what you want the reader to do.',
  },
  {
    text: 'What should be checked when reviewing the rough draft of a formal letter?',
    options: ['Mistakes in grammar, spelling, and punctuation', 'Only the paper size', 'Only the envelope quality', 'Only the date format'],
    correctOptionIndex: 0,
    explanation: 'After drafting, the unit advises going over the rough draft carefully to check for mistakes in grammar, spelling, and punctuation.',
  },
  {
    text: 'What paper size does the unit recommend for typing formal letters?',
    options: ['A4', 'A3', 'Foolscap only', 'Any size is acceptable'],
    correctOptionIndex: 0,
    explanation: 'The unit recommends typing on unruled white paper of A4 size, with envelopes of good quality, for a professional appearance.',
  },
  {
    text: 'According to the unit, what may influence a recipient who has never met the letter writer in person?',
    options: ['The appearance of the letter', 'The time of day it was posted', 'The brand of pen used', "The writer's home address alone"],
    correctOptionIndex: 0,
    explanation: 'The unit notes that the appearance of an official or business letter can strongly influence a recipient who has never seen the writer.',
  },
];

// ---- Module 4 additions batch 3 (More grammar detail) ----
const module4Extra2 = [
  {
    text: 'Which modal auxiliary is most associated with expressing strong obligation?',
    options: ['Must', 'Might', 'Could', 'Would'],
    correctOptionIndex: 0,
    explanation: '"Must" is associated with strong obligation, distinguishing it from softer forms like "should" or "ought to."',
  },
  {
    text: 'Which modal auxiliary listed in the unit expresses a weaker degree of obligation than "must"?',
    options: ['Ought to', 'Can', 'Will', 'Is'],
    correctOptionIndex: 0,
    explanation: '"Ought to" (along with "should") expresses a weaker sense of obligation compared to the stronger "must."',
  },
  {
    text: 'What is a common cause of Nigerian English speakers misusing modal auxiliaries, according to the unit?',
    options: ['Their native Nigerian languages do not draw the same fine distinctions', 'Modal auxiliaries do not exist in any Nigerian language', 'They are taught incorrectly at every level', 'English has no modal auxiliaries at all'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that many Nigerian speakers misuse modal auxiliaries because their native languages do not make the same fine distinctions English does.',
  },
  {
    text: 'What does the unit say about the position of the infinitive ("to + verb") within a sentence?',
    options: ['It can appear in different positions, each carrying a slightly different emphasis', 'It must always appear at the very start of a sentence', 'It can never appear at the end of a sentence', 'It is only used in questions'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that the infinitive can occupy different positions within a sentence, with each position carrying a slightly different shade of emphasis.',
  },
];

// ---- Module 2 additions batch 3 (Report language and letters) ----
const module2Extra2 = [
  {
    text: 'What kind of language style does the unit recommend for report writing?',
    options: ['Clear, concrete, and precise, avoiding jargon and roundabout expressions', 'Highly emotional and persuasive language', 'As much technical jargon as possible', 'Long, elaborate, poetic sentences'],
    correctOptionIndex: 0,
    explanation: 'The unit advises that reports should use clear, concrete, precise language, avoiding jargon and roundabout ways of expressing ideas.',
  },
  {
    text: 'When declining a job offer in a formal letter, what tone does the unit suggest maintaining?',
    options: ['Polite and professional, even while declining', 'Blunt and dismissive', 'Overly emotional', 'Vague, without giving any reason at all'],
    correctOptionIndex: 0,
    explanation: 'The unit covers writing letters declining a job offer while maintaining a polite, professional tone appropriate to formal correspondence.',
  },
  {
    text: 'What must be recorded during an experiment before the report can be written, according to Unit 3?',
    options: ['The observations made during the experiment', 'Only the final numerical result', 'Only the researcher\'s personal feelings', 'Nothing; reports are written from memory only'],
    correctOptionIndex: 0,
    explanation: 'The unit\'s sequence for experimental reports includes recording observations as a distinct step before the report itself is written.',
  },
];

// ---- Module 3 additions batch 2 (Interviews and speech detail) ----
const module3Extra2 = [
  {
    text: 'What does making a good first impression in an interview typically involve, according to the unit?',
    options: ['Appropriate dress and presentation', 'Arriving as late as possible', 'Avoiding eye contact throughout', 'Refusing to answer personal questions'],
    correctOptionIndex: 0,
    explanation: 'The unit notes that appropriate dress and presentation contribute to making a good first impression on an interview board.',
  },
  {
    text: 'What is the overall purpose of an interview board\'s questioning, according to Unit 3?',
    options: ['To assess whether the candidate has the proper qualities for the job', 'To trick the candidate into failing', 'To test unrelated general knowledge only', 'To determine the candidate\'s handwriting quality'],
    correctOptionIndex: 0,
    explanation: 'The core purpose of an interview board is to test whether the candidate has the proper qualities required for the job in question.',
  },
];

// ---- Module 1 additions batch 4 (Formal letter format/layout) ----
const module1Extra3 = [
  {
    text: 'In the standard formal letter format shown in the unit, what appears at the very top of the letter?',
    options: ["The writer's own address (heading)", 'The recipient\'s signature', 'The complementary close', 'The body of the letter'],
    correctOptionIndex: 0,
    explanation: "The heading, containing the writer's own address, appears at the top of a standard formal letter, followed by the date.",
  },
  {
    text: 'Where does the date typically appear in a standard formal letter layout?',
    options: ["Just below the writer's own address (heading)", 'At the very bottom of the letter', 'Inside the body paragraph', 'Next to the recipient\'s name only'],
    correctOptionIndex: 0,
    explanation: "In the standard layout shown, the date is placed just below the writer's own address at the top of the letter.",
  },
  {
    text: 'What closing phrase is used when a formal letter opens with "Dear Sir" (not addressed by name)?',
    options: ['Yours faithfully', 'Yours sincerely', 'Best regards only', 'With love'],
    correctOptionIndex: 0,
    explanation: 'Formal letters opening with an impersonal salutation like "Dear Sir" conventionally close with "Yours faithfully," while letters addressed by name often close with "Yours sincerely."',
  },
  {
    text: 'What is the purpose of a reference number (e.g. "Your Ref. No.") in a formal letter?',
    options: ["To refer back to the recipient's own earlier correspondence or file", 'To indicate the letter\'s price', 'To replace the need for a date', 'To serve as the writer\'s signature'],
    correctOptionIndex: 0,
    explanation: 'A reference number allows the recipient to quickly match the letter to their own earlier correspondence or internal filing system.',
  },
];

const moduleQuestionSets = [
  { module: 1, questions: [...module1Extra, ...module1Extra2, ...module1Extra3] },
  { module: 2, questions: [...module2Extra, ...module2Extra2] },
  { module: 3, questions: [...module3Extra, ...module3Extra2] },
  { module: 4, questions: [...module4Extra, ...module4Extra2] },
];

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'GST102' } });
  if (!course) {
    console.error('GST102 course not found. Run seed-gst102.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const bank = await prisma.questionBank.findFirst({ where: { courseId: course.id } });
  if (!bank) {
    console.error('No question bank found for GST102. Run seed-gst102.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found GST102 course (${course.id}) and question bank (${bank.id}).`);

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
  console.log(`GST102 question bank total is now: ${finalCount}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Batch insert failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
