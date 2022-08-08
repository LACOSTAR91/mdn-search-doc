import axios from 'axios';
import { Constants, HTML_List, CSS_List, JS_List } from './Constants';
import CacheManager from "../Cache";

interface CacheOptions {
    base?: string;
    name?: string;
    duration?: number;
    memory?: boolean;
    persist?: boolean;
};

interface MDNSearchOptions {
    lang?: "html" | "css" | "js";
}

interface MDNGetOptions {
    lang?: "html" | "css" | "js";
    trad?: string;
}

class MDN extends CacheManager {
    constructor(options: CacheOptions = {}) { super(options); };

    search(query: string, opts: MDNSearchOptions = { lang: "js" }) {
        let filtered: string[] = [];
        const List: string[] = opts?.lang?.toUpperCase() == "HTML" ? HTML_List : opts.lang?.toUpperCase() == "CSS" ? CSS_List : JS_List;

        List.map((value: string) => {
            const [category, property, property2] = value.split("#");
            
            if(property2) {
                const proposition = `${property}#${property2}`
                proposition.toLowerCase() == query.toLowerCase() ? filtered.push(`${category}#${proposition}`) : null;
                proposition.toLowerCase().startsWith(query.toLowerCase()) ? filtered.push(`${category}#${proposition}`) : null;
                proposition.toLowerCase().includes(query.toLowerCase()) ? filtered.push(`${category}#${proposition}`) : null;
    
                property2.toLowerCase() == query.toLowerCase() ? filtered.push(`${category}#${proposition}`) : null;
                property2.toLowerCase().startsWith(query.toLowerCase()) ? filtered.push(`${category}#${proposition}`) : null;
                property2.toLowerCase().includes(query.toLowerCase()) ? filtered.push(`${category}#${proposition}`) : null;
            } else if(!property && !property2) {
                category.toLowerCase() == query.toLowerCase() ? filtered.push(`${category}`) : null;
                category.toLowerCase().startsWith(query.toLowerCase()) ? filtered.push(`${category}`) : null;
                category.toLowerCase().includes(query.toLowerCase()) ? filtered.push(`${category}`) : null;
            } else {
                property.toLowerCase() == query.toLowerCase() ? filtered.push(`${category}#${property}`) : null;
                property.toLowerCase().startsWith(query.toLowerCase()) ? filtered.push(`${category}#${property}`) : null;
                property.toLowerCase().includes(query.toLowerCase()) ? filtered.push(`${category}#${property}`) : null;
            } 
        });
        return [...new Set(filtered)];  
    };
    
    get (query: string, opts: MDNGetOptions = { lang: "js", trad: "en-US" }): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const result = this.search(query, opts);
            if(!result) reject(new Error(`No result found for the query: ${query}`))

            const [category, property, property2] = result[0]?.split("#");
            if(!category && !property && !property2) reject(new Error(`No result found for the query: ${query}`));

            const dataConstant = `${category}#${property}#${property2}#${opts.trad}`;
            const url = `${Constants.URL}${opts?.trad}${opts?.lang?.toUpperCase() == "HTML" ? Constants.HTML : opts?.lang?.toUpperCase() == "CSS" ? Constants.CSS : Constants.JS}${opts?.lang?.toUpperCase() == "HTML" ? category == "Global_attributes" ? category : category == "Balise" ? "Element" : `Element/${category}` : category}/${property == undefined && property2 == undefined ? "" : property2 == undefined ? `${property}/` : `${property}/${property2}/`}${Constants.JSON_EXTENSION}`;
            console.log(url);
            
            if(this.keysSync().includes(dataConstant)) {
                const data = this.getSync(dataConstant);
                if(!data) return resolve(this.fetchMdnJson(url, query, dataConstant));
                else return resolve(data) 
            }
            else resolve(this.fetchMdnJson(url, query, dataConstant));
        });
    };

    private fetchMdnJson(url: string, query: string, dataConstant: string): Promise<object | Error> {
        return new Promise(async (resolve, reject) => {
            const JSON = await axios.get(url.replace(/developer.mozilla.org\/.*\/docs/g, "developer.mozilla.org/en-US/docs"));
            let data = JSON.data;
            if(data.length == 0) reject(new Error(`Error for the query: ${query}`))

            axios.get(url.slice(0, -Constants.JSON_EXTENSION.length))
            .then(Website => {
                const regex = new RegExp(/(?:<title>(?<title>.{0,100})<\/title>.*<meta name="description" content="(?<description>.{0,700})">)/).exec(Website.data);
            
                data['title'] = regex?.groups?.title.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&amp;/g, "&");
                data['description'] = regex?.groups?.description;
                data['url'] = url.slice(0, -Constants.JSON_EXTENSION.length);
                this.putSync(dataConstant, data);
                resolve(data);
            })
            .catch(err => { reject(new Error(`Error for the query: ${query} (check the trad option is correct)`)) });
        });
    }
}

export default MDN;