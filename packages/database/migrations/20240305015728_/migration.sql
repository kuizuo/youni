/*
  Warnings:

  - You are about to alter the column `title` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- CreateEnum
CREATE TYPE "CommentRefType" AS ENUM ('Note');

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL DEFAULT '',
    "ref_id" TEXT NOT NULL,
    "ref_type" "CommentRefType" NOT NULL,
    "content" VARCHAR(1024) NOT NULL,
    "parentId" TEXT,
    "ip" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_ref_id_ref_type_idx" ON "Comment"("ref_id", "ref_type");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
