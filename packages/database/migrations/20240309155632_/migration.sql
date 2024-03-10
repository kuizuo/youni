-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "interact" JSONB NOT NULL DEFAULT '{"likedCount": 0, "commentCount": 0 }';
