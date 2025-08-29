import { RequestHandler, Request, Response, NextFunction } from "express";
import {
  validateSessionToken,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from "../scripts/auth";

export const authGuard: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookies = req.cookies;
    const token = cookies?.session;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No session token" });
      return;
    }

    const { session, user } = await validateSessionToken(token);

    if (!session) {
      deleteSessionTokenCookie(res);
      res.status(401).json({ message: "Unauthorized: Invalid session token" });
      return;
    }

    setSessionTokenCookie(res, token, session.expiresAt);

    req.user = user;

    next();
  } catch (error) {
    console.error("AuthGuard Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}