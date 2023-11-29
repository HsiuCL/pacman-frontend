export class LocalStorageMock {
    public store: Record<string, string>;
    public length: number;
    protected storeList: Array<string>;

    public constructor() {
      this.store = {};
      this.length = 0;
      this.storeList = [];
    }
  
    public clear() {
      this.store = {};
      this.length = 0;
    }
  
    public getItem(key: string) {
      return this.store[key] || null;
    }
  
    public setItem(key: string, value: any) {
        if (!this.store.hasOwnProperty(key)) {
            this.storeList.push(key);
            this.length = this.storeList.length;
        }
        this.store[key] = String(value);
    }
  
    public removeItem(key: string) {
        if (this.store.hasOwnProperty(key)) {
            delete this.store[key];
            this.storeList = this.storeList.filter(item => item !== key);
            this.length = this.storeList.length;
        }
    }

    public key(index: number) {
        return null;
    }
}
