import { NextApiRequest, NextApiResponse } from "next";
import getWorkOrders from "./methods/get";
import createWorkOrder from "./methods/post";
const methodHandlers: { [key: string]: Function } = {
  GET: getWorkOrders,
  POST: createWorkOrder,
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
