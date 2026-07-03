const { SlashCommandBuilder } = require('discord.js');
const { buildTameSuggestionEmbed, buildHomeSuggestionEmbed } = require('../utils/embedBuilder');

function inferDinoUses(dino) {
  const uses = [];
  if (dino.temperament === 'Aggressive' || dino.temperament === 'Territorial') uses.push('Combat');
  if (dino.saddleLevel) uses.push('Riding');
  if (dino.taming.method === 'passive') uses.push('Easy Tame');
  if (dino.baseStats.weight > 400) uses.push('Hauling');
  if (dino.baseStats.stamina > 350) uses.push('Travel');
  if (dino.baseStats.meleeDamage > 50) uses.push('High Damage');
  if (dino.spawnMaps.some(m => m.toLowerCase().includes('ocean') || m.toLowerCase().includes('water'))) uses.push('Aquatic');
  return uses.length ? uses : ['General Purpose'];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Get suggestions for your level')
    .addSubcommand(sub =>
      sub.setName('tame')
        .setDescription('Recommended dinos to tame at your level')
        .addIntegerOption(opt =>
          opt.setName('level')
            .setDescription('Your level')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('home')
        .setDescription('Recommended biome for your level')
        .addIntegerOption(opt =>
          opt.setName('level')
            .setDescription('Your level')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true))),

  async execute(interaction, data) {
    const level = interaction.options.getInteger('level');
    const subcommand = interaction.options.getSubcommand();
    const prog = data.progression[level.toString()];

    if (!prog) {
      return interaction.reply({
        content: `No suggestion data available for level ${level}.`,
        ephemeral: true,
      });
    }

    if (subcommand === 'tame') {
      const dinoData = prog.tameSuggestions
        .map(name => data.dinos[name])
        .filter(Boolean);

      if (dinoData.length === 0) {
        return interaction.reply({
          content: `No tame suggestions for level ${level}.`,
          ephemeral: true,
        });
      }

      const dino = dinoData[0];
      const embed = buildTameSuggestionEmbed({
        name: dino.name,
        reason: `Recommended tame at level ${level}${dino.taming.preferredKibble ? ` — use ${dino.taming.preferredKibble}` : ' — feed Mejoberry'}`,
        saddleLevel: dino.saddleLevel,
        difficulty: dino.taming.method,
        uses: inferDinoUses(dino),
      });
      await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'home') {
      const biomes = prog.homeSuggestions;
      const embed = buildHomeSuggestionEmbed({
        name: `Level ${level} — Recommended Homes`,
        safety: 'Varies by biome',
        gear: ['Level-appropriate tools', 'Weapons', 'Armor'],
        resources: biomes,
        threats: biomes,
      });
      await interaction.reply({ embeds: [embed] });
    }
  },
};