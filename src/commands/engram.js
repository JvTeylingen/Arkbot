const { SlashCommandBuilder } = require('discord.js');
const { buildEngramEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('engram')
    .setDescription('List all engrams unlocked at a level')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Player level (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)),

  async execute(interaction, data) {
    const level = interaction.options.getInteger('level');
    const engrams = data.engrams[level.toString()];

    if (!engrams || engrams.length === 0) {
      return interaction.reply({
        content: `No engrams found for level ${level}.`,
        ephemeral: true,
      });
    }

    const embed = buildEngramEmbed(level, engrams);
    await interaction.reply({ embeds: [embed] });
  },
};