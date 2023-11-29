import { RetCode } from "utils/RetCode/RetCode";
import { RetCodeExtMsg, RetCodeFactory } from "utils/RetCode/RetCodeFactory";
import { DevTool } from "utils/dev/DevTool";

export const logErr = <T>(error: unknown) => {
    /*
    if (error instanceof Error) {
        return RetCodeFactory.SystemError.toRetCode(new RetCodeExtMsg((error as Error)?.message));
    } else if (error instanceof RetCode) {
        DevTool.execWhenDev(() => {
            (error as RetCode).logErr();
        });
        return error;
    }

    */
return RetCodeFactory.UnknownError.toRetCode<T>(new RetCodeExtMsg(`${error}`));
}

type MethodDecoratorType = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<RetCode<T>>>) => TypedPropertyDescriptor<() => Promise<RetCode<T>>>;

/*
export const asyncFailWrap = (originalMethod: any, context: ClassMethodDecoratorContext) => {
    async function newMethod (this: any, ...args: any[]) {
        try {
            return await originalMethod.call(this, ...args);
        } catch (error) {
            return logErr(error);
        }
    }

    return newMethod;
}
*/

export const asyncFailWrap = (target: any, propertykey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async (...args: any[]) => {
        try {
            return originalMethod.apply(this, args);
        } catch (error) {
            return logErr(error);
        }
    }
    return descriptor;
}