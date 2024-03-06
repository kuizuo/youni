/*
  Warnings:

  - You are about to alter the column `nickname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "desc" VARCHAR(100),
ADD COLUMN     "gender" SMALLINT DEFAULT 0,
ADD COLUMN     "yoId" VARCHAR(10),
ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE INDEX "User_yoId_idx" ON "User"("yoId");
