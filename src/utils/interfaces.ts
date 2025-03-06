import { Role } from "@prisma/client";
import { NextApiResponse } from "next";

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: Role;
  expired: boolean;
}

export interface Auth {
  username: string;
  password: string;
  role?: Role;
}

export interface AuthWithResponse extends Auth {
  res: NextApiResponse;
}
