const { MessageFlags } = require('discord.js');
const {
  buildDinoEmbed, buildResourceEmbed, buildItemEmbed, buildKibbleEmbed,
  buildEngramEmbed, buildProgressionEmbed, buildGatherEmbed,
} = require('../utils/embedBuilder');

const autocompleteSources = {
  dino: 'dinos',
  kibble: 'dinos',
  resource: 'resources',
  item: 'items',
  gather: 'resources',
};

async function autocomplete(interaction, data) {
  const sub = interaction.options.getSubcommand();
  const source = autocompleteSources[sub];
  if (!source) return interaction.respond([]);

  const focused = interaction.options.getFocused().toLowerCase();
  const choices = Object.keys(data[source]);
  const filtered = choices.filter(c => c.toLowerCase().includes(focused));
  await interaction.respond(filtered.map(c => ({ name: c, value: c })).slice(0, 25));
}

async function execute(interaction, data) {
  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case 'dino': {
      const name = interaction.options.getString('name');
      const dino = data.dinos[name];
      if (!dino) return interaction.reply({ content: `Dino "${name}" not found!`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [buildDinoEmbed(dino)] });
    }
    case 'resource': {
      const name = interaction.options.getString('name');
      const resource = data.resources[name];
      if (!resource) return interaction.reply({ content: `Resource "${name}" not found!`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [buildResourceEmbed(resource)] });
    }
    case 'item': {
      const name = interaction.options.getString('name');
      const item = data.items[name];
      if (!item) return interaction.reply({ content: `Item "${name}" not found!`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [buildItemEmbed(item)] });
    }
    case 'kibble': {
      const name = interaction.options.getString('dino');
      const dino = data.dinos[name];
      if (!dino) return interaction.reply({ content: `Dino "${name}" not found!`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [buildKibbleEmbed(dino)] });
    }
    case 'gather': {
      const name = interaction.options.getString('resource');
      const resource = data.resources[name];
      if (!resource) return interaction.reply({ content: `Resource "${name}" not found!`, flags: MessageFlags.Ephemeral });
      const dinoNames = [];
      const toolNames = [];
      for (const entry of resource.bestGatheringTools) {
        if (data.dinos[entry]) {
          dinoNames.push(entry);
        } else {
          toolNames.push(entry);
        }
      }
      return interaction.reply({ embeds: [buildGatherEmbed(resource, dinoNames, toolNames)] });
    }
    case 'engram': {
      const level = interaction.options.getInteger('level');
      const engrams = data.engrams[level.toString()];
      if (!engrams?.length) return interaction.reply({ content: `No engrams for level ${level}.`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [buildEngramEmbed(level, engrams)] });
    }
    case 'next': {
      const level = interaction.options.getInteger('level');
      const prog = data.progression[level.toString()];
      if (!prog) return interaction.reply({ content: `No progression data for level ${level}.`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [buildProgressionEmbed(level, prog)] });
    }
  }
}

module.exports = { autocomplete, execute };
