const fs = require('fs');
const path = require('path');

const checks = [
  { name: 'DISCORD_TOKEN set', pass: !!process.env.DISCORD_TOKEN },
  {
    name: 'Data files exist',
    pass: () => {
      const files = ['dinos.json', 'items.json', 'resources.json', 'engrams.json', 'calculators.json', 'progression.json'];
      return files.every(f => fs.existsSync(path.join(__dirname, '../data', f)));
    },
  },
  {
    name: 'Dependencies installed',
    pass: () => fs.existsSync(path.join(__dirname, '../node_modules/discord.js')),
  },
];

let allPass = true;
for (const check of checks) {
  const pass = typeof check.pass === 'function' ? check.pass() : check.pass;
  console.log(`${pass ? 'OK' : 'FAIL'} ${check.name}`);
  if (!pass) allPass = false;
}

if (!allPass) {
  console.error('\nDeploy checks failed. Fix the above issues and try again.');
  process.exit(1);
}
console.log('\nAll checks passed. Ready to deploy.');
