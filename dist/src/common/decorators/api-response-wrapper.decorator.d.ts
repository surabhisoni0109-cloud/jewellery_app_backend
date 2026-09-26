import { Type } from '@nestjs/common';
export declare const ApiWrappedResponse: <TModel extends Type<any>>(model: TModel, status?: number, description?: string) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
