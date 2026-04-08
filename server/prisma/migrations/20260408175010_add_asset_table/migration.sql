-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('GLB', 'OBJ', 'MTL', 'TEXTURE');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "modelId" UUID NOT NULL,
    "type" "AssetType" NOT NULL,
    "filename" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
