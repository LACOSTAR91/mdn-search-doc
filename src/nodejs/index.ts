import CacheManager from "../Cache";
import { EmbedBuilder } from "@discordjs/builders";
import { sources } from './Constants';
import axios from "axios";
const toMarkdown = require("to-markdown");
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
    docs: Array<any>;
    cache: Array<any>;
    cachePath: string;
    sourceHome: string;
}

class NodeJS extends CacheManager {
    constructor(options: CacheOptions = {}) { 
        super(options); 
        this.docs = []; 
        this.cache = [];
        this.cachePath = __dirname, "../../cache/nodejs";
        this.sourceHome = "https://nodejs.org/api/";
    };

    search(search: string, { version, category }: { version?: string, category?: string }) {
        if(!version) version = "latest";
        console.log(`Searching for ${search}`);        
        console.log(version, category);
        
        const subversion = /v?\d{1,2}\.(?<subversion>(?:\d{1,2}\.\d{1,2})|x)$/g.exec(version)?.groups?.subversion;
        if(version !== "latest" && !subversion) throw new Error("Version must be a valid version number (Ex: v17.15.0 or v17.x or latest)");
        if(version !== "latest" && subversion === "x") version = `latest-${version.startsWith('v') ? null : "v"}${version}`;
        else if(version !== "latest") version = `${version.startsWith('v') ? null : "v"}${version}`;

        if(!search) throw new Error("Search string is required");
        if(search.split("#").length <= 1 && !category) throw new Error("If you don't specify a category option, you must specify the category in the search string (fs#readFile)");
        if(!category) category = search.split("#")[0];
        const query = search.split("#")[1];

        const response: any = {};

        console.log(`https://nodejs.org/docs/${version}/api/${category}.json`);        
        return axios.get(`https://nodejs.org/docs/${version}/api/${category}.json`)
        .then(res => {
            // ! Source Code undefined in certain cases

            const module = res.data.modules[0];
            response["markdown"] = `https://github.com/nodejs/node/blob/main/${res.data.source}`;
            response["sourceCode"] = /\[lib\/\S+]\((?<source_code>https:\/\/github\.com\/nodejs\/node\/blob\/v\d{1,2}\.\d{1,2}\.\d{1,2}\/lib\/\S+)\)/gm.exec(turndownService.turndown(module.desc))?.groups?.source_code;
            response["name"] = { short: module.name, long: module.textRaw };
            response["introducedIn"] = module.introduced_in;
            response["stability"] = { text: module.stabilityText, number: module.stability };
            response["description"] = turndownService.turndown(module.desc);

            console.log(response);  
            
            let methods: Array<any> = [];

            if(module?.classes) {
                module.classes?.forEach((classe: any) => {
                    const methodsJSON: Array<any> = classe?.methods;
                    
                    if(methodsJSON) {
                        methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query.toLowerCase()));
                        methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query.toLowerCase())));
                        methods.push(...methodsJSON.filter((method: any) => query.toLowerCase().includes(method?.name?.toLowerCase())));  
                        methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query.toLowerCase())));     
                    };
                })
            };
            if(module?.modules) {
                module.modules.forEach((module: any) => {
                    const classesJSON: Array<any> = module?.classes;
                    const methodsJSON: Array<any> = module?.methods;
                    
                    if(classesJSON) {
                        classesJSON?.map((classJSON: any) => {
                            const methodsJSON = classJSON?.methods;
                            if(methodsJSON) {
                                methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query.toLowerCase()));
                                methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query.toLowerCase())));
                                methods.push(...methodsJSON.filter((method: any) => query.toLowerCase().includes(method?.name?.toLowerCase())));  
                                methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query.toLowerCase())));     
                            }
                        });
                    };
    
                    if(methodsJSON) {
                        methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase() == query.toLowerCase()));
                        methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().startsWith(query.toLowerCase())));
                        methods.push(...methodsJSON.filter((method: any) => query.toLowerCase().includes(method?.name?.toLowerCase())));  
                        methods.push(...methodsJSON.filter((method: any) => method?.name?.toLowerCase().includes(query.toLowerCase())));                    
                    };
                });
            };
            methods = [...new Set(methods)];

            console.log(methods);

            if (res.data.length === 0) return Promise.reject(`No results found`);
            return Promise.resolve(res.data);
        }).catch(err => {
            if (err !== "No results found") console.error(err);
            console.log(`:x: ${err === "No results found" ? err : `\`${err}\``}`);
        })
        // .then(data => {
        //     if (data instanceof Array) {
        //         return Promise.resolve(data.map(x => {
        //             return {
        //                 TextRaw: x.textRaw,
        //                 Type: x.type,
        //                 Name: x.name,
        //                 Description: x.desc || "",
        //                 Added: x.meta && x.meta.added && x.meta.added[0],
        //                 Removed: x.meta && x.meta.removed && x.meta.removed[0],
        //                 Deprecated: x.meta && x.meta.deprecated && x.meta.deprecated[0],
        //                 Return: x.signatures ? x.signatures[0].return : null,
        //                 Params: x.signatures ? x.signatures[0].params : [],
        //                 Stability: x.stability,
        //                 StabilityText: x.stabilityText || "",
        //                 Source: x.source,
        //             };
        //         }));
        //     } else {
        //         return Promise.resolve([data]);
        //     }
        // }).then(data => {
            
        //     return Promise.resolve(data.map(x => {
        //         return {
        //             TextRaw: x.textRaw,
        //             Type: x.type,
        //             Name: x.name,
        //             Description: x.desc || "",
        //             Added: x.meta && x.meta.added && x.meta.added[0],
        //             Removed: x.meta && x.meta.removed && x.meta.removed[0],
        //             Deprecated: x.meta && x.meta.deprecated && x.meta
        //         }
        //     }))
        // })
    };

    private async searchDocs(query: string) {
        let result;
        for (let doc in this.docs) {
            let obj = this.GetSimilarObjects(this.docs[doc], `textRaw`, query, (e) => {
                if (typeof e === "object" && e.textRaw) return !e.textRaw.includes(`{Function}`);
                if (typeof e === "string") return !e.match(/{.+}/g);
                return false;
            })[0];
            if (obj) {
                result = obj;
                result.source = this.docs[doc].source;
                break;
            }
        }
        return Promise.resolve(result);
    }

    private GetSimilarObjects(obj: any, key: string, val = "", filter = (x: any) => true) {
        var objects: any[] = [];
        for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] === "object") {
            objects = objects.concat(this.GetSimilarObjects(obj[i], key, val, filter));
          } else if ((i === key && obj[i].toLowerCase().indexOf(val.toLowerCase()) > -1) || (i === key && val === "")) {
            if (filter(obj.textRaw || obj)) objects.push(obj);
          } else if (obj[i] === val && key === "") {
            // only add if the object is not already in the array
            if (objects.lastIndexOf(obj) === -1 && filter(filter(obj.textRaw || obj))) {
              objects.push(obj);
            }
          }
        }
        return objects;
      }

    private async nodeGetDocs(query: string) {
        let obj = await this.searchDocs(query);
        if (!obj) return Promise.reject(`No results found`);
        return Promise.resolve(this.nodeParse({
            TextRaw: obj.textRaw,
            Type: obj.type,
            Name: obj.name,
            Description: obj.desc || "",
            Added: obj.meta && obj.meta.added && obj.meta.added[0],
            Removed: obj.meta && obj.meta.removed && obj.meta.removed[0],
            Deprecated: obj.meta && obj.meta.deprecated && obj.meta.deprecated[0],
            Return: obj.signatures ? obj.signatures[0].return : null,
            Params: obj.signatures ? obj.signatures[0].params : [],
            Stability: obj.stability,
            StabilityText: obj.stabilityText || "",
            Source: obj.source,
        }));
    };


    private nodeParse(data: any) {
        const DocInfo = `${data.Added ? ` - added in ${data.Added}` : ""}${data.Removed ? ` - removed in ${data.Removed}` : ""}${data.Deprecated ? ` - deprecated in ${data.Deprecated}` : ""}`;
        const StabilityText = data.StabilityText;
        let Description = turndownService.turndown(data.Description);
        // const StabilityTextRegEx = /\[(\S+)\]\[\]/gi.exec(StabilityText) || []; // eslint-disable-line no-useless-escape
        const InternalLinkRegEx = /\[(.+)\]\(#(.+)\)/g; // eslint-disable-line no-useless-escape
        const RelativeLinkRegEx = /\[(.+)\]\(([^http].+).html#(\S+)\)/g; // eslint-disable-line no-useless-escape
        const Link = this.nodeGenerateLink(data.Source, data.TextRaw);
        // StabilityTextRegEx.forEach((e, i) => {
        // StabilityText = StabilityText.replace(/\[(\S+)\]\[\]/gi, StabilityTextRegEx[i]); // eslint-disable-line no-useless-escape
        // });
        Description = Description
        .replace(InternalLinkRegEx, `[$1](${data.Source}.html#$2)`)
        .replace(RelativeLinkRegEx, `[$1](https://nodejs.org/api/$2.html#$3)`);
    
        const Fields = data.Params.map((e: any) => {
          const { name, type, optional, desc } = e;
          return {
            name: `\`${name}\` ${type ? `(\`${type}\`)` : ""}`,
            value: `${optional ? `` : "**REQUIRED** "}${desc || "\u200B"}`,
          };
        });
        const Stability = data.Stability !== undefined && data.Stability < 2 ? `\n**${StabilityText.toUpperCase()}**\n` : ``;

        return new EmbedBuilder({ fields: Fields })
        .setTitle(`**__\`${data.TextRaw.slice(0, 190)}\`__${DocInfo}**`)
        .setDescription(`${Stability}${Description.slice(0, 1950)}\u200B`)
        .setURL(data.Link || Link)
        .setAuthor({ name: `NodeJS API`, iconURL: "http://supundharmarathne.files.wordpress.com/2013/08/nodejs.png", url: "https://nodejs.org/api" });
    }

    private nodeGenerateLink(Source: string, TextRaw: string): string {
        const Class = Source.slice(23, 99).toLowerCase();
        let Property = TextRaw
        .replaceAll(/([^a-z])/gi, "_")
        .replaceAll(/__/g, "_")
        .toLowerCase();
        if (Property.lastIndexOf(`_`) === Property.length - 1) Property = Property.slice(0, Property.length - 1);
        if (Property.indexOf(`_`) === 0) Property = Property.slice(1, Property.length);
        const Link = `${Source}.html#${Class}_${Property}`;
        return Link;
    }
}

export default NodeJS;