import { RetCodeExtMsg, RetCodeExtMsgObj, RetCodeFactory } from "../RetCodeFactory";

describe("Test RetCodeFactory", () => {
    it("should generate RetCode object with correct attributes", () => {
        const success = RetCodeFactory.Success.toRetCode();
        const invalid = RetCodeFactory.InvalidEmailOrPassword.toRetCode();
        
        expect(invalid.getCode()).toBe("1006");
        expect(invalid.getMsg()).toBe("[ Invalid Email Or Password ]");
        try {
            invalid.safeGetObj();
            fail("`invalid.safeGetObj()` didn't throw error");
        } catch (error) {
            expect(error).toEqual(invalid);
        }

        try {
            invalid.throwSelf();
            fail("`invalid.throwSelf()` didn't throw error");
        } catch (error) {
            expect(error).toEqual(invalid);
        }

        try {
            invalid.throwSelfIfErr();
            fail("`invalid.throwSelfIfErr()` didn't throw error");
        } catch (error) {
            expect(error).toEqual(invalid);
        }

        try {
            success.safeGetObj();
        } catch (error) {
            fail("`success.safeGetObj()` thrown error");
        }
    });

    it("should generate correct error message in RetCode object when given RetCodeExtMsg", () => {
        const invalidOneArg = RetCodeFactory.InvalidEmailOrPassword.toRetCode(new RetCodeExtMsg("Some Error Message"));
        expect(invalidOneArg.getMsg()).toBe("[ Invalid Email Or Password ] [ Some Error Message ]");

        const invalidTwoArg = RetCodeFactory.InvalidEmailOrPassword.toRetCode(new RetCodeExtMsg(["Some Error Message 1", "Some Error Message 2"]));
        expect(invalidTwoArg.getMsg()).toBe("[ Invalid Email Or Password ] [ Some Error Message 1 ] [ Some Error Message 2 ]");
    });

    it("should generate correct error message and object in RetCode object when given RetCodeExtMsgObj", () => {
        const obj = {'a': 123, 'b': 456};
        const invalidOneArg = RetCodeFactory.InvalidEmailOrPassword.toRetCode(new RetCodeExtMsgObj("Some Error Message", obj));
        expect(invalidOneArg.getMsg()).toBe("[ Invalid Email Or Password ] [ Some Error Message ]");
        expect(invalidOneArg.getObj()).toEqual(obj);

        const invalidTwoArg = RetCodeFactory.InvalidEmailOrPassword.toRetCode(new RetCodeExtMsgObj(["Some Error Message 1", "Some Error Message 2"], obj));
        expect(invalidTwoArg.getMsg()).toBe("[ Invalid Email Or Password ] [ Some Error Message 1 ] [ Some Error Message 2 ]");
        expect(invalidTwoArg.getObj()).toEqual(obj);
    })

    it("should generate same error", () => {
        const invalid = RetCodeFactory.InvalidEmailOrPassword.toRetCode();
        expect(invalid.reGenRetCode().getCode()).toBe(invalid.getCode());
    });
});