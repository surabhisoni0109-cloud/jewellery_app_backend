"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding initial marketplace user records...');
    const adminEmail = 'admin@jewellery.com';
    const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin@123', 12);
        const admin = await prisma.admin.create({
            data: {
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
            },
        });
        console.log(`Seeded Admin: ${admin.name} (${admin.email}) — Password: Admin@123`);
    }
    else {
        console.log('Default admin already exists — skipping.');
    }
    const sampleUser = await prisma.user.upsert({
        where: {
            mobileNumber_type: {
                mobileNumber: '9876543210',
                type: client_1.UserType.USER,
            },
        },
        update: {},
        create: {
            userId: 'USR100001',
            type: client_1.UserType.USER,
            firstName: 'Yogesh',
            lastName: 'Soni',
            mobileNumber: '9876543210',
            email: 'yogesh.user@example.com',
            status: client_1.UserStatus.ACTIVE,
            isMobileVerified: true,
        },
    });
    console.log(`Seeded Buyer User: ${sampleUser.userId} (${sampleUser.firstName} ${sampleUser.lastName})`);
    const sampleVendor = await prisma.user.upsert({
        where: {
            mobileNumber_type: {
                mobileNumber: '9876543211',
                type: client_1.UserType.VENDOR,
            },
        },
        update: {},
        create: {
            userId: 'VND100001',
            type: client_1.UserType.VENDOR,
            firstName: 'Surabhi',
            lastName: 'Jewellers',
            mobileNumber: '9876543211',
            email: 'surabhi.vendor@example.com',
            status: client_1.UserStatus.ACTIVE,
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
//# sourceMappingURL=seed.js.map