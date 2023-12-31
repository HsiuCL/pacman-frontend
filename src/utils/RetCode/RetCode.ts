import { RetCodeGenerator } from "./RetCodeFactory";

export class RetCode<T = void> {
    protected retCodeGen;
    protected retCode;
    protected retMsg;
    protected retObj;
    protected err;
    protected logged;

    public constructor(retCodeGen: RetCodeGenerator, retCode: string, retMsg?: string, retObj?: T) {
        this.retCodeGen = retCodeGen;
        this.retCode = retCode;
        this.retMsg = retMsg ?? "";
        this.retObj = retObj;
        this.err = new Error(this.retMsg);
        this.logged = false;
    }

    public reGenRetCode<T=void>(obj?: T) {
        if (!obj) {
            return this.retCodeGen.toRetCode<T>();
        }
        return this.retCodeGen.toRetCode<T>(obj);
    }

    public getRetCodeGen() {
        return this.retCodeGen;
    }

    public getErr() {
        return this.err;
    }

    public throwSelf() {
        throw this;
    }

    public throwSelfIfErr() {
        if (!this.isSuccess()) {
            this.throwSelf();
        }
        return this;
    }

    public getMsg() {
        return this.retMsg;
    }

    public getCode() {
        return this.retCode;
    }

    public getObj() {
        if (this.retObj) {
            return this.retObj;
        }
        
        return {} as T;
    }

    public logErr(force?: boolean) {
        if (force === true || !this.logged) {
            this.logged = true;
            console.log(this.getErr().stack);
        }
    }

    /**
     * Check if self is error. If is error, throw error, else return object.
     */
    public safeGetObj() {
        this.throwSelfIfErr();
        return this.getObj();
    }

    public isSuccess() {
        return this.retCode === "0000";
    }
}