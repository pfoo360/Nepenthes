import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export type Role = "ADMIN" | "MANAGER" | "DEVELOPER";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Type = "BUG" | "ISSUE" | "ERROR" | "FEATURE" | "OTHER";

export type Status = "OPEN" | "CLOSED";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  ticketSubmitter: {
    id: string;
    submitter: WorkspaceUser;
  };
  ticketDeveloper: Array<{
    id: string;
    developer: WorkspaceUser;
  }>;
  project: {
    id: string;
    name: string;
    description: string;
    workspace: Workspace;
  };
  priority: Priority;
  status: Status;
  type: Type;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  comment: string;
  author: WorkspaceUser;
  createdAt: string | Date;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  comment: Comment;
}
export interface WorkspaceUser {
  id: string;
  user: User;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
}

export interface GraphQLContext<T = any> {
  req: NextApiRequest;
  res: NextApiResponse<T>;
  prisma: PrismaClient;
  session: string | null;
  user: User | null;
}

export interface CreateUserResponse {
  successStatus: boolean;
  message: string;
  user: User;
}

export interface SignInResponse {
  successStatus: boolean;
  message: string;
  user: User;
}

export interface CreateWorkspaceResponse {
  id: string;
  name: string;
  workspaceUser: WorkspaceUser[];
}

export interface WorkspaceUserProviderValue {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
}

export interface UpdateWorkspaceNameResponse {
  id: string;
  name: string;
  workspaceUser: WorkspaceUser[];
}

export interface DeleteWorkspaceResponse {
  id: string;
  name: string;
  workspaceUser: WorkspaceUser[];
}
