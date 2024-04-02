-- AlterTable
ALTER TABLE "User" ADD COLUMN     "campusId" TEXT;

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carousel" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "image" JSONB NOT NULL DEFAULT '{}',
    "isShow" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "campusId" TEXT NOT NULL,

    CONSTRAINT "Carousel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carousel" ADD CONSTRAINT "Carousel_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
