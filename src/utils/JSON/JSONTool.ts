import { RetCode } from "utils/RetCode/RetCode";
import { RetCodeFactory } from "utils/RetCode/RetCodeFactory";
import { logErr } from "utils/error/errorTool";

export class JSONTool {
    public static deepClone = <T> (obj: T) : RetCode<T> => {
        try {
            return RetCodeFactory.Success.toRetCode(JSON.parse(JSON.stringify(obj)) as T);
        } catch (error) {
            return logErr(error);
        }
    }
}