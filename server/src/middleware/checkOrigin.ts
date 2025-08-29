import { Request, Response, NextFunction, RequestHandler } from "express"

export const checkOrigin = (allowedOrigins: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const origin = req.headers.origin;
      const referer = req.headers.referer;

      let isAllowed = false;

      if (origin) {
        isAllowed = allowedOrigins.includes(origin);
      } else if (referer) {
        try {
          const refererUrl = new URL(referer);
          isAllowed = allowedOrigins.includes(`${refererUrl.protocol}//${refererUrl.host}`);
        } catch {
          res.status(403).send("Invalid Referer header");
          return;
        }
      }

      if (!isAllowed) {
        res.status(403).send("Origin not allowed");
        return;
      }
    }

    next();
  }
}
