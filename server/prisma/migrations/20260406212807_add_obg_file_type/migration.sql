/*
  Warnings:

  - You are about to drop the column `modelPath` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `multimediaPath` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailPath` on the `Model` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('GLB', 'OBJ');

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "modelPath",
DROP COLUMN "multimediaPath",
DROP COLUMN "thumbnailPath",
ADD COLUMN     "objFileType" "FileType";
