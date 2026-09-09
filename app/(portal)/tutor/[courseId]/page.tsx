// app/(portal)/tutor/[courseId]/page.tsx
//
// A dedicated page for the AI tutor, mirroring the URL pattern already
// used by your CBT engine (app/(portal)/cbt/[courseId]/page.tsx).
//
// This is deliberately its own route rather than something bolted
// onto the existing CBT page — it keeps the CBT page's logic
// untouched, and gives the tutor a clean, linkable URL:
//
//   /tutor/<courseId>
//
// WHERE TO SAVE THIS FILE:
//   app\(portal)\tutor\[courseId]\page.tsx
//   (you'll need to create the "tutor" and "[courseId]" folders)
//
// HOW STUDENTS GET HERE:
// Add a single link wherever a course is already shown — for example,
// near the "Start CBT" button on the CBT page, or on the course
// browse/list pages. The link is just:
//
//   <a href={`/tutor/${course.id}`}>Ask the Tutor</a>
//
// or, using Next's Link component:
//
//   import Link from "next/link";
//   <Link href={`/tutor/${course.id}`}>Ask the Tutor</Link>
//
// You don't need to know the exact internal structure of the CBT page
// to add this — just drop that one line anywhere a `course` object
// (with an `.id`) is already in scope, since every course-related page
// in this app already has that.

"use client";

import { useParams } from "next/navigation";
import CourseTutorChat from "@/components/CourseTutorChat";

export default function TutorPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <CourseTutorChat courseId={courseId} />
    </div>
  );
}
