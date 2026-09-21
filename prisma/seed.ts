import { PrismaClient, UserStatus, UserType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial marketplace user records...');

  // Seed sample buyer account
  const sampleUser = await prisma.user.upsert({
    where: {
      mobileNumber_type: {
        mobileNumber: '9876543210',
        type: UserType.USER,
      },
    },
    update: {},
    create: {
      userId: 'USR100001',
      type: UserType.USER,
      firstName: 'Yogesh',
      lastName: 'Soni',
      mobileNumber: '9876543210',
      email: 'yogesh.user@example.com',
      status: UserStatus.ACTIVE,
      isMobileVerified: true,
    },
  });

  console.log(`Seeded Buyer User: ${sampleUser.userId} (${sampleUser.firstName} ${sampleUser.lastName})`);

  // Seed sample vendor account
  const sampleVendor = await prisma.user.upsert({
    where: {
      mobileNumber_type: {
        mobileNumber: '9876543211',
        type: UserType.VENDOR,
      },
    },
    update: {},
    create: {
      userId: 'VND100001',
      type: UserType.VENDOR,
      firstName: 'Surabhi',
      lastName: 'Jewellers',
      mobileNumber: '9876543211',
      email: 'surabhi.vendor@example.com',
      status: UserStatus.ACTIVE,
      isMobileVerified: true,
    },
  });

  console.log(`Seeded Vendor User: ${sampleVendor.userId} (${sampleVendor.firstName} ${sampleVendor.lastName})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during database seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
