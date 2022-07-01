const axios = require('axios');
const { Constants, HTML_List, CSS_List, JS_List } = require('./Constants.js');

function search(query: string, lang?: string) {
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

function get(query: string, lang?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const result = search(query, lang);
        if(result.length == 0) reject(new Error(`No result found for the query: ${query}`))
        const [category, property, property2] = result[0].split("#");
        axios.get(`${Constants.URL}${lang?.toUpperCase() == "HTML" ? Constants.HTML : lang?.toUpperCase() == "CSS" ? Constants.CSS : Constants.JS}${category}/${property2 == undefined ? property : `${property}/${property2}`}/${Constants.JSON_EXTENSION}`)
        .then((res: any) => {
            resolve(res.data);
        });
    });
};

export { search, get };