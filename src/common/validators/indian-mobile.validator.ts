import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function IsIndianMobile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isIndianMobile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && INDIAN_MOBILE_REGEX.test(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return `${propertyName} must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9`;
        },
      },
    });
  };
}
