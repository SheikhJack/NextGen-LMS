-- CreateEnum
CREATE TYPE "public"."AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "public"."FeeStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');

-- CreateTable
CREATE TABLE "public"."admissions" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "status" "public"."AdmissionStatus" NOT NULL DEFAULT 'PENDING',
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "bloodGroup" TEXT,
    "allergies" TEXT[],
    "specialNeeds" TEXT,
    "emergencyContact" TEXT NOT NULL,
    "medicalConditions" TEXT,
    "previousSchool" TEXT,
    "transportationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "dietaryRestrictions" TEXT,
    "registrationFee" DOUBLE PRECISION DEFAULT 0,
    "feeStatus" "public"."FeeStatus" DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" "public"."PaymentMethod",
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."admissions" ADD CONSTRAINT "admissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
