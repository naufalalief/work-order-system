import { AuthenticatedUser } from "@/utils/interfaces";
import { NextApiRequest } from "next";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { Role } from "@prisma/client";
const secret = process.env.secretkey || "secret";

export const authenticated = (req: NextApiRequest): AuthenticatedUser => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return {
        userId: decoded.userId as number,
        username: decoded.username as string,
        role: decoded.role as Role,
        expired: true,
      };
    }
    return {
      userId: decoded.userId as number,
      username: decoded.username as string,
      role: decoded.role as Role,
      expired: false,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        userId: 0,
        username: "",
        role: Role.OPERATOR,
        expired: true,
      };
    } else {
      throw new Error("Unauthorized");
    }
  }
};
