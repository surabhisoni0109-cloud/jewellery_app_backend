-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('PENDING', 'STEP_1_DONE', 'STEP_2_DONE', 'COMPLETED');

-- CreateTable
CREATE TABLE "VendorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender",
    "dob" TIMESTAMP(3),
    "profilePicture" TEXT,
    "storeName" TEXT,
    "storeDescription" TEXT,
    "storeLogo" TEXT,
    "storeCoverImages" TEXT[],
    "storeLocation" JSONB,
    "jewelleryStartingPrice" DECIMAL(10,2),
    "storeWebsite" TEXT,
    "storeContactNumber" TEXT,
    "storeEmail" TEXT,
    "storeOpeningTime" TEXT,
    "storeClosingTime" TEXT,
    "storeFoundedYear" INTEGER,
    "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'PENDING',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JewelleryShowcase" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JewelleryShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_userId_key" ON "VendorProfile"("userId");

-- CreateIndex
CREATE INDEX "VendorProfile_userId_idx" ON "VendorProfile"("userId");

-- CreateIndex
CREATE INDEX "JewelleryShowcase_vendorProfileId_idx" ON "JewelleryShowcase"("vendorProfileId");

-- AddForeignKey
ALTER TABLE "JewelleryShowcase" ADD CONSTRAINT "JewelleryShowcase_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
