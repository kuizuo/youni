/*
  Warnings:

  - Made the column `source_id` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `source_type` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "source_id" SET NOT NULL,
ALTER COLUMN "source_type" SET NOT NULL;
