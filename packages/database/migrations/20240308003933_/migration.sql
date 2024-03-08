/*
  Warnings:

  - Made the column `nickname` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET NOT NULL,
ALTER COLUMN "nickname" SET DEFAULT '';
