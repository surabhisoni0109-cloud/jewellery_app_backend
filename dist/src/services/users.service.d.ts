import { User, UserType } from '@prisma/client';
import { PrismaService } from './prisma.service';
export interface CreateUserData {
    type: UserType;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
}
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    normalizeEmail(email: string): string;
    trimInput(input: string): string;
    findByMobileAndType(mobileNumber: string, type: UserType): Promise<User | null>;
    findByEmailAndType(email: string, type: UserType): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByUserId(userId: string): Promise<User | null>;
    private generateNextUserId;
    createUser(data: CreateUserData): Promise<User>;
}
