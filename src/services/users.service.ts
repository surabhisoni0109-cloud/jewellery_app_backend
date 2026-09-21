import { Injectable, HttpStatus } from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { CustomException } from '../common/exceptions/custom-exception';

export interface CreateUserData {
  type: UserType;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Normalizes emails to lowercase and trims whitespace.
   */
  public normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Trims whitespace from string inputs.
   */
  public trimInput(input: string): string {
    return input.trim();
  }

  /**
   * Finds user by (mobileNumber, type).
   */
  async findByMobileAndType(mobileNumber: string, type: UserType): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        mobileNumber_type: {
          mobileNumber: this.trimInput(mobileNumber),
          type,
        },
      },
    });
  }

  /**
   * Finds user by (email, type).
   */
  async findByEmailAndType(email: string, type: UserType): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email_type: {
          email: this.normalizeEmail(email),
          type,
        },
      },
    });
  }

  /**
   * Finds user by internal UUID id.
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Finds user by public userId (e.g. USR100001).
   */
  async findByUserId(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { userId },
    });
  }

  /**
   * Generates a unique public userId (USR100001 for USER, VND100001 for VENDOR).
   */
  private async generateNextUserId(type: UserType): Promise<string> {
    const prefix = type === UserType.USER ? 'USR' : 'VND';
    const count = await this.prisma.user.count({
      where: { type },
    });
    
    // Generates IDs starting from 100001
    const nextNumber = 100001 + count;
    let candidateId = `${prefix}${nextNumber}`;

    // Verify uniqueness in case of race condition or custom data
    let exists = await this.findByUserId(candidateId);
    let offset = 0;
    while (exists) {
      offset++;
      candidateId = `${prefix}${nextNumber + offset}`;
      exists = await this.findByUserId(candidateId);
    }

    return candidateId;
  }

  /**
   * Creates a new User record in PostgreSQL.
   */
  async createUser(data: CreateUserData): Promise<User> {
    const normalizedEmail = this.normalizeEmail(data.email);
    const trimmedMobile = this.trimInput(data.mobileNumber);
    const trimmedFirstName = this.trimInput(data.firstName);
    const trimmedLastName = this.trimInput(data.lastName);

    // Check duplicate mobileNumber + type
    const existingMobile = await this.findByMobileAndType(trimmedMobile, data.type);
    if (existingMobile) {
      throw new CustomException(
        'An account with this mobile number already exists for the specified type',
        'MOBILE_ALREADY_EXISTS',
        HttpStatus.CONFLICT,
      );
    }

    // Check duplicate email + type
    const existingEmail = await this.findByEmailAndType(normalizedEmail, data.type);
    if (existingEmail) {
      throw new CustomException(
        'An account with this email address already exists for the specified type',
        'EMAIL_ALREADY_EXISTS',
        HttpStatus.CONFLICT,
      );
    }

    const userId = await this.generateNextUserId(data.type);

    return this.prisma.user.create({
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
  }
}
