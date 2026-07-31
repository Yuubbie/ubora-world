// seed-gst102.js
// Seeds GST102 as a shared (isGST) course under Social Science, 100L 2nd
// Semester, with a 48-question CBT bank across 4 modules. Faculty and
// departments already exist from seed-gst101.js, so this script only
// creates the course + question bank.
//
// Run from the project root:
//   node seed-gst102.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Module 1: Writing Paragraphs & Formal Letters I ----
const module1 = [
  {
    text: 'What is a topic sentence?',
    options: ['The last sentence of any essay', "A sentence expressing the paragraph's central, controlling idea", 'A sentence with no relation to the paragraph', 'A sentence used only in formal letters'],
    correctOptionIndex: 1,
    explanation: 'A topic sentence expresses the central, controlling idea or theme of a paragraph.',
  },
  {
    text: 'Where is a topic sentence most frequently found in a paragraph?',
    options: ['Always in the middle', 'At the beginning', 'Always at the end', 'It never appears in a paragraph'],
    correctOptionIndex: 1,
    explanation: 'The topic sentence is most frequently found at the beginning, though it can sometimes appear at the end, in the middle, or be implied rather than stated.',
  },
  {
    text: 'What does it mean for a paragraph to be "coherent"?',
    options: ['It uses difficult vocabulary', 'The writer takes the reader logically and smoothly from one idea to the next', 'It has no topic sentence', 'It is written in the passive voice'],
    correctOptionIndex: 1,
    explanation: 'A coherent paragraph is one where the reader can clearly recognize that one sentence logically leads to the next.',
  },
  {
    text: 'Which of the following is a transitional device used to express contrast?',
    options: ['"Therefore"', '"For example"', '"However"', '"Firstly"'],
    correctOptionIndex: 2,
    explanation: 'Words like "but," "yet," "however," and "nevertheless" express contrast; "therefore" expresses result, and "for example" introduces examples.',
  },
  {
    text: 'What function do transitional devices serve in a paragraph?',
    options: ['They replace the need for a topic sentence', 'They act as signposts showing how one sentence relates to another', 'They are only used in scientific writing', 'They make a paragraph longer without adding meaning'],
    correctOptionIndex: 1,
    explanation: 'Transitional devices act like signposts, helping the writer move smoothly from one sentence to the next and showing the logical relationship between them.',
  },
  {
    text: 'Which techniques are covered in Unit 2 for developing a paragraph?',
    options: ['Illustration and description', 'Only dialogue', 'Only rhyme scheme', 'Footnoting only'],
    correctOptionIndex: 0,
    explanation: 'Unit 2 focuses on using illustration and description as techniques for developing paragraphs.',
  },
  {
    text: 'Which additional techniques for developing paragraphs are introduced in Unit 3?',
    options: ['Cause and effect, definition, and comparison and contrast', 'Only rhyme and rhythm', 'Only dialogue writing', 'Only footnotes and citations'],
    correctOptionIndex: 0,
    explanation: 'Unit 3 covers cause and effect, definition, and comparison and contrast as further techniques for paragraph development.',
  },
  {
    text: 'What are the essentials of a formal letter covered in Unit 4?',
    options: ['Formal style, the distinction between formal and informal letters, essentials, and mechanics of writing', 'Only the closing signature', 'Only the date format', 'Only the choice of paper size'],
    correctOptionIndex: 0,
    explanation: 'Unit 4 covers formal style of communication, the distinction between formal and informal letters, the essentials of formal letters, and the mechanics of writing them.',
  },
  {
    text: 'What types of formal letters does Unit 5 focus on?',
    options: ['Letters of complaint and letters of request', 'Only love letters', 'Only letters of resignation', 'Only letters to newspapers'],
    correctOptionIndex: 0,
    explanation: 'Unit 5 covers how to write letters of complaint and letters of request, along with the appropriate language for these purposes.',
  },
  {
    text: 'Why does the course guide say mastering the paragraph is essential to all forms of writing?',
    options: ['Because longer pieces of writing are made up of a series of related paragraphs', 'Because paragraphs are graded separately from essays', 'Because paragraphs are only used in letters', 'Because paragraphs replace the need for grammar'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that all longer pieces of writing (letters, reports, articles) contain a series of related paragraphs, making paragraph mastery foundational.',
  },
  {
    text: 'Besides logical flow, what else does paragraph division help prevent, according to the unit?',
    options: ['Grammar mistakes', 'Boredom, by providing a physical break on the page', 'Spelling errors', 'The need for a topic sentence'],
    correctOptionIndex: 1,
    explanation: 'The unit notes that dividing writing into paragraphs also prevents boredom by providing a physical break on the page.',
  },
  {
    text: 'Which category of transitional device would the phrase "as a result" belong to?',
    options: ['Expressing result', 'Expressing contrast', 'Indicating time', 'Expressing addition'],
    correctOptionIndex: 0,
    explanation: '"As a result," along with "therefore," "consequently," "thus," and "hence," is used to express result.',
  },
];

// ---- Module 2: Formal Letters II, Reports & Summaries ----
const module2 = [
  {
    text: 'What types of formal letters are covered in Module 2, Unit 1?',
    options: ['Job applications, ordering goods, and letters to government/organizations', 'Only birthday cards', 'Only postcards', 'Only text messages'],
    correctOptionIndex: 0,
    explanation: 'Unit 1 of Module 2 covers letters applying for jobs (accepting/declining offers), letters ordering goods, and letters to government and other organizations.',
  },
  {
    text: 'What is a report, as defined in Unit 2 (Writing Reports I)?',
    options: ['An account of events, experiences, etc.', 'A type of poem', 'A form of advertisement', 'A type of formal letter only'],
    correctOptionIndex: 0,
    explanation: 'A report is defined as an account of events, experiences, or similar matters that needs to be carefully planned with an outline first.',
  },
  {
    text: 'What are the three main parts of a report, according to Unit 2?',
    options: ['Introduction, body, and conclusion', 'Title, glossary, and index', 'Preface, chapters, and appendix', 'Summary, references, and footnotes'],
    correctOptionIndex: 0,
    explanation: 'A report is structured around three main parts: the introduction, the body, and the conclusion.',
  },
  {
    text: 'What style of language should a report use, according to the unit?',
    options: ['Clear, concrete, and precise, avoiding jargon', 'As much jargon as possible', 'Highly poetic and figurative', 'Long and roundabout expressions'],
    correctOptionIndex: 0,
    explanation: 'The unit advises that report language should be clear, concrete, and precise, avoiding jargon and roundabout ways of expression.',
  },
  {
    text: 'What is the first step in writing an experimental report, according to Unit 3?',
    options: ['Plan the experiment', 'Write the conclusion first', 'Skip straight to observations', 'Draw the diagrams first'],
    correctOptionIndex: 0,
    explanation: 'The steps for an experimental report begin with planning the experiment, then arranging the apparatus, observing, recording, and finally writing the report.',
  },
  {
    text: 'What should an experimental report include, according to Unit 3?',
    options: ['Aim, apparatus/materials, procedure, observations, and conclusions', 'Only the final result', 'Only a list of materials', 'Only the researcher\'s opinion'],
    correctOptionIndex: 0,
    explanation: 'An experimental report should include the aim of the experiment, details of apparatus and materials, the procedure, observations made, and conclusions arrived at.',
  },
  {
    text: 'What is one of the key techniques of summarising covered in Unit 4?',
    options: ['Separating essential ideas from non-essential ones', 'Adding as much detail as possible', 'Repeating every sentence from the original', 'Ignoring the connections between ideas'],
    correctOptionIndex: 0,
    explanation: 'Unit 4 teaches separating essential from non-essential ideas as a core technique of summarisation, along with removing repetition and noting linking words.',
  },
  {
    text: 'What should a summary writer pay attention to regarding sentence connections, per Unit 4?',
    options: ['Words which link sentences and ideas', 'Only punctuation marks', 'Only paragraph length', 'Only the title of the passage'],
    correctOptionIndex: 0,
    explanation: 'The unit emphasizes giving importance to words that link sentences and ideas, and becoming aware of how ideas in a passage are systematically connected.',
  },
  {
    text: 'What two things does Unit 5 emphasize for writing a good summary of a passage?',
    options: ['Identifying important ideas and their relationships, then arranging main points with connectives', 'Copying the passage word for word', 'Ignoring the original structure entirely', 'Writing a summary longer than the original'],
    correctOptionIndex: 0,
    explanation: 'Unit 5 stresses looking for the important ideas in a passage and their relationships, then arranging the main points properly and linking sentences with connectives.',
  },
  {
    text: 'According to the unit, how often should a student practise summary writing?',
    options: ['On a daily basis', 'Only once a semester', 'Only before exams', 'Practice is not recommended'],
    correctOptionIndex: 0,
    explanation: 'The unit advises that students should practise summary writing on a daily basis to build the skill.',
  },
  {
    text: 'Why might a letter ordering goods be considered a formal letter?',
    options: ['Because it follows the structure and conventions of formal, businesslike communication', 'Because it is always handwritten', 'Because it must be sent by post only', 'Because it contains no factual information'],
    correctOptionIndex: 0,
    explanation: 'Letters ordering goods, like job applications and letters to organizations, follow the structure and style conventions established for formal letters.',
  },
  {
    text: 'What is the overall purpose of the report-writing units in Module 2?',
    options: ['To teach students to communicate events and experimental findings clearly and precisely', 'To teach creative fiction writing', 'To replace the need for formal letters', 'To focus only on grammar rules'],
    correctOptionIndex: 0,
    explanation: 'The report-writing units (covering both event reports and experimental reports) aim to teach clear, precise, well-structured communication of real information.',
  },
];

// ---- Module 3: Sounds & Speaking ----
const module3 = [
  {
    text: 'What key distinction does Unit 1 (Letters and Sounds in English) teach?',
    options: ['That there is no one-to-one correspondence between English letters and English sounds', 'That every letter always makes exactly one sound', 'That English has no vowel sounds', 'That spelling and pronunciation are always identical'],
    correctOptionIndex: 0,
    explanation: 'The unit teaches that there is no one-to-one correspondence between English letters and English sounds, which affects both spelling and pronunciation.',
  },
  {
    text: 'Besides letter-sound correspondence, what else does Unit 1 cover?',
    options: ['Stress patterns and intonational patterns of English', 'Only punctuation rules', 'Only paragraph structure', 'Only formal letter writing'],
    correctOptionIndex: 0,
    explanation: 'Unit 1 also covers the stress patterns of English words (which affect being understood) and English intonational patterns.',
  },
  {
    text: 'What does Unit 2 (English Vowels and Consonants) focus on?',
    options: ['English vowel sounds, vowel contrasts, and consonant sounds', 'Only grammar rules', 'Only formal letter mechanics', 'Only paragraph coherence'],
    correctOptionIndex: 0,
    explanation: 'Unit 2 exposes students to English vowel sounds and contrasts, consonant sounds, and how these sounds are recognised and produced.',
  },
  {
    text: 'According to Unit 2, what helps a person become a good speaker of English sounds?',
    options: ['Constant practice of the sounds', 'Memorising the alphabet only', 'Avoiding speaking practice', 'Reading silently only'],
    correctOptionIndex: 0,
    explanation: 'The unit emphasizes that constant practice of vowel and consonant sounds makes a person a good speaker of English.',
  },
  {
    text: 'What does an interview board primarily test, according to Unit 3?',
    options: ['Whether the candidate has the proper qualities for the job', 'Only physical appearance', 'Only speed of response', 'Only handwriting quality'],
    correctOptionIndex: 0,
    explanation: 'Unit 3 explains that an interview board tests whether a candidate has the proper qualities for the job in question.',
  },
  {
    text: 'What does Unit 3 recommend to perform well in an interview?',
    options: ['Know your subject matter well, be mentally prepared, and be in control of the English medium', 'Avoid preparing at all', 'Focus only on your clothing', 'Speak as fast as possible'],
    correctOptionIndex: 0,
    explanation: 'Good interview performance requires knowing your subject well, being mentally prepared, and being in control of the English language.',
  },
  {
    text: 'What is a seminar, as defined in Unit 4?',
    options: ['A gathering of experts who read papers on an important national or international affair', 'A private one-on-one conversation', 'A written formal letter', 'A type of grammar exercise'],
    correctOptionIndex: 0,
    explanation: 'A seminar is defined as a gathering of experts who read papers on some important national or international affair, organized into different sessions.',
  },
  {
    text: 'What advice does Unit 4 give for beginning a seminar paper?',
    options: ['Begin by outlining the major concerns', 'Begin with an unrelated joke', 'Begin with the conclusion', 'Skip the introduction entirely'],
    correctOptionIndex: 0,
    explanation: 'The unit advises beginning a seminar paper by outlining the major concerns before linking the different aspects of the paper properly.',
  },
  {
    text: 'What three stages does Unit 5 (Public Speech Making) teach?',
    options: ['How to begin, present the body, and conclude a public speech', 'Only how to begin a speech', 'Only how to use a microphone', 'Only how to write the speech title'],
    correctOptionIndex: 0,
    explanation: 'Unit 5 covers how to begin a public speech, how to present the body of the speech, and how to conclude it.',
  },
  {
    text: 'What is emphasized as important throughout the speaking-focused units (Interviews, Seminar Presentation, Public Speech Making)?',
    options: ['Preparation, clarity, and command of spoken English', 'Memorizing word-for-word scripts only', 'Avoiding eye contact with the audience', 'Speaking as briefly as possible regardless of content'],
    correctOptionIndex: 0,
    explanation: 'Across these units, the consistent themes are thorough preparation, clarity of expression, and strong command of spoken English.',
  },
];

// ---- Module 4: Grammar ----
const module4 = [
  {
    text: 'What are "a" and "an" called in English grammar?',
    options: ['Indefinite articles', 'Definite articles', 'Modal auxiliaries', 'Gerunds'],
    correctOptionIndex: 0,
    explanation: '"A" and "an" are indefinite articles, while "the" is the definite article.',
  },
  {
    text: 'When is "an" used instead of "a"?',
    options: ['Before a vowel sound', 'Before a consonant sound', 'Only before proper nouns', 'Only at the start of a sentence'],
    correctOptionIndex: 0,
    explanation: '"An" is used before a vowel sound, while "a" is used before a consonant sound.',
  },
  {
    text: 'What does "concord" refer to in English grammar, according to Unit 1?',
    options: ['Agreement in grammar, particularly of number and person with verbs', 'The use of articles only', 'A type of formal letter', 'A punctuation mark'],
    correctOptionIndex: 0,
    explanation: 'Concord refers to agreement in grammar, particularly matching verb forms (like "be," "do," "have") correctly with number and person.',
  },
  {
    text: 'What common error do Nigerian users of English make with articles, according to the unit?',
    options: ['Omitting articles where needed and using them where they should not be used', 'Always using too many definite articles', 'Never confusing "a" and "an"', 'Using articles correctly all the time'],
    correctOptionIndex: 0,
    explanation: 'The unit identifies a common error: omitting articles where they should be used, and using them where they should not be.',
  },
  {
    text: 'What does the unit say tenses regulate in English?',
    options: ['Time and the aspectual forms of English (whether an event is ongoing, completed, or will be completed)', 'Only the spelling of words', 'Only the choice of articles', 'Only sentence length'],
    correctOptionIndex: 0,
    explanation: 'Tenses regulate time and aspectual forms, indicating whether an event is ongoing, completed, or will be completed.',
  },
  {
    text: 'What is a common tense-related problem for Nigerian users of English, according to Unit 2?',
    options: ['Breaking the rule of tense sequence (mixing past and present incorrectly)', 'Overusing the present continuous tense only', 'Never using the past tense', 'Avoiding all verb forms'],
    correctOptionIndex: 0,
    explanation: 'The unit identifies breaking the rule of tense sequence as a common problem — not keeping tenses consistent with whether an event is past or present.',
  },
  {
    text: 'What are gerunds, as covered in Unit 3?',
    options: ['Verb forms that function as nouns (e.g. "swimming is fun")', 'A type of formal letter', 'A punctuation mark', 'A type of modal auxiliary'],
    correctOptionIndex: 0,
    explanation: 'Gerunds are verb forms (typically ending in -ing) that function as nouns in a sentence, covered alongside participles in Unit 3.',
  },
  {
    text: 'What does Unit 4 (The Active, Passive and the Infinitive) teach about the passive voice?',
    options: ['It is used to show focus on the object and for an impersonal style', 'It should never be used in English', 'It is only used in poetry', 'It replaces the need for articles'],
    correctOptionIndex: 0,
    explanation: 'The passive voice is used to shift focus onto the object of an action and to create a more impersonal style of writing.',
  },
  {
    text: 'What does the active voice help achieve, according to Unit 4?',
    options: ['A direct, well-focused statement in English', 'A vague, unclear statement', 'A statement with no subject', 'A statement only usable in questions'],
    correctOptionIndex: 0,
    explanation: 'The active voice is used to make a direct, well-focused statement, as opposed to the more impersonal passive voice.',
  },
  {
    text: 'Which of the following is listed as a modal auxiliary in Unit 5?',
    options: ['Can', 'Quickly', 'Beautiful', 'Paragraph'],
    correctOptionIndex: 0,
    explanation: 'Modal auxiliaries listed include can, may, must, ought to, should, and would.',
  },
  {
    text: 'What can modal auxiliaries help express, according to Unit 5?',
    options: ['Possibility, probability, and obligation', 'Only past events', 'Only questions', 'Only formal greetings'],
    correctOptionIndex: 0,
    explanation: 'Modal auxiliaries help express possibility (may), probability (might), obligation (ought to), and similar shades of meaning.',
  },
  {
    text: 'Why does the unit say many Nigerian speakers use modal auxiliaries incorrectly?',
    options: ['Because such distinctions are not made the same way in their respective Nigerian languages', 'Because modal auxiliaries do not exist in English', 'Because modal auxiliaries are optional in formal writing', 'Because they are taught only at university level'],
    correctOptionIndex: 0,
    explanation: 'The unit explains that many Nigerian speakers use modal auxiliaries incorrectly because such fine distinctions are not made the same way in their native Nigerian languages.',
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

  console.log('Seeding GST102 as a shared (isGST) course...');
  let course = await prisma.course.findUnique({ where: { code: 'GST102' } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: 'GST102',
        title: 'Use of English and Communication Skills II',
        isGST: true,
        departmentId: null,
        level: 100,
        semester: 'second',
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
        createdBy: 'system-seed-gst102',
        approvedBy: 'system-seed-gst102',
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
  console.log(`GST102 course id: ${course.id}`);
  console.log(`Question bank id: ${bank.id}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
