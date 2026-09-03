/**
 * setup-faculties-computing-sciences-mgmt-education.js
 *
 * Sets up the department/faculty structure for four faculties, per
 * Pastor Danielson's list (3 Sep 2026): Faculty of Computing, Faculty
 * of Sciences, Faculty of Management Sciences, and Faculty of
 * Education. These are the four "major" faculties targeted before
 * building out the remaining "minor" faculties on demand.
 *
 * Once these Department rows exist, GST courses (isGST: true) appear
 * for them automatically - no separate cross-listing step is needed
 * for GSTs. This script's sole purpose is to get the Department rows
 * into place so that happens. Course-specific content (e.g. a real
 * ACC101 for Accounting) is a separate, later effort.
 *
 * IMPORTANT - FIXING A MIS-ASSIGNED DEPARTMENT:
 * The existing "Computer Science" department (holding CIT104 and the
 * original CSC103 demo course, plus 18 real student attempts) is
 * currently attached to "Faculty of Sciences" - confirmed via direct
 * query on 3 Sep 2026. Pastor Danielson confirmed Computer Science and
 * Information Technology now belong to the newly split-off Faculty of
 * Computing, not Faculty of Sciences. This script re-parents that
 * EXISTING department (updates its facultyId only - the department's
 * id, courses, and student attempts are untouched) rather than
 * creating a duplicate, to avoid repeating the duplicate-department bug
 * documented elsewhere in this project (see seed-css133.js comments).
 *
 * ASSUMPTIONS FLAGGED FOR REVIEW:
 *   - "Maths and Computer Science" (a joint-degree program) is kept
 *     under Faculty of Sciences, since only standalone "Computer
 *     Science" and "Information Technology" were confirmed as moved
 *     to Computing. Flag to Danielson if this joint program should
 *     also move.
 *   - Education's "B.Sc.(ED) Computer Science" is kept as its own
 *     distinct department (an education degree, administratively
 *     separate from the Faculty of Computing's Computer Science
 *     department), matching the exact naming given in the university's
 *     own department list, to avoid any name collision or ambiguity.
 *
 * Safe to re-run: every Faculty/Department create is guarded by a
 * lookup first, so running this twice does not create duplicates.
 *
 * Dry run first:
 *     node setup-faculties-computing-sciences-mgmt-education.js --dry-run
 * Then:
 *     node setup-faculties-computing-sciences-mgmt-education.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

// Confirmed live 3 Sep 2026.
const EXISTING_FACULTY_OF_SCIENCES_ID = 'cmrcnnf7s0000100yyz1y2dw2';
const EXISTING_COMPUTER_SCIENCE_DEPT_ID = 'cmrcnngy20002100ylo7snl5m';

const FACULTIES_TO_ENSURE = [
  { name: 'Faculty of Computing' },
  // Faculty of Sciences already exists (EXISTING_FACULTY_OF_SCIENCES_ID) - not created here.
  { name: 'Faculty of Management Sciences' },
  { name: 'Faculty of Education' },
];

const SCIENCES_DEPARTMENTS = [
  'Biology',
  'Chemistry',
  'Environmental Science and Resource Management',
  'Mathematics',
  'Maths and Computer Science',
  'Physics',
];

const COMPUTING_NEW_DEPARTMENTS = [
  // Computer Science is NOT in this list - it is moved (re-parented), not created.
  'Information Technology',
  'Cybersecurity',
];

const MANAGEMENT_SCIENCES_DEPARTMENTS = [
  'Accounting',
  'Banking and Finance',
  'Business Administration',
  'Cooperative and Rural Development',
  'Entrepreneurship',
  'Marketing',
  'Public Administration',
];

const EDUCATION_DEPARTMENTS = [
  'B.A.(ED) Early Childhood Education',
  'B.A.(ED) English',
  'B.A.(ED) French',
  'B.A.(ED) Primary Education',
  'B.LIS Library and Information Science',
  'B.Sc.(ED) Agricultural Science',
  'B.Sc.(ED) Biology',
  'B.Sc.(ED) Business Education',
  'B.Sc.(ED) Chemistry',
  'B.Sc.(ED) Computer Science',
  'B.Sc.(ED) Health Education',
  'B.Sc.(ED) Human Kinetics',
  'B.Sc.(ED) Integrated Science',
  'B.Sc.(ED) Mathematics',
  'B.Sc.(ED) Physics',
];

async function ensureFaculty(name) {
  let faculty = await prisma.faculty.findUnique({ where: { name } });
  if (faculty) {
    console.log(`  Faculty already exists: ${name} (id: ${faculty.id})`);
    return faculty;
  }
  if (DRY_RUN) {
    console.log(`  would create Faculty: ${name}`);
    return { id: `DRY-RUN-${name}`, name };
  }
  faculty = await prisma.faculty.create({ data: { name } });
  console.log(`  Created Faculty: ${name} (id: ${faculty.id})`);
  return faculty;
}

async function ensureDepartment(name, facultyId, facultyLabel) {
  if (DRY_RUN && facultyId.startsWith('DRY-RUN-')) {
    console.log(`    would create Department: ${name} -> ${facultyLabel}`);
    return;
  }
  const existing = await prisma.department.findFirst({ where: { name, facultyId } });
  if (existing) {
    console.log(`    Department already exists: ${name} -> ${facultyLabel}`);
    return;
  }
  if (DRY_RUN) {
    console.log(`    would create Department: ${name} -> ${facultyLabel}`);
    return;
  }
  await prisma.department.create({ data: { name, facultyId } });
  console.log(`    Created Department: ${name} -> ${facultyLabel}`);
}

async function main() {
  console.log(`\n=== Faculty/Department Setup ${DRY_RUN ? '(DRY RUN - nothing will be written)' : ''} ===\n`);

  // ---- sanity: confirm the two pre-existing ids we depend on --------------
  const scienceFaculty = await prisma.faculty.findUnique({ where: { id: EXISTING_FACULTY_OF_SCIENCES_ID } });
  if (!scienceFaculty) {
    throw new Error(`Faculty of Sciences (id ${EXISTING_FACULTY_OF_SCIENCES_ID}) not found - stopping.`);
  }
  const csDept = await prisma.department.findUnique({ where: { id: EXISTING_COMPUTER_SCIENCE_DEPT_ID } });
  if (!csDept) {
    throw new Error(`Computer Science department (id ${EXISTING_COMPUTER_SCIENCE_DEPT_ID}) not found - stopping.`);
  }
  console.log(`Confirmed Faculty of Sciences: ${scienceFaculty.name} (id: ${scienceFaculty.id})`);
  console.log(`Confirmed Computer Science department (id: ${csDept.id}, currently under facultyId: ${csDept.facultyId})\n`);

  // ---- 1. ensure faculties -------------------------------------------------
  console.log('STEP 1 - Ensure faculties exist');
  const computing = await ensureFaculty('Faculty of Computing');
  const management = await ensureFaculty('Faculty of Management Sciences');
  const education = await ensureFaculty('Faculty of Education');
  console.log('');

  // ---- 2. re-parent Computer Science department to Faculty of Computing --
  console.log('STEP 2 - Move Computer Science department to Faculty of Computing');
  if (csDept.facultyId === computing.id) {
    console.log('  Already under Faculty of Computing - nothing to do.');
  } else if (DRY_RUN) {
    console.log(`  would update Computer Science.facultyId: ${csDept.facultyId} -> ${computing.id} (Faculty of Computing)`);
  } else {
    await prisma.department.update({
      where: { id: csDept.id },
      data: { facultyId: computing.id },
    });
    console.log(`  Updated Computer Science.facultyId -> ${computing.id} (Faculty of Computing)`);
  }
  console.log('');

  // ---- 3. create remaining Computing departments --------------------------
  console.log('STEP 3 - Create remaining Faculty of Computing departments');
  for (const name of COMPUTING_NEW_DEPARTMENTS) {
    await ensureDepartment(name, computing.id, 'Faculty of Computing');
  }
  console.log('');

  // ---- 4. create Sciences departments (existing faculty) ------------------
  console.log('STEP 4 - Create Faculty of Sciences departments (faculty already existed)');
  for (const name of SCIENCES_DEPARTMENTS) {
    await ensureDepartment(name, scienceFaculty.id, 'Faculty of Sciences');
  }
  console.log('');

  // ---- 5. create Management Sciences departments ---------------------------
  console.log('STEP 5 - Create Faculty of Management Sciences departments');
  for (const name of MANAGEMENT_SCIENCES_DEPARTMENTS) {
    await ensureDepartment(name, management.id, 'Faculty of Management Sciences');
  }
  console.log('');

  // ---- 6. create Education departments -------------------------------------
  console.log('STEP 6 - Create Faculty of Education departments');
  for (const name of EDUCATION_DEPARTMENTS) {
    await ensureDepartment(name, education.id, 'Faculty of Education');
  }
  console.log('');

  if (DRY_RUN) {
    console.log('Dry run complete. Nothing was written.');
    return;
  }

  // ---- 7. verify -------------------------------------------------------------
  console.log('=== VERIFY: departments per faculty ===\n');
  const faculties = await prisma.faculty.findMany({
    include: { departments: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });
  for (const f of faculties) {
    console.log(`  ${f.name} (${f.departments.length}): ${f.departments.map(d => d.name).join(', ') || '(none)'}`);
  }

  console.log('\nNOTE: GST courses (isGST: true) now appear automatically for every');
  console.log('department created above - no further linking needed for GSTs.');
  console.log('Course-specific content for these departments is a separate, later effort.');
}

main()
  .catch(e => { console.error('\nFAILED:\n' + e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
