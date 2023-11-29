import { RetCode } from "utils/RetCode/RetCode";
import { RetCodeExtMsg, RetCodeFactory } from "utils/RetCode/RetCodeFactory"

export const safeParseInt = (num: string): RetCode<number> => {
    try {
        return RetCodeFactory.Success.toRetCode<number>(parseInt(num));
    } catch (error) {
        return RetCodeFactory.DataParseError.toRetCode<number>(new RetCodeExtMsg(["parseInt", num]));
    }
}