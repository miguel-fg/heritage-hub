import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { User, Session } from "@prisma/client";
import { Response } from "express";
import prisma from "../services/prisma";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export const getCASServiceURL = (): string | undefined => {
  const ENVIRONMENT = process.env.ENVIRONMENT;
  const CAS_DEV = process.env.CAS_DEV;
  const CAS_PROD = process.env.CAS_PROD;

  const serviceURL = ENVIRONMENT === "prod" ? CAS_PROD : CAS_DEV;

  return serviceURL;
};

export const getFrontendURL = (): string | undefined => {
  const ENVIRONMENT = process.env.ENVIRONMENT;
  const HH_DEV = process.env.HH_DEV;
  const HH_PROD = process.env.HH_PROD;

  const frontendURL = ENVIRONMENT === "prod" ? HH_PROD : HH_DEV;

  return frontendURL;
}

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export const createSession = async (
  token: string,
  userId: string,
): Promise<Session> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  };

  await prisma.session.create({ data: session });
  return session;
}

export const validateSessionToken = async(
  token: string,
): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (result === null) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  // token is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }

  // refresh token
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }

  return { session, user };
}

export const invalidateSession = async (token: string): Promise<void> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  await prisma.session.delete({ where: { id: sessionId } });
}

export const createOneTimeCode = async (userId: string) => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const code = encodeBase32LowerCaseNoPadding(bytes);
  const expiresAt = new Date(Date.now() + 60_000);

  await prisma.oneTimeCode.create({
    data: { code, userId, expiresAt }
  })

  return code;
}

export const oneTimeCodeTransaction = (otc: string) => {
  return prisma.$transaction(async (tx) => {
    const record = await tx.oneTimeCode.findUnique({ where: { code: otc }});

    if (!record || record.expiresAt < new Date()) {
      throw new Error("Invalid or expired code");
    }

    await tx.oneTimeCode.delete({ where: { code: otc }});

    return record;
  })
}

export const setSessionTokenCookie = (
  res: Response,
  token: string,
  expiresAt: Date,
) => {
  const isProd = process.env.ENVIRONMENT === "prod";

  const cookieOptions = [
    `session=${token}`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Expires=${expiresAt.toUTCString()}`,
    `Path=/`,
    isProd ? `Secure` : "",
  ]
    .filter(Boolean)
    .join("; ");

  res.setHeader("Set-Cookie", cookieOptions);
}

export const deleteSessionTokenCookie = (res: Response) => {
  const isProd = process.env.ENVIRONMENT === "prod";

  const cookieOptions = [
    `session=`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`, //Expire immediately
    `Path=/`,
    isProd ? `Secure` : "",
  ]
    .filter(Boolean)
    .join("; ");

  res.setHeader("Set-Cookie", cookieOptions);
}