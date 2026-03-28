-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BOOST', 'SURVIVOR_FULL', 'SURVIVOR_PTS');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'BOOST',
ADD COLUMN     "seasonEnd" TIMESTAMP(3),
ADD COLUMN     "targetPts" INTEGER;
