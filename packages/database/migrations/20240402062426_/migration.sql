/*
  Warnings:

  - Added the required column `logo` to the `Campus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campus" ADD COLUMN     "logo" TEXT NOT NULL,
ALTER COLUMN "alias" DROP NOT NULL;
