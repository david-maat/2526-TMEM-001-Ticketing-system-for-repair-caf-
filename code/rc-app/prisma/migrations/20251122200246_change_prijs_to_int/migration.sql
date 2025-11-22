/*
  Warnings:

  - You are about to alter the column `prijs` on the `Materiaal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Materiaal" ALTER COLUMN "prijs" SET DATA TYPE INTEGER;
