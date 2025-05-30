/*
  Warnings:

  - You are about to drop the column `hasCompletedOnboarding` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hasCompletedOnboarding";
