export class DevTool {
    public static logWhenDev(...args: any[]) {
        if (process.env.NODE_ENV === "development") {
            console.log(args);
        }
    }

    public static execWhenDev(cb: CallableFunction) {
        if (process.env.NODE_ENV === "development") {
            cb();
        }
    }
}