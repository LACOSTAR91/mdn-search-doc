import CacheManager from "../Cache";

interface CacheOptions {
    base?: string;
    name?: string;
    duration?: number;
    memory?: boolean;
    persist?: boolean;
};

class NodeJS extends CacheManager {
    constructor(options: CacheOptions = {}) { super(options); };
}

export default NodeJS;