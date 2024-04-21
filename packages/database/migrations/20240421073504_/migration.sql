/*
  Warnings:

  - You are about to drop the `NoteTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_NoteToNoteTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_NoteToNoteTag" DROP CONSTRAINT "_NoteToNoteTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToNoteTag" DROP CONSTRAINT "_NoteToNoteTag_B_fkey";

-- DropTable
DROP TABLE "NoteTag";

-- DropTable
DROP TABLE "_NoteToNoteTag";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" VARCHAR(20) NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NoteToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_NoteToTag_AB_unique" ON "_NoteToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_NoteToTag_B_index" ON "_NoteToTag"("B");

-- AddForeignKey
ALTER TABLE "_NoteToTag" ADD CONSTRAINT "_NoteToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTag" ADD CONSTRAINT "_NoteToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
