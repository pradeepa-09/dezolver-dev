-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- AlterTable (Add isActive if it wasn't there before)
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PlanVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "planId" TEXT NOT NULL,
    "pricingMode" "PricingMode" NOT NULL DEFAULT 'AUTOMATIC',
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "minSeats" INTEGER,
    "maxSeats" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey for PlanVersion
ALTER TABLE "PlanVersion" ADD CONSTRAINT "PlanVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: Create a default PlanVersion for each existing Plan
INSERT INTO "PlanVersion" ("id", "version", "planId", "pricingMode", "price", "currency", "createdAt")
SELECT 
    gen_random_uuid()::text, -- Using pgcrypto or native gen_random_uuid() for the ID
    1, 
    "id", 
    'AUTOMATIC', 
    0, -- Default price (assume 0 if none existed before)
    'INR',
    CURRENT_TIMESTAMP
FROM "Plan";

-- AlterTable (Add nullable column first)
ALTER TABLE "Subscription" ADD COLUMN "planVersionId" TEXT;

-- Backfill: Assign the default PlanVersion to existing Subscriptions
UPDATE "Subscription"
SET "planVersionId" = "PlanVersion"."id"
FROM "PlanVersion"
WHERE "Subscription"."planId" = "PlanVersion"."planId" AND "PlanVersion"."version" = 1;

-- Now make the column NOT NULL
ALTER TABLE "Subscription" ALTER COLUMN "planVersionId" SET NOT NULL;

-- AddForeignKey for Subscription
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

