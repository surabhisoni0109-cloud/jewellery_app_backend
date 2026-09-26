import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates HH:MM 24-hour time format.
 * Usage: @IsTimeFormat()
 */
export function IsTimeFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isTimeFormat',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && TIME_REGEX.test(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return `${propertyName} must be a valid time in HH:MM format (24-hour)`;
        },
      },
    });
  };
}
