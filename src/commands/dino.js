const { SlashCommandBuilder } = require('discord.js');
const { buildDinoEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino')
    .setDescription('Look up a dinosaur or creature')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the dinosaur')
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
    const dinoName = interaction.options.getString('name');
    const dino = data.dinos[dinoName];

    if (!dino) {
      return interaction.reply({
        content: `Dino "${dinoName}" not found!`,
        ephemeral: true,
      });
    }

    const embed = buildDinoEmbed(dino);
    await interaction.reply({ embeds: [embed] });
  },
};