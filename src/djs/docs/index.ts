import axios from "axios";
import { getQueryType, getQueryParentName, getQueryParamName } from "./Query";
import { getParent } from "./Parent";
import { buildGeneralEmbed, buildSpecificEmbed } from "./Embeds";
import { djsdocs } from "./Constants";

function resolveMethodOrPropOrEvent(parent: any, query: string) {
    const name = getQueryParamName(query);
    const methodOrProp = parent.methods?.find((m: any) => m.name === name) || parent.props?.find((p: any) => p.name === name) || parent.events?.find((p: any) => p.name === name);
    return methodOrProp;
}

function fetchGithub(toFetch: Array<any>): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
        await toFetch.forEach(async (f: any) => {
            const res = await axios.get(f.url);
            console.log(res);
            console.log(f.url);
            f.data = res.data;
            console.log(f.data);
            const search = getSearch(res.data);
            f.search = search[0];
            f.classes = search[1];
            f.typedefs = search[2];
        });
        return resolve(toFetch);
    });
}

function getSearch(json: any) {
    const results: Array<string> = [];
    const classes: Array<string> = [];
    const typedefs: Array<string> = [];
    if (json.classes) {
        json.classes.forEach((c: any) => {
        results.push(c.name);
        if (c.props) {
            c.props.forEach((p: any) => {
            results.push(`${c.name}.${p.name}`);
            classes.push(c.name);
            });
        }
        if (c.methods) {
            c.methods.forEach((m: any) => {
            results.push(`${c.name}#${m.name}`);
            });
        }
        if (c.events) {
            c.events.forEach((m: any) => {
            results.push(`${c.name}#${m.name}`);
            });
        }
        });
        if (json.typedefs) {
        json.typedefs.forEach((c: any) => {
            results.push(c.name);
            typedefs.push(c.name);
            if (c.props) {
            c.props.forEach((p: any) => {
                results.push(`${c.name}.${p.name}`);
            });
            }
        });
        }
    }
    return [results, classes, typedefs];
}

export {
    getQueryType,
    buildGeneralEmbed,
    buildSpecificEmbed,
    getParent,
    resolveMethodOrPropOrEvent,
    getQueryParentName,
    getQueryParamName,
    fetchGithub,
    djsdocs
};