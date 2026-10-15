"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("./prisma.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    trimInput(input) {
        return input.trim();
    }
    async findByMobileAndType(mobileNumber, type) {
        return this.prisma.user.findUnique({
            where: {
                mobileNumber_type: {
                    mobileNumber: this.trimInput(mobileNumber),
                    type,
                },
            },
        });
    }
    async findByEmailAndType(email, type) {
        return this.prisma.user.findUnique({
            where: {
                email_type: {
                    email: this.normalizeEmail(email),
                    type,
                },
            },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return this.prisma.user.findUnique({
            where: { userId },
        });
    }
    async generateNextUserId(type) {
        const prefix = type === client_1.UserType.USER ? 'USR' : 'VND';
        const seqName = type === client_1.UserType.USER ? 'user_id_seq' : 'vendor_id_seq';
        if (this.prisma?.$queryRawUnsafe) {
            const result = await this.prisma.$queryRawUnsafe(`SELECT nextval('${seqName}') as val;`);
            const nextNumber = result[0]?.val;
            if (nextNumber !== undefined && nextNumber !== null) {
                return `${prefix}${nextNumber}`;
            }
        }
        const count = await this.prisma.user.count({ where: { type } });
        return `${prefix}${100001 + count}`;
    }
    async createUser(data) {
        const normalizedEmail = this.normalizeEmail(data.email);
        const trimmedMobile = this.trimInput(data.mobileNumber);
        const trimmedFirstName = this.trimInput(data.firstName);
        const trimmedLastName = this.trimInput(data.lastName);
        const existingMobile = await this.findByMobileAndType(trimmedMobile, data.type);
        if (existingMobile) {
            throw new custom_exception_1.CustomException('An account with this mobile number already exists for the specified type', 'MOBILE_ALREADY_EXISTS', common_1.HttpStatus.CONFLICT);
        }
        const existingEmail = await this.findByEmailAndType(normalizedEmail, data.type);
        if (existingEmail) {
            throw new custom_exception_1.CustomException('An account with this email address already exists for the specified type', 'EMAIL_ALREADY_EXISTS', common_1.HttpStatus.CONFLICT);
        }
        const userId = await this.generateNextUserId(data.type);
        const user = await this.prisma.user.create({
            data: {
                userId,
                type: data.type,
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                mobileNumber: trimmedMobile,
                email: normalizedEmail,
                status: 'ACTIVE',
                isMobileVerified: true,
            },
        });
        if (data.type === client_1.UserType.USER) {
            await this.prisma.userProfile.upsert({
                where: { userId },
                create: { userId, isOnboarded: false },
                update: {
                    gender: null,
                    dob: null,
                    profilePicture: null,
                    location: client_1.Prisma.DbNull,
                    isOnboarded: false,
                },
            });
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map