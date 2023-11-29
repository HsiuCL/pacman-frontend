export default abstract class APIBase{
    protected _URL: string | undefined;

    public constructor(URL?: string) {
        const defaultDBPath = process.env.REACT_APP_BACKEND_API;

        this._URL = URL ?? defaultDBPath;
    }

    protected getURL(): string {
        return this._URL ?? "";
    }
}