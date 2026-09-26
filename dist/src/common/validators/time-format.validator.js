"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsTimeFormat = IsTimeFormat;
const class_validator_1 = require("class-validator");
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
function IsTimeFormat(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isTimeFormat',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value, _args) {
                    return typeof value === 'string' && TIME_REGEX.test(value);
                },
                defaultMessage(_args) {
                    return `${propertyName} must be a valid time in HH:MM format (24-hour)`;
                },
            },
        });
    };
}
//# sourceMappingURL=time-format.validator.js.map