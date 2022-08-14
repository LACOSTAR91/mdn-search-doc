import CacheManager from "../Cache";
import { sources } from './Constants';
import axios from "axios";
const TurndownService = require("turndown");
const turndownService = new TurndownService();
turndownService.addRule("convert", {
    filter: "pre", 
    replacement: (content: string) => `\`\`\`js\n${content.replace(/<\/?code( \S+)?>/g, ``)}\`\`\`\n`
});

interface CacheOptions {
    base?: string;
    name?: string;
    duration?: number;
    memory?: boolean;
    persist?: boolean;
};

interface NodeJS {
    sources: Array<string>;
}

class NodeJS extends CacheManager {
    constructor(options: CacheOptions = {}) { 
        super(options);
        this.sources = sources;
    };

    async search(search: string, { version, category, skip }: { version?: string, category?: string, skip?: boolean }): Promise<docsParsed | Error> {
        if(!version) version = "latest";
        const subversion = /v?\d{1,2}\.(?<subversion>(?:\d{1,2}\.\d{1,2})|x)$/g.exec(version)?.groups?.subversion;
        if(version !== "latest" && !subversion) return Promise.reject(new Error("Version must be a valid version number (Ex: v17.15.0 or v17.x or latest)"));
        if(version !== "latest" && subversion === "x") version = `latest-${version.startsWith('v') ? "" : version.startsWith('V') ? version.replace("V", "v") : "v"}${version}`;
        else if(version !== "latest") version = `${version.startsWith('v') ? "" : version.startsWith('V') ? version.replace("V", "v") : "v"}${version}`;

        if(!search) search = "";
        if(search.split("#").length <= 1 && !category) return Promise.reject(new Error("If you don't specify a category option, you must specify the category in the search string (fs#readFile)"));
        if(!category) category = search.split("#")[0];
        if(!sources.includes(category ?? "x")) return Promise.reject(new Error("Invalid category"));
        const query = (search.split("#")[1] ?? search.split("#")[0]).toLowerCase();
        if(query === undefined || query === null) return Promise.reject(new Error("Search string is required and must be valid"));

        const cachedData = this.getSync(`${version}`);        
        if(cachedData && !skip) return Promise.resolve(this.nodeParse({ doc: cachedData.doc, sourceLinks: cachedData.sourceLinks }, category, version, query));
        else {
            const sourceLinks = await axios.get(`https://nodejs.org/docs/${version}/apilinks.json`).catch((err: any) => null);
            return axios.get(`https://nodejs.org/docs/${version}/api/all.json`)
            .then((res: any) => {
                const parsedData = this.nodeParse({ doc: res.data, sourceLinks: sourceLinks?.data ?? null }, category, version, query);
                this.putSync(`${version}`, { doc: res.data, sourceLinks: sourceLinks?.data ?? null });
                return Promise.resolve(parsedData);
            }).catch((err: any) => {
                if (err !== "No results found") console.error(err);
                return Promise.reject(new Error("No results found"));
            });
        };
    };

