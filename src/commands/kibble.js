const { SlashCommandBuilder } = require('discord.js');
const { buildKibbleEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kibble')
    .setDescription('Get kibble information for a dino')
    .addStringOption(option =>
      option.setName('dino')
        .setDescription('Dino name')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction, data) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const choices = Object.keys(data.dinos);
    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focusedValue));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  },

  async execute(interaction, data) {
    const dinoName = interaction.options.getString('dino');
    const dino = data.dinos[dinoName];

    if (!dino) {
      return interaction.reply({
        content: `Dino "${dinoName}" not found!`,
        ephemeral: true,
      });
    }

    const embed = buildKibbleEmbed(dino);
    await interaction.reply({ embeds: [embed] });
  },
};