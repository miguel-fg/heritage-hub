/*
  Warnings:

  - You are about to drop the column `dimensions` on the `Model` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DimensionType" AS ENUM ('WIDTH', 'HEIGHT', 'DEPTH', 'WEIGHT', 'VOLUME');

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "dimensions";

-- CreateTable
CREATE TABLE "Dimension" (
    "id" SERIAL NOT NULL,
    "modelId" UUID NOT NULL,
    "type" "DimensionType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "Dimension_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dimension" ADD CONSTRAINT "Dimension_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
