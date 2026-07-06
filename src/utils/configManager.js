const path = require('node:path');
const fs = require('node:fs');

const overridesPath = path.join(__dirname, '../../data/overrides.json');

const CONFIGURABLE_KEYS = {
  tamingSpeedMultiplier: { type: 'number', default: 1, path: ['tamingFormulas', 'tamingSpeedMultiplier'], label: 'Taming Speed' },
  maturationMultiplier: { type: 'number', default: 1, path: ['breedingFormulas', 'maturationMultiplier'], label: 'Maturation Speed' },
  incubationMultiplier: { type: 'number', default: 1, path: ['breedingFormulas', 'incubationMultiplier'], label: 'Incubation Speed' },
  craftingSpeedMultiplier: { type: 'number', default: 1, path: ['craftingFormulas', 'craftingSpeedMultiplier'], label: 'Crafting Speed' },
  kibbleEffectiveness: { type: 'number', default: 0.5, path: ['tamingFormulas', 'kibbleEffectiveness'], label: 'Kibble Effectiveness' },
};

function readOverrides() {
  try {
    if (fs.existsSync(overridesPath)) {
      return JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
    }
  } catch { }
  return {};
}

function writeOverrides(overrides) {
  fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2), 'utf8');
}

function load(data) {
  const overrides = readOverrides();
  const calculators = data.calculators;
  for (const [key, config] of Object.entries(CONFIGURABLE_KEYS)) {
    if (overrides[key] !== undefined) {
      let target = calculators;
      for (let i = 0; i < config.path.length - 1; i++) {
        target = target[config.path[i]] = target[config.path[i]] || {};
      }
      target[config.path.at(-1)] = overrides[key];
    }
  }
  return overrides;
}

function set(key, value) {
  const config = CONFIGURABLE_KEYS[key];
  if (!config) throw new Error(`Unknown config key. Valid: ${Object.keys(CONFIGURABLE_KEYS).join(', ')}`);
  const num = Number(value);
  if (config.type === 'number' && (Number.isNaN(num) || num < 0)) throw new Error('Value must be a positive number.');
  const overrides = readOverrides();
  overrides[key] = num;
  writeOverrides(overrides);
  return { key, value: num, label: config.label };
}

function getAll(data) {
  const overrides = readOverrides();
  const result = [];
  for (const [key, config] of Object.entries(CONFIGURABLE_KEYS)) {
    let current = data.calculators;
    for (const segment of config.path) current = current[segment];
    result.push({
      key,
      label: config.label,
      default: config.default,
      current,
      overridden: overrides[key] !== undefined,
    });
  }
  return result;
}

module.exports = { load, set, getAll, CONFIGURABLE_KEYS };
