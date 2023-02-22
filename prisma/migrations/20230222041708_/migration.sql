/*
  Warnings:

  - You are about to drop the column `commentId` on the `TicketComment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketCommentId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticketCommentId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TicketComment" DROP CONSTRAINT "TicketComment_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "ticketCommentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketComment" DROP COLUMN "commentId";

-- CreateIndex
CREATE UNIQUE INDEX "Comment_ticketCommentId_key" ON "Comment"("ticketCommentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ticketCommentId_fkey" FOREIGN KEY ("ticketCommentId") REFERENCES "TicketComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
