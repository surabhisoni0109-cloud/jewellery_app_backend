import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'd17a0dc9de26c5e8f9b6ba9b39f881cc683a8d409fafa6ca486647d17dec4f56';

async function main() {
  const user = await prisma.user.findFirst({
    where: { mobileNumber: '9876543215', type: 'VENDOR' },
  });

  if (!user) {
    console.error('Vendor not found');
    return;
  }

  // Generate a valid JWT token for this vendor (valid for 30 days)
  const token = jwt.sign(
    {
      sub: user.userId,
      type: user.type,
      mobileNumber: user.mobileNumber,
    },
    jwtSecret,
    { expiresIn: '30d' }
  );

  console.log('\n======================================================');
  console.log('🔑 TEST JWT ACCESS TOKEN FOR VENDOR (9876543215):');
  console.log('======================================================');
  console.log(token);
  console.log('======================================================\n');

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: user.userId },
  });

  if (!profile) {
    console.error('Vendor profile not found');
    return;
  }

  // 1. Analytics
  const [totalStoreViews, totalEnquiries, totalRatings, totalProductsListed] = await Promise.all([
    prisma.vendorStoreView.count({ where: { vendorProfileId: profile.id } }),
    prisma.vendorEnquiry.count({ where: { vendorProfileId: profile.id } }),
    prisma.vendorRating.count({ where: { vendorProfileId: profile.id } }),
    prisma.jewelleryShowcase.count({ where: { vendorProfileId: profile.id } }),
  ]);

  console.log('1. GET /api/vendor/dashboard/analytics response data:');
  console.log(JSON.stringify({
    totalStoreViews,
    totalEnquiries,
    totalRatings,
    totalProductsListed,
  }, null, 2));

  // 2. Ratings summary
  const allRatings = await prisma.vendorRating.findMany({
    where: { vendorProfileId: profile.id },
    select: { rating: true },
  });
  const avg = allRatings.length ? (allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length).toFixed(1) : 0;
  console.log('\n2. GET /api/vendor/dashboard/ratings-summary response data:');
  console.log(JSON.stringify({
    averageRating: Number(avg),
    totalRatings: allRatings.length,
    breakdown: {
      5: allRatings.filter(r => r.rating === 5).length,
      4: allRatings.filter(r => r.rating === 4).length,
      3: allRatings.filter(r => r.rating === 3).length,
      2: allRatings.filter(r => r.rating === 2).length,
      1: allRatings.filter(r => r.rating === 1).length,
    }
  }, null, 2));

  // 3. Sample enquiries
  const sampleEnquiries = await prisma.vendorEnquiry.findMany({
    where: { vendorProfileId: profile.id },
    take: 2,
    include: { jewellery: { select: { title: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log('\n3. GET /api/vendor/dashboard/enquiries sample data:');
  console.log(JSON.stringify(sampleEnquiries, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
