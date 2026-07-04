const { SlashCommandBuilder } = require('discord.js');

const core = require('../handlers/core');
const suggest = require('../handlers/suggest');
const calc = require('../handlers/calc');
const admin = require('../handlers/admin');

const handlers = {
  core: { autocomplete: core.autocomplete, execute: core.execute },
  suggest: { execute: suggest.execute },
  calc: { autocomplete: calc.autocomplete, execute: calc.execute },
  admin: { execute: admin.execute },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ark')
    .setDescription('ARK: Survival Evolved knowledge commands')
    .addSubcommand(sub =>
      sub.setName('help').setDescription('Show all available commands'))
    .addSubcommand(sub =>
      sub.setName('dino').setDescription('Look up a dinosaur or creature')
        .addStringOption(opt => opt.setName('name').setDescription('Dino name').setAutocomplete(true).setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('resource').setDescription('Look up a resource')
        .addStringOption(opt => opt.setName('name').setDescription('Resource name').setAutocomplete(true).setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('item').setDescription('Look up an item')
        .addStringOption(opt => opt.setName('name').setDescription('Item name').setAutocomplete(true).setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('kibble').setDescription('Get kibble information for a dino')
        .addStringOption(opt => opt.setName('dino').setDescription('Dino name').setAutocomplete(true).setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('engram').setDescription('List all engrams unlocked at a level')
        .addIntegerOption(opt => opt.setName('level').setDescription('Player level (1-100)').setMinValue(1).setMaxValue(100).setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('next').setDescription('Get progression suggestions for a level')
        .addIntegerOption(opt => opt.setName('level').setDescription('Your current level').setMinValue(1).setMaxValue(100).setRequired(true)))
    .addSubcommandGroup(group =>
      group.setName('suggest').setDescription('Get suggestions for your level')
        .addSubcommand(sub => sub.setName('tame').setDescription('Recommended dinos to tame')
          .addIntegerOption(opt => opt.setName('level').setDescription('Your level').setMinValue(1).setMaxValue(100).setRequired(true)))
        .addSubcommand(sub => sub.setName('home').setDescription('Recommended biome')
          .addIntegerOption(opt => opt.setName('level').setDescription('Your level').setMinValue(1).setMaxValue(100).setRequired(true))))
    .addSubcommandGroup(group =>
      group.setName('calc').setDescription('ARK calculations')
        .addSubcommand(sub => sub.setName('breed').setDescription('Calculate breeding timers')
          .addStringOption(opt => opt.setName('dino').setDescription('Dino name').setAutocomplete(true).setRequired(true)))
        .addSubcommand(sub => sub.setName('craft').setDescription('Calculate crafting requirements')
          .addStringOption(opt => opt.setName('item').setDescription('Item name').setAutocomplete(true).setRequired(true)))
        .addSubcommand(sub => sub.setName('raw').setDescription('Calculate full raw material cost')
          .addStringOption(opt => opt.setName('item').setDescription('Item name').setAutocomplete(true).setRequired(true))))
    .addSubcommandGroup(group =>
      group.setName('admin').setDescription('Bot administration')
        .addSubcommand(sub => sub.setName('setup').setDescription('Run initial bot setup'))
        .addSubcommand(sub => sub.setName('status').setDescription('Show bot health status'))
        .addSubcommand(sub => sub.setName('backup').setDescription('Export bot data to JSON'))
        .addSubcommand(sub => sub.setName('deaths-enable').setDescription('Enable automatic death announcements'))
        .addSubcommand(sub => sub.setName('deaths-disable').setDescription('Disable death announcements'))
        .addSubcommand(sub => sub.setName('logs-connect').setDescription('Connect to server logs')
          .addStringOption(opt => opt.setName('url').setDescription('FTP/SFTP URL or webhook URL').setRequired(true)))),

  async autocomplete(interaction, data) {
    const group = interaction.options.getSubcommandGroup() || 'core';
    const handler = handlers[group];
    if (handler?.autocomplete) return handler.autocomplete(interaction, data);
    return interaction.respond([]);
  },

  async execute(interaction, data) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'help') {
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('ARK Bot Commands')
        .setDescription('All commands are grouped under `/ark`.')
        .addFields(
          {
            name: 'Core Lookups',
            value:
              '`/ark dino <name>` — Dino stats, taming, drops, spawn locations\n' +
              '`/ark resource <name>` — Resource spawns, gathering tools, uses\n' +
              '`/ark item <name>` — Item crafting recipes and unlock levels\n' +
              '`/ark kibble <dino>` — Preferred kibble and effectiveness bonus\n' +
              '`/ark engram <level>` — Engrams unlocked at a given level\n' +
              '`/ark next <level>` — Progression objectives and suggestions',
          },
          {
            name: 'Calculations',
            value:
              '`/ark calc breed <dino>` — Incubation, maturation, imprint timings\n' +
              '`/ark calc craft <item>` — Crafting ingredients and station\n' +
              '`/ark calc raw <item>` — Raw material cost breakdown',
          },
          {
            name: 'Suggestions',
            value:
              '`/ark suggest tame <level>` — Recommended dinos to tame\n' +
              '`/ark suggest home <level>` — Recommended base locations',
          },
          {
            name: 'Admin (ManageGuild)',
            value:
              '`/ark admin setup` — Initialize bot configuration\n' +
              '`/ark admin status` — Bot health and uptime\n' +
              '`/ark admin backup` — Export data backup\n' +
              '`/ark admin deaths-enable` — Enable death feed\n' +
              '`/ark admin deaths-disable` — Disable death feed\n' +
              '`/ark admin logs-connect` — Connect ARK server log watcher',
          },
        )
        .setTimestamp()
        .setFooter({ text: 'ARK: Survival Evolved' });

      return interaction.reply({ embeds: [embed] });
    }

    const group = interaction.options.getSubcommandGroup() || 'core';
    const handler = handlers[group];
    if (handler) return handler.execute(interaction, data);
    return interaction.reply({ content: 'Unknown command.', ephemeral: true });
  },
};
