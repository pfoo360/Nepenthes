-- CreateTable
CREATE TABLE "ProjectWorkspaceUser" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workspaceUserId" TEXT NOT NULL,

    CONSTRAINT "ProjectWorkspaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectWorkspaceUser_projectId_workspaceUserId_key" ON "ProjectWorkspaceUser"("projectId", "workspaceUserId");

-- AddForeignKey
ALTER TABLE "ProjectWorkspaceUser" ADD CONSTRAINT "ProjectWorkspaceUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkspaceUser" ADD CONSTRAINT "ProjectWorkspaceUser_workspaceUserId_fkey" FOREIGN KEY ("workspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
