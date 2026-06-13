/*
  Warnings:

  - You are about to drop the column `targetDays` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "targetDays";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";
