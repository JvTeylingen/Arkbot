const { SlashCommandBuilder } = require('discord.js');
const { buildProgressionEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Get progression suggestions for a level')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Your current level')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)),

  async execute(interaction, data) {
    const level = interaction.options.getInteger('level');
    const prog = data.progression[level.toString()];

    if (!prog) {
      return interaction.reply({
        content: `No progression data available for level ${level}.`,
        ephemeral: true,
      });
    }

    const embed = buildProgressionEmbed(level, prog);
    await interaction.reply({ embeds: [embed] });
  },
};