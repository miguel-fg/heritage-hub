import { Request, Response } from "express";

export const redirectCAS = (_req: Request, res: Response) => {
  res.redirect("https://example.com");
};

export const validateCASTicket = (_req: Request, res: Response) => {
  const ticket = "abc123fakeTicket";
  const frontendURL = "http://localhost:5173";

  res.redirect(`${frontendURL}/?ticket=${ticket}`);
};
