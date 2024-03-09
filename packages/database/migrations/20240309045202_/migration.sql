/*
  Warnings:

  - You are about to drop the column `published` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `imageList` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "published",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "imageList",
DROP COLUMN "published",
ADD COLUMN     "cover" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "images" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT true;
