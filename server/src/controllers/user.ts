import {RequestHandler, Request, Response } from "express";
import { createSession, deleteSessionTokenCookie, generateSessionToken, setSessionTokenCookie, oneTimeCodeTransaction, invalidateSession } from "../scripts/auth";
import prisma from "../services/prisma";

export const getCurrentUser: RequestHandler = async (req:Request, res:Response) => {
  if (!req.user) {
    res.status(401).json({ user: null, message: "Not authenticated "});
    return;
  }

  res.json({ user: req.user });
}

export const getAllUsers: RequestHandler = async (req: Request, res:Response) => {
  if (!req.user || req.user.permissions !== "ADMIN") {
    res.status(403).send("Not authorized to access the requested resource");
    return;
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            models: true
          }
        }
      },
      orderBy: {
        displayName: "asc"
      }
    });

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).send("Failed to retrieve user");
  }
}

export const patchUser: RequestHandler = async (req: Request, res: Response) => {
  const { displayName } = req.body;

  if (!req.user) {
    res.status(401).send("Not authenticated");
    return;
  }

  if (!displayName || displayName === "") {
    res.status(400).send("Missing user display name");
    return;
  }

  try {
    const result = await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        displayName
      }
    });

    res.status(200).json({ displayName: result.displayName });
  } catch (err) {
    res.status(500).send("Failed to update user");
  }
}

export const patchUsers: RequestHandler = async (req: Request, res: Response) => {
  if (!req.user || req.user.permissions !== "ADMIN") {
    res.status(403).send("Not authorized to access the requested resource");
    return;
  }

  const { changedUsers } = req.body;
  if (!changedUsers || !Array.isArray(changedUsers)) {
    res.status(400).send("Missing or invalid updated users");
    return;
  }

  try {
    const updated = await prisma.$transaction(
      changedUsers.map((user: any) => prisma.user.update({
        where: { id: user.id},
        data: {
          displayName: user.displayName,
          permissions: user.permissions
        },
        include: {
          _count: {
            select: { models: true }
          }
        }
      }))
    );

    res.status(200).json({ updated });
  } catch (err) {
    console.error("[patchUsers]: Failed to update users. ", err);
    res.status(500).send("Failed to update users");
  }
}

export const exchangeOneTimeCode: RequestHandler = async (req: Request, res:Response) => {
  const { otc } = req.body;

  if (!otc) {
    res.status(400).send("Missing OTC");
    return;
  }

  try {
    const record = await oneTimeCodeTransaction(otc);

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, record.userId)

    setSessionTokenCookie(res, sessionToken, session.expiresAt);

    res.json({ success: true });
  } catch (err){
    res.status(500).send(`Failed to exchange OTC to open session. ${err}`);
  }
}

export const deleteUserSession: RequestHandler = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  const token = cookies?.session;

  if (!token) {
    res.status(401).json({ user: null, message: "No session token" });
    return;
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