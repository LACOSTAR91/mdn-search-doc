import axios from "axios";
import CacheManager from "../Cache";
import { getParent, getQueryType, getQueryParentName, getQueryParamName, resolveMethodOrPropOrEvent, fetchGithub, buildGeneralEmbed, buildSpecificEmbed, djsdocs } from "./docs";

interface CacheOptions {
    base?: string;
    name?: string;
    duration?: number;
    memory?: boolean;
    persist?: boolean;
};

class DiscordJS extends CacheManager {
    constructor(options: CacheOptions = {}) { 
        super(options);
        // this.getParent = getParent;
        // this.getQueryType = getQueryType;
        // this.getQueryParentName = getQueryParentName;
        // this.getQueryParamName = getQueryParamName;
        // this.buildGeneralEmbed = buildGeneralEmbed;
        // this.buildSpecificEmbed = buildSpecificEmbed;
    };

    async get(docName: string, query: string) {
        console.log(`[DiscordJS] Getting ${docName} - ${query}`);
        await this.autocomplete(docName, query);
        
        const doc = djsdocs.find((x) => x.name === docName);
        if (!doc) throw new Error(`Could not find ${docName} in the list of available docs.`);
        const data = doc.data;
        console.log(data);
      
        const type = getQueryType(query);        
        const parent = getParent(data, query);
        if (!parent) return { error: true, message: "Aucun résultat pour votre recherche" };
      
        switch (type) {
            case "method/prop": {
                const methorOrProp = resolveMethodOrPropOrEvent(parent, query);
                if (!methorOrProp) return { error: true, message: "Aucun résultat pour votre recherche" };
                const embed = buildSpecificEmbed(parent, methorOrProp, doc);
                return { error: false, embeds: [embed] };
                break;
            }
            case "parent": {
                const embed = buildGeneralEmbed(parent, doc);
                return { error: false, embeds: [embed] };
                break;
            }
            default:
                return { error: true, message: "Aucun résultat pour votre recherche" };
                break;
        }
    }

    async autocomplete(docName: string, query: string) {
        return await new Promise(async (resolve, reject) => {
            const doc = (await fetchGithub(djsdocs)).find((x) => x.name === docName);
            if (!doc) return reject(`Could not find ${docName} in the list of available docs.`);
            const filtered = [
                ...doc.search.filter((choice: any) => choice.toLowerCase() == query),
                ...doc.search.filter((choice: any) => choice.toLowerCase().startsWith(query)),
                ...doc.search.filter((choice: any) => choice.toLowerCase().includes(query))
            ]
            const unique = [...new Set(filtered)].slice(0, 25);
            console.log(unique);
            return resolve(unique);
        });
    }
}

export default DiscordJS;