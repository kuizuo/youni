/*
  Warnings:

  - You are about to drop the `Carousel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Carousel" DROP CONSTRAINT "Carousel_campusId_fkey";

-- AlterTable
ALTER TABLE "Campus" ADD COLUMN     "carousels" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "desc" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;

-- DropTable
DROP TABLE "Carousel";
