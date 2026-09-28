-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN IF NOT EXISTS "storeOwnerName" TEXT,
ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "VendorStoreView" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "viewerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorStoreView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VendorEnquiry" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerMobile" TEXT NOT NULL,
    "customerProfileImage" TEXT,
    "message" TEXT NOT NULL,
    "jewelleryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VendorRating" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerProfileImage" TEXT,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VendorStoreView_vendorProfileId_createdAt_idx" ON "VendorStoreView"("vendorProfileId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VendorEnquiry_enquiryId_key" ON "VendorEnquiry"("enquiryId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VendorEnquiry_vendorProfileId_createdAt_idx" ON "VendorEnquiry"("vendorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VendorRating_vendorProfileId_rating_idx" ON "VendorRating"("vendorProfileId", "rating");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VendorRating_vendorProfileId_createdAt_idx" ON "VendorRating"("vendorProfileId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VendorStoreView_vendorProfileId_fkey') THEN
    ALTER TABLE "VendorStoreView" ADD CONSTRAINT "VendorStoreView_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VendorEnquiry_vendorProfileId_fkey') THEN
    ALTER TABLE "VendorEnquiry" ADD CONSTRAINT "VendorEnquiry_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VendorEnquiry_jewelleryId_fkey') THEN
    ALTER TABLE "VendorEnquiry" ADD CONSTRAINT "VendorEnquiry_jewelleryId_fkey" FOREIGN KEY ("jewelleryId") REFERENCES "JewelleryShowcase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VendorRating_vendorProfileId_fkey') THEN
    ALTER TABLE "VendorRating" ADD CONSTRAINT "VendorRating_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
