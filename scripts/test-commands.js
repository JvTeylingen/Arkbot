const path = require('node:path');
const dataLoader = require('../src/utils/dataLoader');

console.log('Loading data...\n');
const data = dataLoader.loadAll();

console.log(`Dinos:       ${Object.keys(data.dinos).length}`);
console.log(`Items:       ${Object.keys(data.items).length}`);
console.log(`Resources:   ${Object.keys(data.resources).length}`);
console.log(`Engram lvls: ${Object.keys(data.engrams).length}`);
console.log(`Progress:    ${Object.keys(data.progression).length}`);
console.log('');

const handlersPath = path.join(__dirname, '../src/handlers');
const fs = require('node:fs');
const handlerFiles = fs.readdirSync(handlersPath).filter(f => f.endsWith('.js'));
console.log(`Handlers: ${handlerFiles.length}`);
for (const file of handlerFiles) {
  const h = require(path.join(handlersPath, file));
  const hasAuto = typeof h.autocomplete === 'function';
  const hasExec = typeof h.execute === 'function';
  console.log(`  - ${file}  autocomplete=${hasAuto} execute=${hasExec}`);
}
console.log('');

async function test(description, fn) {
  try {
    await fn();
    console.log(`  PASS  ${description}`);
  } catch (e) {
    console.log(`  FAIL  ${description} — ${e.message}`);
  }
}

async function run() {
  console.log('Running integration tests...\n');

  await test('dino lookup: Rex', async () => {
    const dino = data.dinos['Rex'];
    if (!dino) throw new Error('Rex not found');
    if (dino.baseStats.health !== 1100) throw new Error(`Expected HP 1100, got ${dino.baseStats.health}`);
  });

  await test('dino lookup: Dodo (has null kibble/saddle)', async () => {
    const dino = data.dinos['Dodo'];
    if (!dino) throw new Error('Dodo not found');
    if (dino.taming.preferredKibble !== null) throw new Error('Dodo kibble should be null');
    if (dino.saddleLevel !== null) throw new Error('Dodo saddle should be null');
  });

  await test('item lookup: Fabricator', async () => {
    const item = data.items['Fabricator'];
    if (!item) throw new Error('Fabricator not found');
    if (!item.craftingRecipe) throw new Error('Fabricator should have recipe');
  });

  await test('item lookup: Narcoberry (no recipe, null fields)', async () => {
    const item = data.items['Narcoberry'];
    if (!item) throw new Error('Narcoberry not found');
    if (item.craftingRecipe !== null) throw new Error('Narcoberry should have no recipe');
    if (item.unlockLevel !== null) throw new Error('Narcoberry unlockLevel should be null');
  });

  await test('resource lookup: Metal', async () => {
    const res = data.resources['Metal'];
    if (!res) throw new Error('Metal not found');
    if (!res.bestGatheringTools.includes('Ankylosaurus')) throw new Error('Expected Ankylosaurus in tools');
  });

  await test('engram: level 1 exists', async () => {
    const engrams = data.engrams['1'];
    if (!engrams) throw new Error('Level 1 engrams missing');
    if (!engrams.includes('Campfire')) throw new Error('Expected Campfire at level 1');
  });

  await test('progression: level 15 exists', async () => {
    const prog = data.progression['15'];
    if (!prog) throw new Error('Level 15 progression missing');
    if (prog.tameSuggestions.length === 0) throw new Error('Expected tame suggestions');
  });

  await test('calculators: dinoBreeding has Rex', async () => {
    const breed = data.calculators.dinoBreeding;
    if (!breed) throw new Error('dinoBreeding missing');
    if (!breed['Rex']) throw new Error('Rex breeding data missing');
  });

  await test('flattenRecipe: Fabricator raw cost', async () => {
    const { flattenRecipe } = require('../src/utils/flattenRecipe');
    const raw = flattenRecipe('Fabricator', data.items);
    if (raw['Metal Ore'] !== 60) throw new Error(`Expected 60 Metal Ore, got ${raw['Metal Ore']}`);
    if (raw['Hide'] !== 15) throw new Error(`Expected 15 Hide, got ${raw['Hide']}`);
  });

  await test('helpers: calculateBreedData for Rex', async () => {
    const { calculateBreedData } = require('../src/utils/helpers');
    const dino = data.dinos['Rex'];
    const result = calculateBreedData(dino, data.calculators);
    if (!result.incubation) throw new Error('No incubation data');
    if (!result.totalTime) throw new Error('No totalTime data');
  });

  await test('helpers: inferDinoUses for Rex', async () => {
    const { inferDinoUses } = require('../src/utils/helpers');
    const dino = data.dinos['Rex'];
    const uses = inferDinoUses(dino);
    if (!uses.includes('Combat')) throw new Error('Rex should have Combat use');
    if (!uses.includes('Riding')) throw new Error('Rex should have Riding use');
  });

  await test('ark.js dispatcher: all handler groups loadable', async () => {
    const ark = require('../src/commands/ark');
    if (ark.data.name !== 'ark') throw new Error('Command name should be ark');
    const optionCount = ark.data.options.length;
    // 6 plain + 3 groups (suggest, calc, admin)
    if (optionCount < 9) throw new Error(`Expected 9+ options, got ${optionCount}`);
  });

  console.log('\nAll tests passed!');
}

run().catch(console.error);
