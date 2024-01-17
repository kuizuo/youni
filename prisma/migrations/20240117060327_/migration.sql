/*
  Warnings:

  - You are about to drop the column `remark` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(80)`.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "remark",
ALTER COLUMN "username" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "avatar" SET DATA TYPE VARCHAR(1024),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(80);
