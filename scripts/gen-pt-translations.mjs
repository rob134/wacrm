import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(readFileSync(join(__dirname, 'en-keys-remaining.json'), 'utf8'));

/** @type {Record<string, string>} */
const T = {};

function assign(obj) {
  Object.assign(T, obj);
}

// Sections loaded from pt-translations-parts/*.json
import { readdirSync } from 'node:fs';
const partsDir = join(__dirname, 'pt-translations-parts');
for (const file of readdirSync(partsDir).sort()) {
  if (file.endsWith('.json')) {
    assign(JSON.parse(readFileSync(join(partsDir, file), 'utf8')));
  }
}

const expected = Object.keys(en);
const missing = expected.filter((k) => T[k] === undefined);
const extra = Object.keys(T).filter((k) => !en[k]);

if (missing.length) {
  console.error('Missing translations:', missing.length);
  console.error(missing.slice(0, 20));
  process.exit(1);
}
if (extra.length) {
  console.error('Extra keys:', extra.length);
  process.exit(1);
}

const out = {};
for (const k of expected.sort()) {
  out[k] = T[k];
}

writeFileSync(join(__dirname, 'pt-translations.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('Written', Object.keys(out).length, 'keys to pt-translations.json');
