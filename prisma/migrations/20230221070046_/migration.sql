/*
  Warnings:

  - A unique constraint covering the columns `[ticketId,developerId]` on the table `TicketDeveloper` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TicketDeveloper_ticketId_developerId_key" ON "TicketDeveloper"("ticketId", "developerId");
