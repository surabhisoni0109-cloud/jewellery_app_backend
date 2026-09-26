import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a date-string represents a person aged >= minAge years.
 * Usage: @IsMinAge(18)
 */
export function IsMinAge(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isMinAge',
      target: object.constructor,
      propertyName,
      constraints: [minAge],
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string' && !(value instanceof Date)) return false;
          const dob = new Date(value);
          if (isNaN(dob.getTime())) return false;
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const adjustedAge =
            monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
              ? age - 1
              : age;
          return adjustedAge >= minAge;
        },
        defaultMessage(_args: ValidationArguments) {
          return `${propertyName} must indicate an age of at least ${minAge} years`;
        },
      },
    });
  };
}
