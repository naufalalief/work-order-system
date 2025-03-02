// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import getAllUsers from "./methods/get";
import createUser from "./methods/post";

const methodHandlers: { [key: string]: Function } = {
  GET: getAllUsers,
  POST: createUser,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const handler = methodHandlers[req.method as string];
  if (!handler) {
    return res.status(405).json({ message: "Method not allowed." });
  }

  return handler(req, res);
}
