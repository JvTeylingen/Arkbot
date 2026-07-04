const { EmbedBuilder } = require('discord.js');

function buildDinoEmbed(dino) {
  return new EmbedBuilder()
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
      { name: 'Spawn Locations', value: formatSpawns(dino.spawnLocations), inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'ARK: Survival Evolved' });
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

function formatSpawns(spawns) {
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
};