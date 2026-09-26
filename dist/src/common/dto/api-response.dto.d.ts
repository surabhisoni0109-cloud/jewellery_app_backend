export declare class ErrorDetailDto {
    code: string;
}
export declare class ApiErrorResponseDto {
    success: boolean;
    message: string;
    error: ErrorDetailDto;
}
export declare class ApiSuccessResponseDto<T> {
    success: boolean;
    message: string;
    data: T;
}
