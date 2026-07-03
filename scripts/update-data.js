const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const DATA_REPO_URL = process.env.DATA_REPO_URL || 'https://raw.githubusercontent.com/ark-bot/data/main';

const FILES = [
  'dinos.json',
  'items.json',
  'resources.json',
  'engrams.json',
  'calculators.json',
  'progression.json',
];

async function fetchFile(filename) {
  const url = `${DATA_REPO_URL}/${filename}`;
  const dest = path.join(__dirname, '../data', filename);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(false);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        fs.writeFileSync(dest, Buffer.concat(chunks));
        resolve(true);
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log(`Fetching ARK data from ${DATA_REPO_URL}...`);
  let updated = 0;

  for (const file of FILES) {
    const ok = await fetchFile(file);
    if (ok) {
      console.log(`  Updated: data/${file}`);
      updated++;
    } else {
      console.log(`  Skipped: data/${file} (not found in remote)`);
    }
  }

  if (updated === 0) {
    console.log('\nNo files updated. Data files already current or remote unavailable.');
  } else {
    console.log(`\nUpdated ${updated} file(s). Restart bot to apply changes.`);
  }
})();
