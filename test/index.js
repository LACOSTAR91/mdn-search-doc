const { get, search } = require('../lib');

/**
 * @name search
 * @description Permet de chercher dans la documentation en retournant la liste des résultats correspondants
 * @param {string} query
 * @param {string | undefined} lang
 * @returns {Promise<string[]>}
 */
console.log(search(`array`));

/**
 * @name get
 * @description Permet de récupérer une partie de la documentation
 * @param {string} query
 * @param {string | undefined} lang
 * @returns {Promise<any>}
 */
get('array') 
.then(data => {
    console.log(data);
});