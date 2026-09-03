/**
 * crosslist-courses.js
 *
 * Two jobs:
 *   1. BACKFILL - give every course a CourseDepartment row for its own
 *      owning department, so the join table reproduces today's behaviour
 *      exactly before any query changes.
 *   2. CROSS-LIST - add the extra department links for service courses
 *      (courses owned by one department but taught to another).
 *
 * GST courses are deliberately NOT linked here. `isGST: true` already makes
 * them appear in every department, and stays correct when a new department
 * is added. Enumerating them would need a manual backfill every time.
 *
 * Safe to re-run: every write is an upsert on the (courseId, departmentId)
 * unique constraint, so running twice changes nothing.
 *
 * Dry run first:
 *     node crosslist-courses.js --dry-run
 * Then:
 *     node crosslist-courses.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

// Confirmed live 29 Aug 2026. Computer Science added 2 Sep 2026.
const DEPT = {
  CRIMINOLOGY: 'cms7arwzd0002sgbyyjev2dn1',
  ECONOMICS: 'cms7arxjf0004sgbyb4vqx8et',
  POLITICAL_SCIENCE: 'cms7arxwt0006sgbyf5hcu000',
  IRD: 'cms7arya80008sgby1960omt7',
  MASS_COMM: 'cms7arynn000asgby18h13uty',
  PCR: 'cms7arz16000csgby9l8g60gw',
  TOURISM: 'cms7arzef000esgby3zl6aotz',
  DEV_STUDIES: 'cms7arzrt000gsgbybgjlmkqc',
  COMPUTER_SCIENCE: 'cmrcnngy20002100ylo7snl5m',
};

/**
 * Extra departments each course should ALSO appear in, beyond its owner.
 * Add a line here whenever a course is taught outside its home department.
 */
const CROSS_LISTINGS = [
  { code: 'POL111', departments: [DEPT.CRIMINOLOGY] },
  { code: 'ECO121', departments: [DEPT.CRIMINOLOGY] },
  { code: 'PCR111', departments: [DEPT.CRIMINOLOGY] },
  { code: 'CIT104', departments: [DEPT.CRIMINOLOGY] },
  { code: 'POL126', departments: [DEPT.CRIMINOLOGY] },
  { code: 'PCR114', departments: [DEPT.CRIMINOLOGY] },
];

async function main() {
  console.log(`\n=== Course cross-listing ${DRY_RUN ? '(DRY RUN - nothing will be written)' : ''} ===\n`);

  // ---- sanity: every department id above must really exist --------------
  const ids = Object.values(DEPT);
  const found = await prisma.department.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  if (found.length !== ids.length) {
    const missing = ids.filter(id => !found.some(d => d.id === id));
    throw new Error(`These department ids do not exist:\n  ${missing.join('\n  ')}`);
  }
  const nameOf = Object.fromEntries(found.map(d => [d.id, d.name]));
  console.log(`All ${found.length} department ids verified.\n`);

  // ---- 1. backfill owning departments -----------------------------------
  const owned = await prisma.course.findMany({
    where: { departmentId: { not: null } },
    select: { id: true, code: true, departmentId: true },
    orderBy: { code: 'asc' },
  });

  console.log(`BACKFILL - courses with an owning department: ${owned.length}`);
  let created = 0, already = 0;
  for (const c of owned) {
    const exists = await prisma.courseDepartment.findUnique({
      where: { courseId_departmentId: { courseId: c.id, departmentId: c.departmentId } },
    });
    if (exists) { already++; continue; }
    if (DRY_RUN) {
      console.log(`  would link ${c.code} -> ${nameOf[c.departmentId] || c.departmentId}`);
    } else {
      await prisma.courseDepartment.create({
        data: { courseId: c.id, departmentId: c.departmentId },
      });
      console.log(`  linked ${c.code} -> ${nameOf[c.departmentId] || c.departmentId}`);
    }
    created++;
  }
  console.log(`  new links: ${created}, already present: ${already}\n`);

  // ---- 2. cross-listings -------------------------------------------------
  console.log('CROSS-LISTINGS');
  let xCreated = 0, xAlready = 0, xSkipped = 0;
  for (const entry of CROSS_LISTINGS) {
    const course = await prisma.course.findUnique({
      where: { code: entry.code },
      select: { id: true, code: true, departmentId: true },
    });
    if (!course) {
      console.log(`  ${entry.code}: not built yet - skipped`);
      xSkipped++;
      continue;
    }
    for (const deptId of entry.departments) {
      if (deptId === course.departmentId) {
        console.log(`  ${entry.code} -> ${nameOf[deptId]} is its owner, covered by backfill`);
        continue;
      }
      const exists = await prisma.courseDepartment.findUnique({
        where: { courseId_departmentId: { courseId: course.id, departmentId: deptId } },
      });
      if (exists) { console.log(`  ${entry.code} -> ${nameOf[deptId]}: already linked`); xAlready++; continue; }
      if (DRY_RUN) {
        console.log(`  would cross-list ${entry.code} -> ${nameOf[deptId]}`);
      } else {
        await prisma.courseDepartment.create({
          data: { courseId: course.id, departmentId: deptId },
        });
        console.log(`  cross-listed ${entry.code} -> ${nameOf[deptId]}`);
      }
      xCreated++;
    }
  }
  console.log(`  new: ${xCreated}, already present: ${xAlready}, not yet built: ${xSkipped}\n`);

  if (DRY_RUN) {
    console.log('Dry run complete. Nothing was written.');
    return;
  }

  // ---- 3. verify: what will each department show? ------------------------
  console.log('=== VERIFY: 100L first-semester courses per department ===');
  console.log('(using the NEW query: isGST OR linked via CourseDepartment)\n');

  for (const [key, id] of Object.entries(DEPT)) {
    const courses = await prisma.course.findMany({
      where: {
        level: 100,
        semester: 'first',
        OR: [{ isGST: true }, { departments: { some: { departmentId: id } } }],
      },
      select: { code: true, isGST: true },
      orderBy: { code: 'asc' },
    });
    const codes = courses.map(c => c.code + (c.isGST ? '*' : '')).join(', ');
    console.log(`  ${nameOf[id]} (${courses.length}): ${codes || '(none)'}`);
  }
  console.log('\n  * = GST, appears in every department automatically');

  const total = await prisma.courseDepartment.count();
  console.log(`\nTotal CourseDepartment rows: ${total}`);
}

main()
  .catch(e => { console.error('\nFAILED:\n' + e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
