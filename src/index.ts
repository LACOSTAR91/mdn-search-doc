import MDN from './mdn';
import NodeJS from './nodejs';
import DiscordJS from './djs';

const mdn = new MDN({ name: 'mdn', duration: 24 * 60 * 60 * 1000 });
const nodejs = new NodeJS({ name: 'nodejs', duration: 24 * 60 * 60 * 1000 });
const djs = new DiscordJS({ name: 'djs', duration: 60 * 60 * 1000 });

export { mdn, nodejs, djs };