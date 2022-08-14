const { mdn, nodejs } = require('../lib');

nodejs.search('readSync', { version: "v16.x", category: "fs", skip: true }).then(console.log("FS Opérationnel !")).catch(console.log("ERROR: \"FS\" !"));
// fsPromises.lchmod - Test DEPRECATED
// fs.cp - Test stability

/**
 * @name search
 * @description Permet de chercher dans la documentation en retournant la liste des résultats correspondants
 * @param {string} query
 * @param {string | undefined} lang
 * @returns {Promise<string[]>}
 */
try {
    mdn.search(`appearance`, { lang: "css" });
    console.log("MDN Opérationnel !");
} catch (e) {
    console.log("ERROR: \"MDN search\" !")
}

/**
 * @name get
 * @description Permet de récupérer une partie de la documentation
 * @param {string} query
 * @param {string | undefined} lang
 * @returns {Promise<any>}
 */
mdn.get('appearance', { lang: "css", trad: "fr" }).then(console.log("MDN Opérationnel !")).catch(console.log("ERROR: \"MDN get\" !"));