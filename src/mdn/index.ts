const axios = require('axios');
const { Constants, HTML_List, CSS_List, JS_List } = require('./Constants');
const { CacheManager } = require('../Cache');

class MDN extends Cache {
    constructor() {
        super();
    }

    search(query: string, lang?: string) {
        let filtered: string[] = [];
        const List: string[] = lang?.toUpperCase() == "HTML" ? HTML_List : lang?.toUpperCase() == "CSS" ? CSS_List : JS_List;
        
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
            } else {
                property.toLowerCase() == query.toLowerCase() ? filtered.push(`${category}#${property}`) : null;
                property.toLowerCase().startsWith(query.toLowerCase()) ? filtered.push(`${category}#${property}`) : null;
                property.toLowerCase().includes(query.toLowerCase()) ? filtered.push(`${category}#${property}`) : null;
            } 
        });
        return [...new Set(filtered)];  
    };
    
    get (query: string, lang?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const result = this.search(query, lang);
            if(result.length == 0) reject(new Error(`No result found for the query: ${query}`))
            const [category, property, property2] = result[0].split("#");
            const url = `${Constants.URL}${lang?.toUpperCase() == "HTML" ? Constants.HTML : lang?.toUpperCase() == "CSS" ? Constants.CSS : Constants.JS}${lang?.toUpperCase() == "HTML" ? category == "Global_attributes" ? category : category == "Balise" ? "Element" : `Element/${category}` : category}/${property2 == undefined ? property : `${property}/${property2}`}/${Constants.JSON_EXTENSION}`;
            console.log(url);
            axios.get(url)
            .then((res: any) => {
                let data = res.data;
                if(data.length == 0) reject(new Error(`Error for the query: ${query}`))
                data['url'] = url.slice(0, -8);
                resolve(data);
            });
        });
    };
}

export default MDN;