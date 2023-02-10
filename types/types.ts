import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export interface User {
  id: string;
  username: string;
  email: string;
}

export type Role = "ADMIN" | "MANAGER" | "DEVELOPER";
export interface WorkspaceUser {
  id: string;
  user: User;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description: string;
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
