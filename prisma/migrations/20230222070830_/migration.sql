-- DropForeignKey
ALTER TABLE "TicketComment" DROP CONSTRAINT "TicketComment_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
