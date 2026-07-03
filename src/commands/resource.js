const { SlashCommandBuilder } = require('discord.js');
const { buildResourceEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resource')
    .setDescription('Look up a resource')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Resource name')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction, data) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const choices = Object.keys(data.resources);
    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focusedValue));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  },

  async execute(interaction, data) {
    const name = interaction.options.getString('name');
    const resource = data.resources[name];

    if (!resource) {
      return interaction.reply({
        content: `Resource "${name}" not found!`,
        ephemeral: true,
      });
    }

    const embed = buildResourceEmbed(resource);
    await interaction.reply({ embeds: [embed] });
  },
};