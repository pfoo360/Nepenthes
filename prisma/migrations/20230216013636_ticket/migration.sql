-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('BUG', 'ISSUE', 'ERROR', 'FEATURE', 'OTHER');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "Status" NOT NULL,
    "type" "Type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSubmitter" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,

    CONSTRAINT "TicketSubmitter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketDeveloper" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,

    CONSTRAINT "TicketDeveloper_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSubmitter" ADD CONSTRAINT "TicketSubmitter_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketSubmitter" ADD CONSTRAINT "TicketSubmitter_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketDeveloper" ADD CONSTRAINT "TicketDeveloper_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketDeveloper" ADD CONSTRAINT "TicketDeveloper_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
