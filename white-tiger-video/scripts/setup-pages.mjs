import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = resolve(__dirname, '../build');
const rootDir = resolve(__dirname, '../../');

// Patch Remotion's index.html to use relative paths → player.html
let html = readFileSync(`${buildDir}/index.html`, 'utf8');
html = html
  .replace('href="/favicon.ico"', 'href="favicon.ico"')
  .replace('src="/bundle.js"', 'src="bundle.js"')
  .replace('window.remotion_staticBase = "/public"', 'window.remotion_staticBase = "public"')
  .replace('window.remotion_publicPath = "/"', 'window.remotion_publicPath = "./"')
  .replace(/"src":"\/public\//g, '"src":"public/')
  .replace('<title>Remotion Bundle</title>', '<title>The White Tiger — Interactive Video Player</title>');
writeFileSync(`${buildDir}/player.html`, html);

// Install landing page as root index.html
copyFileSync(`${rootDir}/landing.html`, `${buildDir}/index.html`);

console.log('✔ setup-pages: player.html patched, landing page installed as index.html');
