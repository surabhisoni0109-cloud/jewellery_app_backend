"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsMinAge = IsMinAge;
const class_validator_1 = require("class-validator");
function IsMinAge(minAge, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isMinAge',
            target: object.constructor,
            propertyName,
            constraints: [minAge],
            options: validationOptions,
            validator: {
                validate(value, _args) {
                    if (typeof value !== 'string' && !(value instanceof Date))
                        return false;
                    const dob = new Date(value);
                    if (isNaN(dob.getTime()))
                        return false;
                    const today = new Date();
                    const age = today.getFullYear() - dob.getFullYear();
                    const monthDiff = today.getMonth() - dob.getMonth();
                    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
                        ? age - 1
                        : age;
                    return adjustedAge >= minAge;
                },
                defaultMessage(_args) {
                    return `${propertyName} must indicate an age of at least ${minAge} years`;
                },
            },
        });
    };
}
//# sourceMappingURL=min-age.validator.js.map