import fs from 'fs';
import path from 'path';

function exists(dir: string) {
    try { fs.accessSync(dir); } 
    catch(err) { return false; }
    return true;
};

interface CacheOptions {
    base?: string;
    name?: string;
    duration?: number;
    memory?: boolean;
    persist?: boolean;
};

interface CacheManager {
    base: string;
    cacheDir: string;
    cacheInfinitely: boolean;
    cacheDuration: number;
    ram: boolean;
    persist: boolean;
    memoryCache: { [key: string]: any };
}


class CacheManager {
    constructor(options: CacheOptions = {}) {
        options = options || {};

        this.base = path.normalize((options.base || (require.main ? path.dirname(require.main.filename) : undefined) || process.cwd())  + '/cache');
        this.cacheDir = path.normalize(this.base + '/' + (options.name || 'cache'));
        this.cacheInfinitely = !(typeof options.duration === "number");
        this.cacheDuration = options.duration ?? 60 * 60 * 1000;
        this.ram = typeof options.memory == 'boolean' ? options.memory : true;
        this.persist = typeof options.persist == 'boolean' ? options.persist : true;
        if(this.ram) this.memoryCache = {};
        if(this.persist && !exists(this.cacheDir)) fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    private _buildFilePath(name: string) {
        return path.normalize(this.cacheDir + '/' + name + '.json');
    }

    private _buildCacheEntry(data: any) {
        return { cacheUntil: !this.cacheInfinitely ? new Date().getTime() + this.cacheDuration : undefined, data: data };
    }

    putSync(name: string, data: any) {
        var entry = this._buildCacheEntry(data);
        if(this.persist) fs.writeFileSync(this._buildFilePath(name), JSON.stringify(entry));
        if(this.ram) {
            this.memoryCache[name] = entry;
            this.memoryCache[name].data = JSON.stringify(this.memoryCache[name].data);
        };
    };

    getSync(name: string) {
        if(this.ram && !!this.memoryCache[name]) {
            var entry = this.memoryCache[name];
            if(entry.cacheUntil && new Date().getTime() > entry.cacheUntil) {
                this.deleteSync(name);
                return undefined
            };
            return JSON.parse(entry.data);
        };

        try {
            var data = JSON.parse(fs.readFileSync(this._buildFilePath(name), 'utf8'));
        } catch(e) {
            return undefined;
        };

        if(data.cacheUntil && new Date().getTime() > data.cacheUntil) return undefined;
        return data.data;
    };

    deleteSync(name: string) {
        if(this.ram) {
            delete this.memoryCache[name];
            if(!this.persist) return;
        };
        fs.unlinkSync(this._buildFilePath(name));
    };

    unlink(cb?: fs.NoParamCallback) {
        if(this.persist) return fs.rm(this.cacheDir, { recursive: true }, typeof cb === 'function' ? cb : function(){});
        typeof cb === 'function' ? cb : function(){}
    };

    private _transformFileNameToKey(fileName: string) {
        return fileName.slice(0, -5);
    };

    keysSync() {
        if(this.ram && !this.persist) return Object.keys(this.memoryCache);
        return fs.readdirSync(this.cacheDir).map(this._transformFileNameToKey);
    };
};

export default CacheManager;