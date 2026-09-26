"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiWrappedResponse = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../dto/api-response.dto");
const ApiWrappedResponse = (model, status = 200, description = 'Successful operation') => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(api_response_dto_1.ApiSuccessResponseDto, model), (0, swagger_1.ApiResponse)({
        status,
        description,
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_dto_1.ApiSuccessResponseDto) },
                {
                    properties: {
                        data: {
                            $ref: (0, swagger_1.getSchemaPath)(model),
                        },
                    },
                },
            ],
        },
    }));
};
exports.ApiWrappedResponse = ApiWrappedResponse;
//# sourceMappingURL=api-response-wrapper.decorator.js.map