    private async nodeParse(data: { doc: any, sourceLinks: any }, category: string | undefined, version: string | undefined, query: string): Promise<docsParsed | Error> {
        const module = data.doc.modules.find((module: any) => module.name === category);
        if(!module) throw new Error("Error category not found. Please report this issue to the package owner on Github.");

        const response: any = {};
        
        response["markdown"] = `https://github.com/nodejs/node/blob/main/${module.source}`;
        response["sourceCode"] = /\[lib\/\S+]\((?<source_code>https:\/\/github\.com\/nodejs\/node\/blob\/v\d{1,2}\.\d{1,2}\.\d{1,2}\/lib\/\S+)\)/gm.exec(turndownService.turndown(module.desc))?.groups?.source_code;
        response["docLink"] = `https://docs.nodejs.org/docs/${version}/api/${module.name}.html`;
        response["name"] = { short: module.name, long: module.textRaw };
        response["introducedIn"] = module.introduced_in;
        response["stability"] = { text: module.stabilityText, number: module.stability };
        response["description"] = turndownService.turndown(module.desc);
        
        let methods: Array<methods> = [];
        
        // TODO Do for filter use the entire function name (method.textRaw) instead of just the name for better research beetween fsPromises, fs and fsSync functions.
        if(module?.classes) {
            module.classes?.forEach((classe: any) => {
                const methodsJSON: Array<any> = classe?.methods;
                
                if(methodsJSON) {
                    methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query));
                    methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query)));
                    methods.push(...methodsJSON.filter((method: any) => query.includes(method?.name?.toLowerCase())));  
                    methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query)));     
                };
            })
        };
        
        if(module?.methods) {
            const methodsJSON: Array<any> = module?.methods;

            methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query));
            methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query)));
            methods.push(...methodsJSON.filter((method: any) => query.includes(method?.name?.toLowerCase())));  
            methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query)));     
        };
        if(module?.modules) {
            module.modules.forEach((module: any) => {
                const classesJSON: Array<any> = module?.classes;
                const methodsJSON: Array<any> = module?.methods;

                if(classesJSON) {
                    classesJSON?.map((classJSON: any) => {
                        const methodsJSON = classJSON?.methods;
                        
                        if(methodsJSON) {
                            methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query));
                            methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query)));
                            methods.push(...methodsJSON.filter((method: any) => query.includes(method?.name?.toLowerCase())));  
                            methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query)));     
                        }
                    });
                };
                if(methodsJSON) {
                    methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query));
                    methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query)));
                    methods.push(...methodsJSON.filter((method: any) => query.includes(method?.name?.toLowerCase())));  
                    methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query)));                    
                };
            });
        };

        methods = [...new Set(methods)];
        methods = methods.map((method: any) => {
            return {
                function: method.textRaw?.replaceAll("`", ""),
                name: method?.name,
                description: method?.desc ? turndownService.turndown(method?.desc) : "",
                sourceLink: data?.sourceLinks?.[method?.textRaw?.replaceAll("`", "")?.split("(")?.[0]] ?? null,
                params: method?.signatures ? method?.signatures?.[0]?.params : [], // Params of the method
                return: method?.signatures ? method?.signatures?.[0]?.return : null, // Return of the method
                meta: {
                    addedVersion: (method?.meta && method?.meta.added && method?.meta.added[0]) ?? null, // Version where the method was added 
                    deprecatedVersion: (method?.meta && method?.meta.deprecated && method?.meta.deprecated[0]) ?? null, // Version where the method was deprecated
                    changesVersion: method?.meta && method?.meta?.changes, // Versions where the method was updated
                    /* changesVersion returns an array of objects with the following structure:
                    {
                        "version": "v18.0.0",
                        "pr-url": "https://github.com/nodejs/node/pull/41678",
                        "description": "Passing an invalid callback to the `callback` argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`."
                    }
                    */
                },
                stability: {
                    text: method?.stabilityText ?? null,
                    number: method?.stability ?? null
                }
            }
        })
        methods = methods.filter(prof => prof.name.toLowerCase().includes(query))
        .sort((a, b) => {
            const c = a.function.toLowerCase();
            const d = b.function.toLowerCase();

            // Sort results by matching name with query position in name
            if(c.indexOf(query) > d.indexOf(query)) return 1;
            else if (c.indexOf(query) < d.indexOf(query)) return -1;
            else {
                if(c > d) return 1;
                else return -1;
            }
        });

        response["methods"] = methods;
        return response;
    }

    buildEmbed(data: docsParsed) {
        data.methods = data.methods.slice(0,25);

        // TODO Upgrade the function for when only one method is found, he show the only on method with what he returns, stability, etc.
        return {
            color: 0x00AE86,
            author: { name: data.name.short, icon_url: "https://nodejs.org/static/images/logo.png", url: data.sourceCode },
            url: data.sourceCode,
            title: `${data.name.long} - Added in ${data.introducedIn} - ${data.stability.text}`,
            description: `${data.methods.map(m => m?.function ? `- \`${m.function}\`\n` : null)}\n[Source code](${data.sourceCode}) | [Documentation](${data?.docLink})`,
            // fields: data.methods?.map((method: any) => {
            //     return {
            //         name: method.function,
            //         value: method.description,
            //         inline: true
            //     }
            // }),
            footer: { text: "Node.js documentation" },
            timestamp: new Date()
        }
    };
}

interface docsParsed {
    markdown: string;
    sourceCode: string | undefined;
    docLink: string | undefined;
    name: { short: string, long: string };
    introducedIn: string;
    stability: { text: string, number: number };
    description: string;
    methods: Array<methods>;
}

interface methods {
    function: string,
    name: string,
    description: string,
    sourceLink: string | null,
    params: Array<{
        textRaw: string,
        name: string,
        type: string,
        desc: string | undefined,
        options: Array<{
            textRaw: string,
            name: string,
            type: string,
            default: string | undefined,
            desc: string | undefined
        }> | undefined
    }> | undefined,
    return: {
        textRaw: string,
        name: string,
        type: string
    } | undefined,
    meta: {
        addedVersion: string | null,
        deprecatedVersion: string | null,
        changesVersion: Array<{
            version: string | Array<string>,
            "pr-url": string,
            description: string
        }> | undefined
    },
    stability: {
        text: string | null,
        number: number | null
    }
}

export default NodeJS;