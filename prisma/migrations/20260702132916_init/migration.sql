/*
  Warnings:

  - You are about to alter the column `startPrice` on the `Auction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `currentPrice` on the `Auction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `Bid` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Auction" ALTER COLUMN "startPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "currentPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Bid" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
