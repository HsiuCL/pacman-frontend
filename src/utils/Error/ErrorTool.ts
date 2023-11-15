import { RetCode } from "../RetCode/RetCode";
import { RetCodeExtMsg, RetCodeFactory } from "../RetCode/RetCodeFactory";

// TODO: change report to logger
export const logErr = (error: any) => {
    if (error instanceof Error) {
        //console.log(error.message);
        return RetCodeFactory.SystemError.toRetCode(new RetCodeExtMsg(error.message));
    } else if (error instanceof RetCode) {
        //console.log(error);
        return error;
    }
    return RetCodeFactory.UnknownError.toRetCode();
}