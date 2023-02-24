-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "authorId" SET DEFAULT 'null';

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "WorkspaceUser"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
