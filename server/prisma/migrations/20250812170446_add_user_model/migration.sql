-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('RESTRICTED', 'STANDARD', 'FULL', 'ADMIN');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "ownerId" UUID;

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "casId" TEXT NOT NULL,
    "authType" TEXT,
    "displayName" TEXT,
    "email" TEXT,
    "permissions" "PermissionLevel" NOT NULL DEFAULT 'STANDARD',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_casId_key" ON "User"("casId");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
