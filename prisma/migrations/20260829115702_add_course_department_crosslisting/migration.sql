-- CreateTable
CREATE TABLE "CourseDepartment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "CourseDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseDepartment_courseId_idx" ON "CourseDepartment"("courseId");

-- CreateIndex
CREATE INDEX "CourseDepartment_departmentId_idx" ON "CourseDepartment"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseDepartment_courseId_departmentId_key" ON "CourseDepartment"("courseId", "departmentId");

-- AddForeignKey
ALTER TABLE "CourseDepartment" ADD CONSTRAINT "CourseDepartment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDepartment" ADD CONSTRAINT "CourseDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
