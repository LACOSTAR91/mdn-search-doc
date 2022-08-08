import { getQueryParentName } from "./Query";

function getParent(json: any, query: string) {
  const parentName = getQueryParentName(query);
  let parent;
  parent = json.classes.find((clase: any) => clase.name === parentName);
  if (parent) {
    parent.type = "class";
    return parent;
  }
  parent = json.typedefs.find((typedef: any) => typedef.name === parentName);
  if (parent) {
    parent.type = "typedef";
    return parent;
  }
  return parent;
}

export { getParent };