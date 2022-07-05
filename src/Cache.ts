const EventEmitter = require('node:events');

class CacheManager extends EventEmitter {
    cache: Map<string, object>;
    constructor() {
        super();
        this.cache = new Map();
    }

    get(key: any) {
        return this.cache.get(key);
    }
    set(key: any, value: object) {
        this.cache.set(key, value);
    }
    has(key: any) {
        return this.cache.has(key);
    }
    delete(key: any) {
        this.cache.delete(key);
    }
}

export { CacheManager };