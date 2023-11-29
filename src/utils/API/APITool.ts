import path from "path";
import { DevTool } from "../dev/DevTool";
import { RetCode } from "../RetCode/RetCode";
import { RetCodeExtMsg, RetCodeFactory } from "../RetCode/RetCodeFactory";
import { logErr } from "../error/ErrorTool";

enum HTTPMethod {
    POST = "POST",
    GET = "GET",
    DELETE = "DELETE"
}

export class APIRequestArgs {
    protected urlParams: Record<string, any> = {};
    protected bodyParams: Record<string, any> = {};

    public constructor() {}
    
    public setPathParams(urlParams: Record<string, any>) {
        this.urlParams = urlParams;
        return this;
    }

    public getPathParams() {
        return this.urlParams;
    }

    public setQueryParams(bodyParams: Record<string, any>) {
        this.bodyParams = bodyParams;
        return this;
    }

    public getQueryParams() {
        return this.bodyParams;
    }
}

export const apiGET = async <T> (urlStr: string, pathname: string, args?: Record<string, any>): Promise<RetCode<T>> => {
    args ??= {};
    return apiFetch<T>(HTTPMethod.GET, urlStr, pathname, args, {});
}

export const apiPOST = async <T> (urlStr: string, pathname: string, args?: Record<string, any>): Promise<RetCode<T>> => {
    args ??= {};
    return apiFetch<T>(HTTPMethod.POST, urlStr, pathname, {}, args);
}

export const apiDELETE = async <T> (urlStr: string, pathname: string, args?: Record<string, any>): Promise<RetCode<T>> => {
    args ??= {};
    return apiFetch<T>(HTTPMethod.DELETE, urlStr, pathname, args, {});
}

const apiFetch  = async <T> (method: HTTPMethod, urlStr: string, pathname: string,
        urlParams: Record<string, any>, bodyParams: Record<string, any>) : Promise<RetCode<T>> => {

    try {
        urlParams ??= {};
        bodyParams ??= {};

        const url = new URL(urlStr);
        url.pathname = pathname;
        url.search = new URLSearchParams(urlParams).toString();
        DevTool.logWhenDev(`[ ${method} ] [ ${urlStr} ] [ ${pathname} ] [ ${urlParams ? JSON.stringify(urlParams) : ""} ] [ ${bodyParams ? JSON.stringify(bodyParams) : ""} ] [ ${url.toString()} ]`);


        let res;
        switch (method) {
            case HTTPMethod.GET: case HTTPMethod.DELETE:
                res = await fetch(
                    url.toString(), {
                        method: method.toString(),
                        credentials: "include"
                    }
                );
                break;

            case HTTPMethod.POST:
                res = await fetch(
                    url.toString(), {
                        method: method.toString(),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bodyParams),
                        credentials: "include"
                    }
                );
                break;
        }
        const data: T = await res.json();

        if (res.ok) {
            return RetCodeFactory.Success.toRetCode<T>(data);
        } else {
            console.log(data);
        }

        return RetCodeFactory.APIError.toRetCode<T>(new RetCodeExtMsg([pathname, JSON.stringify(urlParams), res.status.toString(), JSON.stringify(data)]));
    } catch (error) {
        return logErr(error);
    }
}