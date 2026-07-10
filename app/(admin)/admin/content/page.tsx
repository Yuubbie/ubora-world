import { db } from "@/lib/db";
import ApproveButton from "@/components/ApproveButton";

export default async function AdminContentPage() {
  const [questionBanks, summaries, pastQuestionSets, tutorials] = await Promise.all([
    db.questionBank.findMany({ where: { status: "draft" }, include: { course: true, questions: true } }),
    db.summary.findMany({ where: { status: "draft" }, include: { course: true } }),
    db.pastQuestionSet.findMany({ where: { status: "draft" }, include: { course: true } }),
    db.tutorialContent.findMany({ where: { status: "draft" }, include: { course: true } }),
  ]);

  const totalPending = questionBanks.length + summaries.length + pastQuestionSets.length + tutorials.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-1">Content approval queue</h1>
      <p className="text-muted mb-8">
        {totalPending === 0
          ? "Nothing waiting for review — everything approved content is already visible to students."
          : `${totalPending} item(s) waiting for review. Nothing here is visible to students until approved.`}
      </p>

      <Section title="Question banks">
        {questionBanks.map((qb) => (
          <Row key={qb.id} label={`${qb.course.code} — ${qb.questions.length} questions`}>
            <ApproveButton type="questionBank" id={qb.id} />
          </Row>
        ))}
      </Section>

      <Section title="Course summaries">
        {summaries.map((s) => (
          <Row key={s.id} label={`${s.course.code} — ${s.title}`}>
            <ApproveButton type="summary" id={s.id} />
          </Row>
        ))}
      </Section>

      <Section title="Past question sets">
        {pastQuestionSets.map((p) => (
          <Row key={p.id} label={`${p.course.code} — ${p.year}`}>
            <ApproveButton type="pastQuestionSet" id={p.id} />
          </Row>
        ))}
      </Section>

      <Section title="Tutorials">
        {tutorials.map((t) => (
          <Row key={t.id} label={`${t.course.code} — ${t.title} (${t.type})`}>
            <ApproveButton type="tutorialContent" id={t.id} />
          </Row>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some((c: any) => c);
  if (!hasItems) return null;
  return (
    <div className="mb-8">
      <h2 className="text-sm font-mono uppercase tracking-widest text-muted mb-3">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}
