/*
  Warnings:

  - Added the required column `category` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('VEHICLES', 'WATCHES', 'ART', 'FURNITURE', 'BOOKS', 'CAMERAS', 'JEWELRY', 'MUSIC_INSTRUMENTS');

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "category" "Category" NOT NULL;
