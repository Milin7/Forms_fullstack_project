import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type RequestBody = Request["body"];
type RequestParams = Request["params"];
type RequestHeaders = Request["headers"];

// Extend Request interface with explicit type declarations
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  body: RequestBody;
  params: RequestParams;
  headers: RequestHeaders;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as any;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};
