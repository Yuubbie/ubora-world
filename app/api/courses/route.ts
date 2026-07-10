import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const faculties = await db.faculty.findMany({
    include: {
      departments: {
        include: { courses: { select: { id: true, code: true, title: true } } },
      },
    },
  });
  return NextResponse.json(faculties);
}
