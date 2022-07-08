const EventEmitter = require('node:events');
const mkdirp = require('mkdirp-no-bin');
const rmdir = require('rmdir');
import fs from 'fs';
import path from 'path';

function safeCb(cb: Function) {
    if(typeof cb === 'function') return cb;
    return function(){};
};

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


class CacheManager extends EventEmitter {
    constructor(options: CacheOptions = {}) {
        options = options || {};
        super(options);

        this.base = path.normalize((options.base || (require.main ? path.dirname(require.main.filename) : undefined) || process.cwd())  + '/cache');
        this.cacheDir = path.normalize(this.base + '/' + (options.name || 'cache'));
        this.cacheInfinitely = !(typeof options.duration === "number");
        this.cacheDuration = options.duration;
        this.ram = typeof options.memory == 'boolean' ? options.memory : true;
        this.persist = typeof options.persist == 'boolean' ? options.persist : true;
        if(this.ram) this.memoryCache = {};
        if(this.persist && !exists(this.cacheDir)) mkdirp.sync(this.cacheDir);
    }

    private buildFilePath(name: string) {
        return path.normalize(this.cacheDir + '/' + name + '.json');
    }

    private buildCacheEntry(data: any) {
        return { cacheUntil: !this.cacheInfinitely ? new Date().getTime() + this.cacheDuration : undefined, data: data };
    }

    // put(name: string, data: any, cb: any) {
    //     var entry = this.buildCacheEntry(data);
    //     if(this.persist) fs.writeFile(this.buildFilePath(name), JSON.stringify(entry), cb);
    //     if(this.ram) {
    //         entry.data = JSON.stringify(entry.data);
    //         this.memoryCache[name] = entry;
    //         if(!this.persist) return safeCb(cb)(null);
    //     };
    // };

    putSync(name: string, data: any) {
        var entry = this.buildCacheEntry(data);
        if(this.persist) fs.writeFileSync(this.buildFilePath(name), JSON.stringify(entry));
        if(this.ram) {
            this.memoryCache[name] = entry;
            this.memoryCache[name].data = JSON.stringify(this.memoryCache[name].data);
        };
    };

    // get(name: string, cb: any) {
    //     if(this.ram && !!this.memoryCache[name]) {
    //         var entry = this.memoryCache[name];

    //         if(!!entry.cacheUntil && new Date().getTime() > entry.cacheUntil) {
    //             return safeCb(cb)(null, undefined);
    //         }

    //         try{
    //             entry = JSON.parse(entry.data); 
    //         } catch(e) {
    //             return safeCb(cb)(e);
    //         }

    //         return safeCb(cb)(null, entry); 
    //     }

    //     fs.readFile(this.buildFilePath(name), 'utf8' , onFileRead);

    //     function onFileRead(err: any, content: any) {
    //         if(err != null) {
    //             return safeCb(cb)(null, undefined);
    //         }

    //         var entry;
    //         try { 
    //             entry = JSON.parse(content);
    //         } catch(e) {
    //             return safeCb(cb)(e);
    //         }

    //         if(!!entry.cacheUntil && new Date().getTime() > entry.cacheUntil) return safeCb(cb)(null, undefined);

    //         return safeCb(cb)(null, entry.data);
    //     }
    // }

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
            var data = JSON.parse(fs.readFileSync(this.buildFilePath(name), 'utf8'));
        } catch(e) {
            return undefined;
        };

        if(data.cacheUntil && new Date().getTime() > data.cacheUntil) return undefined;
        return data.data;
    };

    // delete(name: string, cb: any) {
    //     if(this.ram) {
    //         delete this.memoryCache[name];
    //         if(!this.persist) safeCb(cb)(null);
    //     };
    //     fs.unlink(this.buildFilePath(name), cb);
    // };

    deleteSync(name: string) {
        if(this.ram) {
            delete this.memoryCache[name];
            if(!this.persist) return;
        };
        fs.unlinkSync(this.buildFilePath(name));
    };

    unlink(cb: any) {
        if(this.persist) return rmdir(this.cacheDir, safeCb(cb));
        safeCb(cb)(null);
    };

    private transformFileNameToKey(fileName: string) {
        return fileName.slice(0, -5);
    };

    // keys(cb: any) {
    //     cb = safeCb(cb);

    //     if(this.ram && !this.persist)
    //         return cb(null, Object.keys(this.memoryCache));

    //     fs.readdir(this.cacheDir, onDirRead);

    //     function onDirRead(err: any, files: Array<string>) {
    //         return !!err ? cb(err) : cb(err, files.map(transformFileNameToKey));
    //     }
    // }

    keysSync() {
        if(this.ram && !this.persist) return Object.keys(this.memoryCache);
        return fs.readdirSync(this.cacheDir).map(this.transformFileNameToKey);
    };
};

export default CacheManager;