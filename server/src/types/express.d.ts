import "express"

declare module "express" {
  export interface Request {
    user?: {
      id: string;
      casId: string;
      displayName: string | null;
      permissions: "RESTRICTED" | "STANDARD" | "FULL" | "ADMIN";
    }
  }
}
