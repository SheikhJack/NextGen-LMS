/*
  Warnings:

  - Added the required column `content` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Announcement" ADD COLUMN     "content" TEXT NOT NULL;
