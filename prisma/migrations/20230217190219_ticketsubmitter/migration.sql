/*
  Warnings:

  - You are about to drop the column `ticketId` on the `TicketSubmitter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketSubmitterId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticketSubmitterId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TicketSubmitter" DROP CONSTRAINT "TicketSubmitter_ticketId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketSubmitterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketSubmitter" DROP COLUMN "ticketId";

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketSubmitterId_key" ON "Ticket"("ticketSubmitterId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketSubmitterId_fkey" FOREIGN KEY ("ticketSubmitterId") REFERENCES "TicketSubmitter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
