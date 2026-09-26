"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomException = void 0;
const common_1 = require("@nestjs/common");
class CustomException extends common_1.HttpException {
    constructor(message, errorCode, statusCode) {
        super({
            success: false,
            message,
            error: {
                code: errorCode,
            },
        }, statusCode);
        this.errorCode = errorCode;
    }
}
exports.CustomException = CustomException;
//# sourceMappingURL=custom-exception.js.map