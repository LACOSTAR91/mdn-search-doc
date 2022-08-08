function getQueryType(query: string) {
    if (query?.includes("#") || query?.includes(".")) return "method/prop";
    else return "parent";
}
  
function getQueryParentName(query: string) {
    if (query?.includes("#")) return query.split("#")[0];
    if (query?.includes(".")) return query.split(".")[0];
    return query;
}
function getQueryParamName(query: string) {
    if (query?.includes("#")) return query.split("#")[1];
    if (query?.includes(".")) return query.split(".")[1];
    return query;
}
  
export {
    getQueryType,
    getQueryParentName,
    getQueryParamName
};