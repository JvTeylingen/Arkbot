const { MessageFlags } = require('discord.js');
const { buildTameSuggestionEmbed, buildHomeSuggestionEmbed } = require('../utils/embedBuilder');
const { inferDinoUses } = require('../utils/helpers');

async function execute(interaction, data) {
  const sub = interaction.options.getSubcommand();
  const level = interaction.options.getInteger('level');
  const prog = data.progression[level.toString()];

  if (!prog) return interaction.reply({ content: `No suggestion data for level ${level}.`, flags: MessageFlags.Ephemeral });

  if (sub === 'tame') {
    const dinos = prog.tameSuggestions.map(n => data.dinos[n]).filter(Boolean);
    if (!dinos.length) return interaction.reply({ content: `No tame suggestions for level ${level}.`, flags: MessageFlags.Ephemeral });

    const dino = dinos[0];
    return interaction.reply({
      embeds: [buildTameSuggestionEmbed({
        name: dino.name,
        reason: `Recommended tame at level ${level}${dino.taming.preferredKibble ? ` — use ${dino.taming.preferredKibble}` : ' — feed Mejoberry'}`,
        saddleLevel: dino.saddleLevel,
        difficulty: dino.taming.method,
        uses: inferDinoUses(dino),
      })],
    });
  }

  if (sub === 'home') {
    return interaction.reply({
      embeds: [buildHomeSuggestionEmbed({
        name: `Level ${level} — Recommended Homes`,
        safety: 'Varies by biome',
        gear: ['Level-appropriate tools', 'Weapons', 'Armor'],
        resources: prog.homeSuggestions,
        threats: prog.homeSuggestions,
      })],
    });
  }
}

module.exports = { execute };
