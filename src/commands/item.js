const { SlashCommandBuilder } = require('discord.js');
const { buildItemEmbed } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Look up an item')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Item name')
        .setAutocomplete(true)
        .setRequired(true)),

  async autocomplete(interaction, data) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const choices = Object.keys(data.items);
    const filtered = choices.filter(choice =>
      choice.toLowerCase().includes(focusedValue));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  },

  async execute(interaction, data) {
    const name = interaction.options.getString('name');
    const item = data.items[name];

    if (!item) {
      return interaction.reply({
        content: `Item "${name}" not found!`,
        ephemeral: true,
      });
    }

    const embed = buildItemEmbed(item);
    await interaction.reply({ embeds: [embed] });
  },
};