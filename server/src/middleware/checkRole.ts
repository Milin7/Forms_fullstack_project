import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const checkRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: "Not authorized" });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ error: "Authorization check failed" });
    }
  };
};
