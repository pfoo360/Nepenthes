-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_ticketSubmitterId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "ticketSubmitterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketSubmitterId_fkey" FOREIGN KEY ("ticketSubmitterId") REFERENCES "TicketSubmitter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
