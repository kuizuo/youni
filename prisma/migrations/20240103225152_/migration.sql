/*
  Warnings:

  - Added the required column `default` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "default",
ADD COLUMN     "default" BOOLEAN NOT NULL;
