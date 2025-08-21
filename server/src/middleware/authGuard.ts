import { Request, Response, NextFunction } from "express";
import {
  validateSessionToken,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from "../scripts/auth";

export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookies = req.cookies;
    const token = cookies?.session;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No session token" });
    }

    const { session, user } = await validateSessionToken(token);

    if (!session) {
      deleteSessionTokenCookie(res);
      return res.status(401).json({ message: "Unauthorized: Invalid session token" });
    }

    setSessionTokenCookie(res, token, session.expiresAt);

    req.user = user;

    next();
  } catch (error) {
    console.error("AuthGuard Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}