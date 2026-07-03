const { buildBreedEmbed, buildCraftEmbed, buildRawCraftEmbed } = require('../utils/embedBuilder');
const { calculateBreedData } = require('../utils/helpers');
const { flattenRecipe } = require('../utils/flattenRecipe');

async function autocomplete(interaction, data) {
  const sub = interaction.options.getSubcommand();
  const focused = interaction.options.getFocused().toLowerCase();

  let choices;
  if (sub === 'breed') choices = Object.keys(data.dinos);
  else if (sub === 'craft' || sub === 'raw') choices = Object.keys(data.items);

  if (!choices) return interaction.respond([]);
  const filtered = choices.filter(c => c.toLowerCase().includes(focused));
  await interaction.respond(filtered.map(c => ({ name: c, value: c })).slice(0, 25));
}

async function execute(interaction, data) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'breed') {
    const name = interaction.options.getString('dino');
    const dino = data.dinos[name];
    if (!dino) return interaction.reply({ content: `Dino "${name}" not found!`, ephemeral: true });

    const breedData = calculateBreedData(dino, data.calculators);
    return interaction.reply({ embeds: [buildBreedEmbed(dino, breedData)] });
  }

  if (sub === 'craft') {
    const name = interaction.options.getString('item');
    const item = data.items[name];
    if (!item) return interaction.reply({ content: `Item "${name}" not found!`, ephemeral: true });
    if (!item.craftingRecipe) return interaction.reply({ content: `No crafting recipe for "${name}".`, ephemeral: true });
    return interaction.reply({ embeds: [buildCraftEmbed(item, item.craftingRecipe)] });
  }

  if (sub === 'raw') {
    const name = interaction.options.getString('item');
    const item = data.items[name];
    if (!item) return interaction.reply({ content: `Item "${name}" not found!`, ephemeral: true });
    if (!item.craftingRecipe) return interaction.reply({ content: `No crafting recipe for "${name}".`, ephemeral: true });

    const raw = flattenRecipe(name, data.items);
    return interaction.reply({ embeds: [buildRawCraftEmbed(item, item.craftingRecipe, raw)] });
  }
}

module.exports = { autocomplete, execute };
