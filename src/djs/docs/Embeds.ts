const { EmbedBuilder } = require("@discordjs/builders");

function normalizeJSDoc(str: string) {
  return str.replace(/\{@link\s([^}]+)\}/g, "$1").replace("\n", " ");
}

function arraysToStr(arr: Array<Array<any>>, join = "", meta?: any) {
  let str = runArrToStr(arr, join, meta);
  str = str.replaceAll(`${join}<`, "<").replaceAll(`<${join}`, "<").replaceAll(`${join}>`, ">").replaceAll(`>${join}`,">").replaceAll("<", "\\<");
  if(str.endsWith(join)) str = str.substring(0, str.length-join.length);
  return str;
}
function runArrToStr(arr: Array<any> | Array<Array<any>>, join = "", meta?: any){
  let str = "";
  arr.forEach(a => {
    if (Array.isArray(a)) {
      str += runArrToStr(a, join, meta);
    } else {
      if(meta && meta.classes.includes(a)) str += `[${a}](${meta.doc}class/${a})` + join;
      else if(meta && meta.typedefs.includes(a)) str += `[${a}](${meta.doc}typedef/${a})` + join;
      else str += a + join;
    }
  });
  return str;
}

function normalizeStr(str: string) {
  return str.replace(/<info>|<\/info>/g, "");
}

function buildGeneralEmbed(parent: any, meta: any) {
  let description = "";
  if (parent.description) description += `**Description:** ${normalizeJSDoc(parent.description)}`;
  if (parent.props?.length) {
    description += "\n\n**Properties:**\n";
    parent.props.forEach((p: any, index: number) => {
      description += `\`${p.name}\`${index + 1 < parent.props.length ? ", " : ""}`;
    });
  }
  if (parent.methods?.length) {
    description += "\n\n**Methods:**\n";
    parent.methods.forEach((m: any, index: number) => {
      description += `\`${m.name}\`${index + 1 < parent.methods.length ? ", " : ""}`;
    });
  }
  if (parent.events?.length) {
    description += "\n\n**Events:**\n";
    parent.events.forEach((e: any, index: number) => {
      description += `\`${e.name}\`${index + 1 < parent.events.length ? ", " : ""}`;
    });
  }
  if (parent.meta) description += `\n\n[Source code](${parent.meta?.url ? parent.meta.url : meta.github + parent.meta?.path ? parent.meta.path : "src" + "/" + parent.meta.file + "#L" + parent.meta.line})`;
  description += `${parent?.name ? " | " : "\n\n"}[Documentation](${meta.doc}${parent.type}/${parent.name})`;
  description = normalizeStr(description);
  const embed = new EmbedBuilder()
    .setAuthor({ name: meta.name + " - " +parent.name, url: `${meta.doc}${parent.type}/${parent.name}`, iconURL: "https://cdn.discordapp.com/attachments/871732319449395240/959924116046090250/ezgif-5-73b32bedb6.png" })
    .setDescription(description)
    .setColor(0x00AE86);
  return embed;
}

function buildSpecificEmbed(parent: any, child: any, meta: any) {
  let description = "";
  if (child.description) description += `**Description:** ${normalizeJSDoc(child.description)}`;
  if (child.params?.length) {
    description += "\n\n**Parameters:**\n";
    child.params.forEach((p: any) => {
      description += `- \`${p.name}\` ${(arraysToStr(p.type, " | ", meta))} ${p.description ? "\n" + p.description : ""}\n`;
    });
  }
  if (child.returns?.length) {
    description += "\n**Returns:**\n";
    description += arraysToStr(child.returns, "");
  }
  if (child.examples?.length) {
    description += "\n\n**Examples:**\n";
    child.examples.forEach((e: string) => {
      description += `\`\`\`js\n${e}\n\`\`\``;
    });
  }
  if (child.meta) description += `\n\n[Code source](${meta.github + child.meta.path + "/" + child.meta.file + "#L" + child.meta.line})`;
  if(child.meta) description += ` | [Documentation](${meta.doc}${parent.type}/${parent.name}?scrollTo=${child.name})`;
  else description += `\n\n[Documentation](${meta.doc}${parent.type}/${parent.name}?scrollTo=${child.name})`;

  description = normalizeStr(description);
  const embed = new EmbedBuilder()
    //.setTitle(child.async ? `[async] ${parent.name + "#" + child.name}` : parent.name + "#" + child.name)
    .setAuthor({ name: child.async ? `${meta.name + " - " + "[async] " +parent.name + "#" + child.name}` : meta.name + " - " + parent.name + "#" + child.name, url: `${meta.doc}${parent.type}/${parent.name}?scrollTo=${child.name}`, iconURL: "https://cdn.discordapp.com/attachments/871732319449395240/959924116046090250/ezgif-5-73b32bedb6.png" })
    .setColor(0x00AE86)
    .setDescription(description);
  return embed;
}

export { buildGeneralEmbed, buildSpecificEmbed };