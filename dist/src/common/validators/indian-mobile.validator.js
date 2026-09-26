"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDIAN_MOBILE_REGEX = void 0;
exports.IsIndianMobile = IsIndianMobile;
const class_validator_1 = require("class-validator");
exports.INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
function IsIndianMobile(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isIndianMobile',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, _args) {
                    return typeof value === 'string' && exports.INDIAN_MOBILE_REGEX.test(value);
                },
                defaultMessage(_args) {
                    return `${propertyName} must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9`;
                },
            },
        });
    };
}
//# sourceMappingURL=indian-mobile.validator.js.map