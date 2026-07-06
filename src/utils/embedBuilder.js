const { EmbedBuilder } = require('discord.js');

function buildDinoEmbed(dino) {
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(dino.name)
    .addFields(
      { name: 'Health', value: dino.baseStats.health.toString(), inline: true },
      { name: 'Stamina', value: dino.baseStats.stamina.toString(), inline: true },
      { name: 'Damage', value: dino.baseStats.meleeDamage.toString(), inline: true },
      { name: 'Taming Method', value: dino.taming.method, inline: true },
      { name: 'Preferred Kibble', value: dino.taming.preferredKibble ?? 'None', inline: true },
      { name: 'Saddle Level', value: dino.saddleLevel?.toString() ?? 'N/A', inline: true },
      { name: 'Drops', value: dino.drops.join(', '), inline: false },
    );

  if (dino.spawnLocations) {
    embed.addFields(
      { name: 'Spawn Locations', value: formatSpawns(dino.spawnLocations), inline: false },
    );
  }

  return embed.setTimestamp().setFooter({ text: 'ARK: Survival Evolved' });
}

function buildResourceEmbed(resource) {
  return new EmbedBuilder()
    .setColor(0x00AA44)
    .setTitle(resource.name)
    .addFields(
      { name: 'Category', value: resource.category, inline: true },
      { name: 'Weight', value: `${resource.weight} kg`, inline: true },
      { name: 'Best Tools', value: resource.bestGatheringTools.join(', '), inline: false },
      { name: 'Uses', value: resource.uses.join(', '), inline: false },
      { name: 'Spawn Locations', value: formatSpawns(resource.spawnLocations), inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildItemEmbed(item) {
  const embed = new EmbedBuilder()
    .setColor(0xFFAA00)
    .setTitle(item.name)
    .setDescription(item.description)
    .addFields(
      { name: 'Category', value: item.category, inline: true },
      { name: 'Unlock Level', value: item.unlockLevel?.toString() ?? 'Not craftable', inline: true },
      { name: 'Blueprint Path', value: item.blueprintPath ?? 'N/A', inline: true },
    );

  if (item.craftingRecipe) {
    const ingredients = Object.entries(item.craftingRecipe.ingredients)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join('\n');
    embed.addFields(
      { name: 'Crafting Station', value: item.craftingRecipe.station, inline: true },
      { name: 'Crafting Time', value: item.craftingRecipe.time, inline: true },
      { name: 'Ingredients', value: ingredients, inline: false },
    );
  }

  return embed.setTimestamp().setFooter({ text: 'ARK: Survival Evolved' });
}

function buildKibbleEmbed(dino) {
  const kibble = dino.taming.preferredKibble ?? 'None (use Mejoberry)';
  const bonus = dino.taming.kibbleBonus ? `${(dino.taming.kibbleBonus * 100)}%` : 'N/A';

  return new EmbedBuilder()
    .setColor(0xFF66AA)
    .setTitle(`Kibble for ${dino.name}`)
    .addFields(
      { name: 'Preferred Kibble', value: kibble, inline: true },
      { name: 'Effectiveness Bonus', value: bonus, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildEngramEmbed(level, engrams) {
  return new EmbedBuilder()
    .setColor(0xAA44FF)
    .setTitle(`Engrams unlocked at Level ${level}`)
    .setDescription(engrams.join('\n'))
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildProgressionEmbed(level, data) {
  return new EmbedBuilder()
    .setColor(0x44AAFF)
    .setTitle(`Level ${level} Progression`)
    .addFields(
      { name: 'Objectives', value: data.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n'), inline: false },
      { name: 'Tame Suggestions', value: data.tameSuggestions.join(', '), inline: true },
      { name: 'Home Suggestions', value: data.homeSuggestions.join(', '), inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildTameSuggestionEmbed(suggestion) {
  return new EmbedBuilder()
    .setColor(0x44DD44)
    .setTitle(suggestion.name)
    .setDescription(suggestion.reason)
    .addFields(
      { name: 'Saddle Level', value: suggestion.saddleLevel?.toString() ?? 'No saddle', inline: true },
      { name: 'Taming Difficulty', value: suggestion.difficulty, inline: true },
      { name: 'Best Uses', value: suggestion.uses?.join(', ') ?? 'General', inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildHomeSuggestionEmbed(biome) {
  return new EmbedBuilder()
    .setColor(0x44DD44)
    .setTitle(biome.name)
    .addFields(
      { name: 'Safety Rating', value: biome.safety ?? 'Unknown', inline: true },
      { name: 'Required Gear', value: biome.gear?.join(', ') ?? 'Basic tools', inline: true },
      { name: 'Recommended Biomes', value: Array.isArray(biome.resources) ? biome.resources.join(', ') : (biome.resources ?? 'Varies'), inline: false },
      { name: 'Watch Out For', value: Array.isArray(biome.threats) ? biome.threats.join(', ') : (biome.threats ?? 'Unknown'), inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildBreedEmbed(dino, breedData) {
  return new EmbedBuilder()
    .setColor(0xFF88CC)
    .setTitle(`Breeding: ${dino.name}`)
    .addFields(
      { name: 'Incubation Time', value: breedData.incubation, inline: true },
      { name: 'Maturation Time', value: breedData.maturation, inline: true },
      { name: 'Imprint Interval', value: breedData.imprintInterval, inline: true },
      { name: 'Total Time to Adult', value: breedData.totalTime, inline: true },
      { name: 'Mutation Chance', value: breedData.mutationChance || 'Varies', inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildCraftEmbed(item, craftData) {
  const ingredients = Object.entries(craftData.ingredients)
    .map(([name, qty]) => `${qty}x ${name}`)
    .join('\n');

  return new EmbedBuilder()
    .setColor(0xFF8800)
    .setTitle(`Crafting: ${item.name}`)
    .addFields(
      { name: 'Ingredients', value: ingredients, inline: false },
      { name: 'Station', value: craftData.station, inline: true },
      { name: 'Time', value: craftData.time, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildRawCraftEmbed(item, directRecipe, rawCosts) {
  const directIngredients = Object.entries(directRecipe.ingredients)
    .map(([name, qty]) => `${qty}x ${name}`)
    .join('\n');

  const sortedRaws = Object.entries(rawCosts)
    .sort(([, a], [, b]) => b - a);
  const rawLines = sortedRaws.length
    ? sortedRaws.map(([name, qty]) => `${qty}x ${name}`).join('\n')
    : 'All ingredients are raw';

  return new EmbedBuilder()
    .setColor(0xFF6600)
    .setTitle(`Raw Cost: ${item.name}`)
    .setDescription('Recursively resolved to raw materials')
    .addFields(
      { name: 'Station', value: directRecipe.station, inline: true },
      { name: 'Time', value: directRecipe.time, inline: true },
      { name: 'Direct Ingredients', value: directIngredients, inline: false },
      { name: 'Raw Materials (what to farm)', value: rawLines, inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildGatherEmbed(resource, dinoNames, toolNames) {
  const embed = new EmbedBuilder()
    .setColor(0x00CC88)
    .setTitle(`${resource.name} — Best Gathering Methods`);

  if (dinoNames.length) {
    embed.addFields({ name: 'Recommended Dinosaurs', value: dinoNames.join(', '), inline: false });
  }
  if (toolNames.length) {
    embed.addFields({ name: 'Best Tools', value: toolNames.join(', '), inline: false });
  }

  embed.addFields(
    { name: 'Category', value: resource.category, inline: true },
    { name: 'Weight', value: `${resource.weight} kg`, inline: true },
    { name: 'Uses', value: resource.uses.join(', '), inline: false },
  );

  if (resource.spawnLocations) {
    embed.addFields({ name: 'Spawn Locations', value: formatSpawns(resource.spawnLocations), inline: false });
  }

  return embed.setTimestamp().setFooter({ text: 'ARK: Survival Evolved' });
}

function buildTamingEmbed(dino, tameData) {
  const foods = tameData.foods.join(', ');
  const kibble = tameData.preferredKibble ?? 'None';
  const bonus = tameData.kibbleBonus ? `${(tameData.kibbleBonus * 100)}%` : 'N/A';
  const timeH = Math.floor(tameData.estimatedTimeMin / 60);
  const timeM = tameData.estimatedTimeMin % 60;
  const timeStr = timeH > 0 ? `${timeH}h ${timeM}m` : `${timeM}m`;

  return new EmbedBuilder()
    .setColor(0xFF8844)
    .setTitle(`Taming: ${dino.name} (Level ${tameData.level})`)
    .addFields(
      { name: 'Method', value: tameData.method.charAt(0).toUpperCase() + tameData.method.slice(1), inline: true },
      { name: 'Torpor', value: tameData.torpor.toString(), inline: true },
      { name: 'Preferred Food', value: tameData.bestFood, inline: true },
      { name: 'Accepts', value: foods, inline: false },
      { name: 'Preferred Kibble', value: kibble, inline: true },
      { name: 'Kibble Bonus', value: bonus, inline: true },
      { name: 'Food Needed (est.)', value: `${tameData.totalEats}x ${tameData.bestFood}`, inline: false },
      { name: 'Estimated Time', value: `${timeStr} @ ${tameData.speedMult}x`, inline: true },
      { name: 'Narcotics Needed (est.)', value: `~${tameData.narcoticsNeeded} narco`, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function buildConfigEmbed(items) {
  const lines = items.map(it => {
    const check = it.overridden ? '✅' : '⬜';
    return `${check} **${it.label}**: ${it.current} (default: ${it.default})`;
  });

  return new EmbedBuilder()
    .setColor(0x44AADD)
    .setTitle('Server Config — Overrides')
    .setDescription(lines.join('\n'))
    .addFields(
      { name: 'Legend', value: '✅ = Override active\n⬜ = Using default', inline: false },
      { name: 'How to change', value: '`/ark admin config-set <key> <value>`\nKeys: tamingSpeedMultiplier, maturationMultiplier, incubationMultiplier, craftingSpeedMultiplier, kibbleEffectiveness', inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
}

function formatSpawns(spawns) {
  if (!spawns || !spawns.length) return 'N/A';
  return spawns.map(s => `**${s.map}**: ${s.biomes.join(', ')}`).join('\n');
}

module.exports = {
  buildDinoEmbed,
  buildResourceEmbed,
  buildItemEmbed,
  buildKibbleEmbed,
  buildEngramEmbed,
  buildProgressionEmbed,
  buildTameSuggestionEmbed,
  buildHomeSuggestionEmbed,
  buildBreedEmbed,
  buildCraftEmbed,
  buildRawCraftEmbed,
  buildGatherEmbed,
  buildTamingEmbed,
  buildConfigEmbed,
};