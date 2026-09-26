import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ResponseFormat<T> {
    success: boolean;
    message: string;
    data: T;
}
export declare class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>>;
}
