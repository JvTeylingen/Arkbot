const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '../../data');

function loadJson(file) {
    const filePath = path.join(dataDir, file);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

module.exports = {
  loadAll: () => ({
    dinos: loadJson('dinos.json'),
    items: loadJson('items.json'),
    resources: loadJson('resources.json'),
    engrams: loadJson('engrams.json'),
    calculators: loadJson('calculators.json'),
    progression: loadJson('progression.json'),
  }),
  load: (file) => loadJson(file),
};