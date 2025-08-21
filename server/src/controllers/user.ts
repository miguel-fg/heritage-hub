import { Request, Response } from "express";
import { createSession, deleteSessionTokenCookie, generateSessionToken, setSessionTokenCookie, validateSessionToken, oneTimeCodeTransaction, invalidateSession } from "../scripts/auth";
import prisma from "../services/prisma";

export const getCurrentUser = async (req:Request, res:Response) => {
  if (!req.user) {
    return res.status(401).json({ user: null, message: "Not authenticated "});
  }

  return res.json({ user: req.user });
}

export const patchUser = async (req: Request, res: Response) => {
  const { displayName } = req.body;

  if (!req.user) return res.status(401).send("Not authenticated");
  if (!displayName || displayName === "") return res.status(400).send("Missing user display name");

  try {
    const result = await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        displayName
      }
    });

    return res.status(200).json({ displayName: result.displayName });
  } catch (err) {
    return res.status(500).send("Failed to update user");
  }
}

export const exchangeOneTimeCode = async (req: Request, res:Response) => {
  const { otc } = req.body;

  if (!otc) return res.status(400).send("Missing OTC");

  try {
    const record = await oneTimeCodeTransaction(otc);

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, record.userId)

    setSessionTokenCookie(res, sessionToken, session.expiresAt);

    return res.json({ success: true });
  } catch (err){
    return res.status(500).send(`Failed to exchange OTC to open session. ${err}`);
  }
}

export const deleteUserSession = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  const token = cookies?.session;

  if (!token) {
    return res.status(401).json({ user: null, message: "No session token" });
  }

  try {
    await invalidateSession(token);
    deleteSessionTokenCookie(res);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
}