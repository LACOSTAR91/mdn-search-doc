const { mdn, nodejs } = require('../lib');
nodejs.search('fs#readFileSync', { version: "latest"});
// nodejs.node(['fs', "mkdir"]).then(console.log);

// /**
//  * @name search
//  * @description Permet de chercher dans la documentation en retournant la liste des résultats correspondants
//  * @param {string} query
//  * @param {string | undefined} lang
//  * @returns {Promise<string[]>}
//  */
// console.log(mdn.search(`appearance`, { lang: "css" }));

// /**
//  * @name get
//  * @description Permet de récupérer une partie de la documentation
//  * @param {string} query
//  * @param {string | undefined} lang
//  * @returns {Promise<any>}
//  */
// mdn.get('appearance', { lang: "css", trad: "fr" }) 
// .then(data => {
//     console.log(data);
// });