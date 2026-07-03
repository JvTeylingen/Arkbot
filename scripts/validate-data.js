const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '../data');
const files = [
  'dinos.json',
  'items.json',
  'resources.json',
  'engrams.json',
  'calculators.json',
  'progression.json',
];

let errors = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing: ${file}`);
      errors++;
      continue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    JSON.parse(raw);
    console.log(`✅ Valid JSON: ${file}`);
  } catch (e) {
    console.error(`❌ Invalid JSON: ${file} — ${e.message}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} file(s) have errors.`);
  process.exit(1);
} else {
  console.log('\nAll data files are valid.');
}