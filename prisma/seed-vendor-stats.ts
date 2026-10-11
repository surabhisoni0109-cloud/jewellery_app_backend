import { PrismaClient, UserType, UserStatus, Gender, OnboardingStep } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_MOBILE = '9876543215';

async function main() {
  console.log(`\n======================================================`);
  console.log(`💎 Populating Dummy Dashboard Data for Vendor: ${TARGET_MOBILE}`);
  console.log(`======================================================\n`);

  // 1. Locate or create the Vendor User
  let vendorUser = await prisma.user.findFirst({
    where: {
      mobileNumber: TARGET_MOBILE,
      type: UserType.VENDOR,
    },
  });

  async function getNextVendorUserId(): Promise<string> {
    const count = await prisma.user.count({ where: { type: UserType.VENDOR } });
    let nextNum = 100001 + count;
    let candidate = `VND${nextNum}`;
    while (await prisma.user.findUnique({ where: { userId: candidate } })) {
      nextNum++;
      candidate = `VND${nextNum}`;
    }
    return candidate;
  }

  if (!vendorUser) {
    // Check if user exists as USER type
    const normalUser = await prisma.user.findFirst({
      where: {
        mobileNumber: TARGET_MOBILE,
        type: UserType.USER,
      },
    });

    if (normalUser) {
      console.log(`Found account ${TARGET_MOBILE} with type 'USER'. Updating to 'VENDOR'...`);
      const nextVndId = await getNextVendorUserId();
      vendorUser = await prisma.user.update({
        where: { id: normalUser.id },
        data: {
          type: UserType.VENDOR,
          userId: nextVndId,
        },
      });
    } else {
      console.log(`Account ${TARGET_MOBILE} not found. Creating new VENDOR account...`);
      const nextVndId = await getNextVendorUserId();
      vendorUser = await prisma.user.create({
        data: {
          userId: nextVndId,
          type: UserType.VENDOR,
          firstName: 'Aman',
          lastName: 'Gandhi',
          mobileNumber: TARGET_MOBILE,
          email: 'aman.jewels@example.com',
          status: UserStatus.ACTIVE,
          isMobileVerified: true,
        },
      });
    }
  }

  console.log(`✅ Vendor User: ${vendorUser.userId} (${vendorUser.firstName} ${vendorUser.lastName})`);

  // 2. Ensure VendorProfile exists and is fully onboarded
  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.userId },
    update: {
      storeName: 'Aman Heritage Jewels & Diamonds',
      storeDescription: 'Premier manufacturer of hallmarked 22K gold, certified diamonds, and heritage polki jewellery.',
      storeOwnerName: `${vendorUser.firstName} ${vendorUser.lastName}`,
      storeContactNumber: TARGET_MOBILE,
      whatsappNumber: TARGET_MOBILE,
      storeEmail: vendorUser.email,
      storeFoundedYear: 1994,
      jewelleryStartingPrice: 5000,
      storeOpeningTime: '10:00 AM',
      storeClosingTime: '08:30 PM',
      storeWebsite: 'https://amanjewels.com',
      storeCoverImages: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
      ],
      storeLocation: {
        addressLine1: 'Shop 42, Zaveri Bazaar',
        area: 'Kalbadevi',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        country: 'India',
        latitude: 18.9535,
        longitude: 72.8315,
      },
      onboardingStep: OnboardingStep.COMPLETED,
      isOnboarded: true,
      gender: Gender.MALE,
    },
    create: {
      userId: vendorUser.userId,
      storeName: 'Aman Heritage Jewels & Diamonds',
      storeDescription: 'Premier manufacturer of hallmarked 22K gold, certified diamonds, and heritage polki jewellery.',
      storeOwnerName: `${vendorUser.firstName} ${vendorUser.lastName}`,
      storeContactNumber: TARGET_MOBILE,
      whatsappNumber: TARGET_MOBILE,
      storeEmail: vendorUser.email,
      storeFoundedYear: 1994,
      jewelleryStartingPrice: 5000,
      storeOpeningTime: '10:00 AM',
      storeClosingTime: '08:30 PM',
      storeWebsite: 'https://amanjewels.com',
      storeCoverImages: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
      ],
      storeLocation: {
        addressLine1: 'Shop 42, Zaveri Bazaar',
        area: 'Kalbadevi',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        country: 'India',
        latitude: 18.9535,
        longitude: 72.8315,
      },
      onboardingStep: OnboardingStep.COMPLETED,
      isOnboarded: true,
      gender: Gender.MALE,
    },
  });

  console.log(`✅ Vendor Profile ready (ID: ${vendorProfile.id})`);

  // 3. Clean previous dummy records for this vendor to ensure clean state
  await prisma.vendorEnquiry.deleteMany({ where: { vendorProfileId: vendorProfile.id } });
  await prisma.vendorRating.deleteMany({ where: { vendorProfileId: vendorProfile.id } });
  await prisma.vendorStoreView.deleteMany({ where: { vendorProfileId: vendorProfile.id } });
  await prisma.jewelleryShowcase.deleteMany({ where: { vendorProfileId: vendorProfile.id } });

  // 4. Seed Jewellery Showcase Items
  const showcaseData = [
    {
      title: '22K Royal Gold Kundan Choker',
      description: 'Handcrafted bridal Kundan choker set embedded with uncut polki and emerald drops.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      ],
      price: 185000,
      jewelleryType: 'Gold',
      weight: '48.5g',
      purity: '22K',
      gender: 'Women',
      hasSpecialOccasion: true,
      specialOccasionName: 'Wedding Season Special',
      hasDiscount: true,
      discountPercentage: 10,
      discountPrice: 166500,
      isPublished: true,
    },
    {
      title: '1.5 Carat Solitaire Diamond Ring',
      description: 'IGI certified VVS1 clarity round brilliant cut diamond mounted on 18K white gold band.',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      ],
      price: 245000,
      jewelleryType: 'Diamond',
      weight: '4.2g',
      purity: '18K White Gold',
      gender: 'Women',
      hasSpecialOccasion: true,
      specialOccasionName: 'Engagement Ring',
      hasDiscount: false,
      isPublished: true,
    },
    {
      title: 'Antique Temple Gold Kada (Pair)',
      description: 'Traditional South Indian Lakshmi motif antique matte finished gold bangles with ruby accents.',
      imageUrl: 'https://images.unsplash.com/photo-1611591475811-968595568eb2?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1611591475811-968595568eb2?auto=format&fit=crop&w=800&q=80',
      ],
      price: 125000,
      jewelleryType: 'Gold',
      weight: '32.0g',
      purity: '22K',
      gender: 'Women',
      hasSpecialOccasion: false,
      hasDiscount: true,
      discountPercentage: 5,
      discountPrice: 118750,
      isPublished: true,
    },
    {
      title: 'Emerald & Diamond Cocktail Earrings',
      description: 'Stunning Colombian emerald teardrop earrings surrounded by a halo of natural diamonds.',
      imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      ],
      price: 88000,
      jewelleryType: 'Diamond',
      weight: '12.4g',
      purity: '18K Gold',
      gender: 'Women',
      hasSpecialOccasion: false,
      hasDiscount: false,
      isPublished: true,
    },
    {
      title: 'Men’s Platinum & Rose Gold Band',
      description: 'Contemporary dual-tone 950 platinum and 18K rose gold ring with brushed matte texture.',
      imageUrl: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
      ],
      price: 54000,
      jewelleryType: 'Platinum',
      weight: '8.1g',
      purity: 'PT950 / 18K',
      gender: 'Men',
      hasSpecialOccasion: false,
      hasDiscount: true,
      discountPercentage: 8,
      discountPrice: 49680,
      isPublished: true,
    },
    {
      title: 'Heritage Polki Raani Haar',
      description: 'Seven-layered majestic royal Raani Haar featuring syndicate polki diamonds and Basra pearls.',
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      ],
      price: 340000,
      jewelleryType: 'Polki',
      weight: '92.0g',
      purity: '22K',
      gender: 'Women',
      hasSpecialOccasion: true,
      specialOccasionName: 'Bridal Collection',
      hasDiscount: false,
      isPublished: true,
    },
  ];

  const createdShowcases = [];
  for (const s of showcaseData) {
    const item = await prisma.jewelleryShowcase.create({
      data: {
        vendorProfileId: vendorProfile.id,
        ...s,
      },
    });
    createdShowcases.push(item);
  }
  console.log(`✅ Seeded ${createdShowcases.length} Jewellery Showcase products`);

  // 5. Seed Store Views across last 30 days (so graphs for Day, Week, Month, Year look active)
  const now = new Date();
  const storeViewInserts: { vendorProfileId: string; createdAt: Date }[] = [];

  // Generate views for the past 30 days
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    // Generate between 5 and 18 views per day
    const viewsForDay = Math.floor(Math.random() * 14) + 5;
    for (let i = 0; i < viewsForDay; i++) {
      const viewDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      // Random hour between 9 AM and 10 PM
      viewDate.setHours(9 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60));
      storeViewInserts.push({
        vendorProfileId: vendorProfile.id,
        createdAt: viewDate,
      });
    }
  }

  await prisma.vendorStoreView.createMany({
    data: storeViewInserts,
  });
  console.log(`✅ Seeded ${storeViewInserts.length} Store Views (distributed over past 30 days)`);

  // 6. Seed Customer Enquiries
  const sampleCustomers = [
    { name: 'Pooja Verma', mobile: '9820123456', message: 'Hello! Is this 22K Kundan Choker available for in-store trial this weekend?' },
    { name: 'Rajesh Singhania', mobile: '9819234567', message: 'Interested in the 1.5 Carat Solitaire ring. Does it come with IGI certification?' },
    { name: 'Neha Kapoor', mobile: '9833345678', message: 'Could you please customize the Temple Gold Kada in size 2.4?' },
    { name: 'Vikram Mehta', mobile: '9821456789', message: 'Hi Aman, what is the making charge on the Men’s Platinum Band?' },
    { name: 'Sunita Agarwal', mobile: '9892567890', message: 'Please share video of the Emerald & Diamond earrings under natural light.' },
    { name: 'Ananya Deshmukh', mobile: '9867678901', message: 'We want to book an appointment for bridal trousseau consultation next Tuesday.' },
    { name: 'Karan Malhotra', mobile: '9811789012', message: 'Can you offer an exchange on 22K hallmarked gold for the Raani Haar?' },
    { name: 'Divya Chawla', mobile: '9830890123', message: 'Loved your collection! Do you ship with insured delivery to Bangalore?' },
    { name: 'Gaurav Bansal', mobile: '9845901234', message: 'Looking for a matching bracelet to go with the solitaire ring.' },
    { name: 'Ritu Sen', mobile: '9870012345', message: 'Is the 10% discount on the Kundan Choker applicable till Diwali?' },
  ];

  let enqCount = 0;
  for (let i = 0; i < sampleCustomers.length; i++) {
    const cust = sampleCustomers[i];
    const daysAgo = Math.floor(Math.random() * 25);
    const enqDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const linkedJewellery = createdShowcases[i % createdShowcases.length];

    await prisma.vendorEnquiry.create({
      data: {
        enquiryId: `ENQ${Date.now() + i}`,
        vendorProfileId: vendorProfile.id,
        customerName: cust.name,
        customerMobile: cust.mobile,
        message: cust.message,
        jewelleryId: linkedJewellery.id,
        createdAt: enqDate,
      },
    });
    enqCount++;
  }
  console.log(`✅ Seeded ${enqCount} Customer Enquiries with product links`);

  // 7. Seed Ratings and Reviews
  const reviews = [
    { name: 'Kavita Joshi', rating: 5, review: 'Exceptional craftsmanship! The Kundan choker made my wedding look truly royal. 100% recommended!' },
    { name: 'Amitabh Sen', rating: 5, review: 'Bought the solitaire ring for our 10th anniversary. Authentic certificate and best pricing in Zaveri Bazaar.' },
    { name: 'Roshni Patel', rating: 5, review: 'Very courteous staff and genuine hallmark certification. Transparent billing.' },
    { name: 'Deepak Shah', rating: 4, review: 'Great collection of antique temple jewellery. Finished on time as promised.' },
    { name: 'Meera Trivedi', rating: 5, review: 'Superb finishing on the emerald earrings. Prompt response on WhatsApp!' },
    { name: 'Harish Rathi', rating: 4, review: 'Authentic hallmark gold and very honest weight breakdown. Satisfied customer.' },
    { name: 'Simran Gulati', rating: 5, review: 'One of the finest jewellery showrooms in town. The Raani haar is a masterpiece.' },
    { name: 'Pradeep Goyal', rating: 5, review: 'Fast consultation and beautiful customized designs. Highly trustworthy.' },
  ];

  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    const daysAgo = Math.floor(Math.random() * 20);
    const revDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    await prisma.vendorRating.create({
      data: {
        vendorProfileId: vendorProfile.id,
        customerName: r.name,
        rating: r.rating,
        review: r.review,
        createdAt: revDate,
      },
    });
  }
  console.log(`✅ Seeded ${reviews.length} Customer Ratings & Reviews (Average: 4.88 ⭐)`);

  // 8. Verify and Display Final Dashboard Statistics
  const [totalStoreViews, totalEnquiries, totalRatings, totalProductsListed] = await Promise.all([
    prisma.vendorStoreView.count({ where: { vendorProfileId: vendorProfile.id } }),
    prisma.vendorEnquiry.count({ where: { vendorProfileId: vendorProfile.id } }),
    prisma.vendorRating.count({ where: { vendorProfileId: vendorProfile.id } }),
    prisma.jewelleryShowcase.count({ where: { vendorProfileId: vendorProfile.id } }),
  ]);

  console.log(`\n======================================================`);
  console.log(`📊 LIVE DASHBOARD STATISTICS FOR ${TARGET_MOBILE}:`);
  console.log(`======================================================`);
  console.log(`👁️  Total Store Views:       ${totalStoreViews}`);
  console.log(`📩 Total Customer Enquiries:  ${totalEnquiries}`);
  console.log(`⭐ Total Ratings & Reviews:  ${totalRatings}`);
  console.log(`💍 Total Products Listed:    ${totalProductsListed}`);
  console.log(`🏪 Store:                    ${vendorProfile.storeName}`);
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
