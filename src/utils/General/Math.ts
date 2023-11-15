import { logErr } from "../Error/ErrorTool";
import { RetCode } from "../RetCode/RetCode";
import { RetCodeExtMsg, RetCodeFactory } from "../RetCode/RetCodeFactory";

export const safeParseInt = (num: string): RetCode<number>  =>{
    try {
        return RetCodeFactory.Success.toRetCode(parseInt(num));
    } catch (error) {
        logErr(error);
        return RetCodeFactory.DataParseError.toRetCode(new RetCodeExtMsg(["parseInt", num]));
    }
}