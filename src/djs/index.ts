import CacheManager from "../Cache";

interface CacheOptions {
    base?: string;
    name?: string;
    duration?: number;
    memory?: boolean;
    persist?: boolean;
};

class DiscordJS extends CacheManager {
    constructor(options: CacheOptions = {}) { super(options); };
}

export default DiscordJS;