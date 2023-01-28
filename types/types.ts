import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

interface User {
  id: String;
  username: String;
  email: String;
}

export interface GraphQLContext<T = any> {
  req: NextApiRequest;
  res: NextApiResponse<T>;
  prisma: PrismaClient;
}

export interface CreateUserResponse {
  successStatus: Boolean;
  message: String;
  user: User;
}

export interface SignInResponse {
  successStatus: Boolean;
  message: String;
  user: User;
}
