/*
  Warnings:

  - Added the required column `norX` to the `Hotspot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `norY` to the `Hotspot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `norZ` to the `Hotspot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hotspot" ADD COLUMN     "norX" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "norY" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "norZ" DOUBLE PRECISION NOT NULL;
