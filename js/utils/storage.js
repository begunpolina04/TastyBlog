export class StorageManager {
    constructor(key, defaultData = null) {
        this.key = key;
        this.defaultData = defaultData;
    }

    get() {
        const data = localStorage.getItem(this.key);
        if (!data && this.defaultData) {
            this.save(this.defaultData);
            return this.defaultData;
        }
        return data ? JSON.parse(data) : null;
    }

    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}