/*
  Warnings:

  - You are about to alter the column `name` on the `NoteTag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - A unique constraint covering the columns `[name]` on the table `NoteTag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "NoteTag" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "NoteTag_name_key" ON "NoteTag"("name");

-- CreateIndex
CREATE INDEX "NoteTag_name_idx" ON "NoteTag"("name");
