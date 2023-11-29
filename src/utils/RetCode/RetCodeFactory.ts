import { RetCode as RetCode } from "./RetCode";

class ToRetCodeTypeGuard {
    protected args;

    public constructor(args: any) {
        this.args = args;
    }

    public withRetMsg = () => {
        if (this.args instanceof RetCodeExtMsg) {
            return true;
        }
        return false;
    }

    public withRetMsgAndRetObj = () => {
        if (this.args instanceof RetCodeExtMsgObj) {
            return true;
        }
        return false;
    }

    public withRetObj = () => {
        return ( this.args ? true : false );
    }
}


export class RetCodeGenerator {
    protected retCode;
    protected retMsg;
    protected noLogging;

    public constructor(retCode: string, retMsg: string, noLoggin?: boolean) {
        this.retCode = retCode;
        this.retMsg = retMsg;
        this.noLogging = noLoggin ?? false;
    }

    protected logErr(msg: string, stack: any) {
        if (!this.noLogging && this.retCode !== "0000") {
            this.noLogging = true;
            console.log(stack)
        }
    }

    public toRetCode <T=void>(args?: RetCodeExtMsg): RetCode<T>;
    public toRetCode <T> (args: { msg?: string, obj?: T }): RetCode<T>;
    public toRetCode <T> (args: T): RetCode<T>;
    public toRetCode <T> (args?: T): RetCode<T> {
        try {
            const guard = new ToRetCodeTypeGuard(args);
            let retCode;
            let newMsg: string;

            if (guard.withRetMsg()) {
                const msg = (args as RetCodeExtMsg).getMsg();
                newMsg = msg ? `[ ${this.retMsg} ] [ ${msg} ]` : `[ ${this.retMsg} ]`;
                retCode = new RetCode<T>(
                    this,
                    this.retCode,
                    newMsg
                );
            } else if (guard.withRetMsgAndRetObj()) {
                const rawMsg = (args as RetCodeExtMsgObj).getObj();
                const msg = rawMsg.getMsg();

                const obj = (args as RetCodeExtMsgObj).getObj();

                newMsg = msg ? `[ ${this.retMsg} ] [ ${msg} ]` : `[ ${this.retMsg} ]`;
                retCode = new RetCode<T>(
                    this,
                    this.retCode,
                    newMsg,
                    obj
                );
            } else if (guard.withRetObj()) {
                newMsg = `[ ${this.retMsg} ]`;
                retCode = new RetCode<T>(
                    this,
                    this.retCode,
                    newMsg,
                    args
                );
            } else {
                newMsg = `[ ${this.retMsg} ]`;
                retCode = new RetCode<T>(this, this.retCode, newMsg);
            }

            this.logErr(newMsg, retCode.getErr().stack);
            return retCode;
        } catch (error: any) {
            return RetCodeFactory.ReturnCodeError.toRetCode(new RetCodeExtMsg(error.message));
        }
    }
}

export class RetCodeExtMsg {
    protected msg;

    public constructor(msg: string | string[]) {
        this.msg = msg;
    }

    public getMsg = () => {
        if (Array.isArray(this.msg)) {
            let buildStr = "";
            this.msg.forEach(m => {
                if (buildStr.length != 0) {
                    buildStr += " ";
                }
                buildStr += `[ ${m} ]`
            });
            return buildStr;
        }

        return this.msg;
    }
};

export class RetCodeExtMsgObj {
    protected msgObj;
    protected obj;

    public constructor(msg: string | string[], obj: any) {
        this.msgObj = new RetCodeExtMsg(msg);
        this.obj = obj;
    }

    public getMsg = () => {
        return this.msgObj.getMsg();
    }

    public getObj = () => {
        return this.obj;
    }
}

export const RetCodeFactory = {
    // 0000 : Success
    Success: new RetCodeGenerator("0000", "Success"),

    // 1XXX : Data Error
    UIDExisted: new RetCodeGenerator("1000", "UID Existed Error"),
    UIDUnknown: new RetCodeGenerator("1000", "UID Unknown Error"),
    UsernameExisted: new RetCodeGenerator("1002", "Username Existed Error"),
    LoginAuthNotExisted: new RetCodeGenerator("1003", "Login Auth Does Not Exist Error"),
    InvalidUsernameOrPassword: new RetCodeGenerator("1004", "Invalid Username Or Password"),
    InvalidLoginAuth: new RetCodeGenerator("1005", "Invalid Login Auth"),

    // 2XXX : System Error (Conventional Error)
    SystemError: new RetCodeGenerator("2000", "System Error"),

    // 3XXX : API Error
    APIError: new RetCodeGenerator("3000", "API Error"),

    // 4XXX : Calculation Error
    DataParseError: new RetCodeGenerator("4000", "Data Parse Error"),
    ArgumentError: new RetCodeGenerator("4001", "Argument Error"),

    // 9XXX: Unknown Error
    UnknownError: new RetCodeGenerator("9000", "Unknown Error"),
    ReturnCodeError: new RetCodeGenerator("9001", "Return Code Error")
};