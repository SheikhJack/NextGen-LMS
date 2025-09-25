-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_parentId_fkey";

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
