-- CreateTable
CREATE TABLE IF NOT EXISTS "UserFavoriteStore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavoriteStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserFavoriteStore_userId_vendorProfileId_key" ON "UserFavoriteStore"("userId", "vendorProfileId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserFavoriteStore_userId_idx" ON "UserFavoriteStore"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserFavoriteStore_vendorProfileId_idx" ON "UserFavoriteStore"("vendorProfileId");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserFavoriteStore_vendorProfileId_fkey') THEN
    ALTER TABLE "UserFavoriteStore" ADD CONSTRAINT "UserFavoriteStore_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
