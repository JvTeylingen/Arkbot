const path = require('node:path');
const fs = require('node:fs');

const guildsDir = path.join(__dirname, '../../data/guilds');

const CONFIGURABLE_KEYS = {
  tamingSpeedMultiplier: { type: 'number', default: 1, path: ['tamingFormulas', 'tamingSpeedMultiplier'], label: 'Taming Speed' },
  maturationMultiplier: { type: 'number', default: 1, path: ['breedingFormulas', 'maturationMultiplier'], label: 'Maturation Speed' },
  incubationMultiplier: { type: 'number', default: 1, path: ['breedingFormulas', 'incubationMultiplier'], label: 'Incubation Speed' },
  craftingSpeedMultiplier: { type: 'number', default: 1, path: ['craftingFormulas', 'craftingSpeedMultiplier'], label: 'Crafting Speed' },
  kibbleEffectiveness: { type: 'number', default: 0.5, path: ['tamingFormulas', 'kibbleEffectiveness'], label: 'Kibble Effectiveness' },
};

function guildPath(guildId) {
  return path.join(guildsDir, `${guildId}.json`);
}

function readOverrides(guildId) {
  const filePath = guildPath(guildId);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch { }
  return {};
}

function writeOverrides(guildId, overrides) {
  const filePath = guildPath(guildId);
  fs.mkdirSync(guildsDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(overrides, null, 2), 'utf8');
}

function applyOverrides(guildId, baseCalculators) {
  const overrides = readOverrides(guildId);
  const calculators = JSON.parse(JSON.stringify(baseCalculators));
  for (const [key, config] of Object.entries(CONFIGURABLE_KEYS)) {
    if (overrides[key] !== undefined) {
      let target = calculators;
      for (let i = 0; i < config.path.length - 1; i++) {
        target = target[config.path[i]] = target[config.path[i]] || {};
      }
      target[config.path.at(-1)] = overrides[key];
    }
  }
  return calculators;
}

function set(guildId, key, value) {
  const config = CONFIGURABLE_KEYS[key];
  if (!config) throw new Error(`Unknown config key. Valid: ${Object.keys(CONFIGURABLE_KEYS).join(', ')}`);
  const num = Number(value);
  if (config.type === 'number' && (Number.isNaN(num) || num < 0)) throw new Error('Value must be a positive number.');
  const overrides = readOverrides(guildId);
  overrides[key] = num;
  writeOverrides(guildId, overrides);
  return { key, value: num, label: config.label };
}

function getAll(guildId, baseCalculators) {
  const overrides = readOverrides(guildId);
  const calculators = applyOverrides(guildId, baseCalculators);
  const result = [];
  for (const [key, config] of Object.entries(CONFIGURABLE_KEYS)) {
    let current = calculators;
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

function getFeature(guildId, key) {
  const overrides = readOverrides(guildId);
  return overrides[key] ?? null;
}

function setFeature(guildId, key, value) {
  const overrides = readOverrides(guildId);
  overrides[key] = value;
  writeOverrides(guildId, overrides);
}

function getAllOverrides(guildId) {
  return readOverrides(guildId);
}

module.exports = { applyOverrides, set, getAll, getFeature, setFeature, getAllOverrides, CONFIGURABLE_KEYS };
