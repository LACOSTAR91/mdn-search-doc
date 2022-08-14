const { mdn, nodejs } = require('../lib');
const axios = require('axios');

nodejs.search('read', { version: "v16.x", category: "fs" }).then(async d => await axios({ method: "POST", url: "https://discord.com/api/v10/channels/740627030860627992/messages", headers: { Authorization: "Bot TOKEN" }, data: { embeds: [nodejs.buildEmbed(d)] } })).catch(console.log("ERROR: \"FS\" !"));

// fsPromises.lchmod - Test DEPRECATED
// fs.cp - Test stability

/**
 * @name search
 * @description Permet de chercher dans la documentation en retournant la liste des résultats correspondants
 * @param {string} query
 * @param {string | undefined} lang
 * @returns {Promise<string[]>}
 */
// try {
//     mdn.search(`appearance`, { lang: "css" });
//     console.log("MDN Opérationnel !");
// } catch (e) {
//     console.log("ERROR: \"MDN search\" !")
// }

/**
 * @name get
 * @description Permet de récupérer une partie de la documentation
 * @param {string} query
 * @param {string | undefined} lang
 * @returns {Promise<any>}
 */
// mdn.get('appearance', { lang: "css", trad: "fr" }).then(console.log("MDN Opérationnel !")).catch(console.log("ERROR: \"MDN get\" !"));