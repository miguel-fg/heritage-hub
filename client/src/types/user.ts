export type PermissionLevel = "RESTRICTED" | "STANDARD" | "FULL" | "ADMIN";

export type User = {
  id: string;
  casId: string;
  authType: string | null;
  email: string | null;
  displayName: string | null,
  permissions: PermissionLevel;
}

export type UserWithCount = User & {
  _count: {
    models: number;
  }
}
