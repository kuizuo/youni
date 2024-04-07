/*
  Warnings:

  - You are about to drop the column `is_published` on the `Note` table. All the data in the column will be lost.
  - Added the required column `state` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoteState" AS ENUM ('Draft', 'Published', 'Audit', 'Rejected');

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "is_published",
ADD COLUMN     "state" "NoteState" NOT NULL;
