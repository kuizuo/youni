-- CreateEnum
CREATE TYPE "NotificationAction" AS ENUM ('Like', 'Follow', 'Comment', 'System');

-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM ('Note', 'Comment', 'User');

-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_noteId_fkey";

-- AlterTable
ALTER TABLE "History" ALTER COLUMN "noteId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "action" "NotificationAction" NOT NULL,
    "status" SMALLINT DEFAULT 0,
    "source_id" TEXT,
    "source_type" "NotificationSourceType",
    "source" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
