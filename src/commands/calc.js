const { SlashCommandBuilder } = require('discord.js');
const { buildBreedEmbed, buildCraftEmbed, buildRawCraftEmbed } = require('../utils/embedBuilder');
const { flattenRecipe } = require('../utils/flattenRecipe');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('ARK calculations')
    .addSubcommand(sub =>
      sub.setName('breed')
        .setDescription('Calculate breeding timers for a dino')
        .addStringOption(opt =>
          opt.setName('dino')
            .setDescription('Dino name')
            .setAutocomplete(true)
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('craft')
        .setDescription('Calculate crafting requirements for an item')
        .addStringOption(opt =>
          opt.setName('item')
            .setDescription('Item name')
            .setAutocomplete(true)
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('raw')
        .setDescription('Calculate the full raw material cost (recursively resolves craftable ingredients)')
        .addStringOption(opt =>
          opt.setName('item')
            .setDescription('Item name')
            .setAutocomplete(true)
            .setRequired(true))),

  async autocomplete(interaction, data) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const subcommand = interaction.options.getSubcommand();

    let choices;
    if (subcommand === 'breed') {
      choices = Object.keys(data.dinos);
    } else if (subcommand === 'craft' || subcommand === 'raw') {
      choices = Object.keys(data.items);
    }

    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focusedValue));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  },

  async execute(interaction, data) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'breed') {
      const dinoName = interaction.options.getString('dino');
      const dino = data.dinos[dinoName];

      if (!dino) {
        return interaction.reply({
          content: `Dino "${dinoName}" not found!`,
          ephemeral: true,
        });
      }

      const breedData = calculateBreedData(dino, data.calculators);
      const embed = buildBreedEmbed(dino, breedData);
      await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'craft') {
      const itemName = interaction.options.getString('item');
      const item = data.items[itemName];

      if (!item) {
        return interaction.reply({
          content: `Item "${itemName}" not found!`,
          ephemeral: true,
        });
      }

      if (!item.craftingRecipe) {
        return interaction.reply({
          content: `No crafting recipe found for "${itemName}".`,
          ephemeral: true,
        });
      }

      const embed = buildCraftEmbed(item, item.craftingRecipe);
      await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'raw') {
      const itemName = interaction.options.getString('item');
      const item = data.items[itemName];

      if (!item) {
        return interaction.reply({
          content: `Item "${itemName}" not found!`,
          ephemeral: true,
        });
      }

      if (!item.craftingRecipe) {
        return interaction.reply({
          content: `No crafting recipe found for "${itemName}".`,
          ephemeral: true,
        });
      }

      const rawCosts = flattenRecipe(itemName, data.items);
      const embed = buildRawCraftEmbed(item, item.craftingRecipe, rawCosts);
      await interaction.reply({ embeds: [embed] });
    }
  },
};

function calculateBreedData(dino, calculators) {
  const dinoBreed = calculators.dinoBreeding?.[dino.shortName || dino.name];
  const formulas = calculators.breedingFormulas || {};
  const mult = formulas.maturationMultiplier || 1;

  if (dinoBreed) {
    return {
      incubation: `${Math.round(dinoBreed.incubationMin * mult)} min`,
      maturation: `${Math.round(dinoBreed.maturationMin * mult)} min (${Math.round(dinoBreed.maturationMin * mult / 60)}h)`,
      imprintInterval: `${Math.round(dinoBreed.imprintIntervalMin * mult)} min (every ${Math.round(dinoBreed.imprintIntervalMin * mult / 60)}h)`,
      totalTime: `${Math.round(dinoBreed.totalAdultMin * mult)} min (${Math.round(dinoBreed.totalAdultMin * mult / 60)}h)`,
      mutationChance: `${(formulas.mutationChance || 0.025) * 100}% per parent`,
    };
  }

  const baseIncubation = dino.baseStats.health / 100;
  return {
    incubation: `${Math.round(baseIncubation * mult)} min`,
    maturation: `${Math.round(baseIncubation * mult * 10)} min`,
    imprintInterval: formulas.imprintInterval || '8h',
    totalTime: `${Math.round(baseIncubation * mult * 12)} min`,
    mutationChance: `${(formulas.mutationChance || 0.025) * 100}% per parent`,
  };
}
