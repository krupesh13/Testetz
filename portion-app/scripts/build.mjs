// Builds www/ (what goes inside the app) from src/.
// src/index.html is your website, unchanged. This script only:
//   1. adds native.css + native-bridge.js at the end of <body>
//   2. downloads the Google Fonts (DM Sans, Fraunces, Manrope) into the app so
//      the typography is identical even with no internet. If the download
//      fails, the original Google Fonts link is kept (fonts load when online).
import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src'), www = join(root, 'www');

await rm(www, { recursive: true, force: true });
await mkdir(join(www, 'fonts'), { recursive: true });

let html = await readFile(join(src, 'index.html'), 'utf8');
const inject = '<link rel="stylesheet" href="native.css"><script src="native-bridge.js"></script>\n';
if (!html.includes('</body>')) throw new Error('src/index.html: </body> not found');
html = html.replace(/<\/body>(?![\s\S]*<\/body>)/, inject + '</body>');
await copyFile(join(src, 'native.css'), join(www, 'native.css'));
await copyFile(join(src, 'native-bridge.js'), join(www, 'native-bridge.js'));

const linkRe = /<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)">/;
const m = html.match(linkRe);
if (m) {
  try {
    const cssUrl = m[1].replace(/&amp;/g, '&');
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
    const r = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    let css = await r.text();
    const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(x => x[1]))];
    if (!urls.length) throw new Error('no font files in CSS');
    let i = 0;
    for (const u of urls) {
      const name = `f${++i}.woff2`;
      const fr = await fetch(u);
      if (!fr.ok) throw new Error('HTTP ' + fr.status + ' for ' + u);
      await writeFile(join(www, 'fonts', name), Buffer.from(await fr.arrayBuffer()));
      css = css.split(u).join(name);
    }
    await writeFile(join(www, 'fonts', 'fonts.css'), css);
    html = html.replace(linkRe, '<link rel="stylesheet" href="fonts/fonts.css">');
    console.log(`✓ Bundled ${urls.length} font files for offline use`);
  } catch (e) {
    console.warn('! Could not download Google Fonts (' + e.message + '). Keeping the online link; fonts load when the phone is online.');
  }
}

await writeFile(join(www, 'index.html'), html);
console.log('✓ www/ built');
