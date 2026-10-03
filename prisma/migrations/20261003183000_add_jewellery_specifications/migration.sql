-- AlterTable
ALTER TABLE "JewelleryShowcase"
ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "jewelleryType" TEXT,
ADD COLUMN IF NOT EXISTS "weight" TEXT,
ADD COLUMN IF NOT EXISTS "purity" TEXT,
ADD COLUMN IF NOT EXISTS "gender" TEXT,
ADD COLUMN IF NOT EXISTS "hasSpecialOccasion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "specialOccasionName" TEXT,
ADD COLUMN IF NOT EXISTS "specialOccasionDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "hasDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "discountPercentage" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "discountPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JewelleryShowcase_jewelleryType_idx" ON "JewelleryShowcase"("jewelleryType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JewelleryShowcase_gender_idx" ON "JewelleryShowcase"("gender");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JewelleryShowcase_isPublished_idx" ON "JewelleryShowcase"("isPublished");
