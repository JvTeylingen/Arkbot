const { EmbedBuilder, MessageFlags } = require('discord.js');
const { formatUptime } = require('../utils/helpers');
const configManager = require('../utils/configManager');
const { buildConfigEmbed } = require('../utils/embedBuilder');

function checkAdmin(interaction) {
  const perms = interaction.memberPermissions;
  if (!perms?.has?.('ManageGuild') && !perms?.has?.('Administrator')) {
    interaction.reply({
      content: 'You need the **Manage Server** permission to use admin commands.',
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return true;
}

async function execute(interaction, data) {
  if (!checkAdmin(interaction)) return;
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  switch (sub) {
    case 'config-show': {
      const items = configManager.getAll(guildId, data.calculators);
      return interaction.reply({ embeds: [buildConfigEmbed(items)] });
    }
    case 'config-set': {
      const key = interaction.options.getString('key');
      const value = interaction.options.getString('value');
      try {
        const result = configManager.set(guildId, key, value);
        return interaction.reply({ content: `**${result.label}** set to **${result.value}**`, flags: MessageFlags.Ephemeral });
      } catch (err) {
        return interaction.reply({ content: err.message, flags: MessageFlags.Ephemeral });
      }
    }

    case 'setup': {
      const deathFeed = configManager.getFeature(guildId, 'deathFeed');
      const status = deathFeed ? 'Enabled' : 'Disabled';
      const embed = new EmbedBuilder()
        .setColor(0x00AAFF).setTitle('ARK Bot Setup')
        .setDescription('Welcome! Your ARK knowledge bot is ready to go.')
        .addFields(
          { name: 'Status', value: 'Bot is online', inline: true },
          { name: 'Data', value: 'Static data loaded', inline: true },
          { name: 'Commands', value: 'Auto-registered', inline: true },
          { name: 'Death Feed', value: `${status} — use \`/ark admin deaths-enable\` to set up`, inline: false },
          { name: 'Next Steps', value: '1. Try `/ark dino`\n2. Try `/ark next 1`\n3. Enable death feed', inline: false },
        ).setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    case 'status': {
      const embed = new EmbedBuilder()
        .setColor(0x00FF00).setTitle('Bot Status')
        .addFields(
          { name: 'Uptime', value: formatUptime(process.uptime()), inline: true },
          { name: 'Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true },
          { name: 'Ping', value: `${interaction.client.ws.ping} ms`, inline: true },
        ).setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    case 'backup': {
      const backup = JSON.stringify({
        timestamp: new Date().toISOString(),
        guildId,
        config: configManager.getAllOverrides(guildId),
      }, null, 2);
      return interaction.reply({
        content: 'Backup created:',
        files: [{ attachment: Buffer.from(backup, 'utf-8'), name: `ark-bot-backup-${guildId}-${Date.now()}.json` }],
        flags: MessageFlags.Ephemeral,
      });
    }

    case 'deaths-enable': {
      configManager.setFeature(guildId, 'deathFeed', true);
      const embed = new EmbedBuilder()
        .setColor(0xFFAA00).setTitle('Death Feed Enabled')
        .setDescription('Death announcements are now active for this server.')
        .addFields(
          { name: 'Option A: Companion Script', value: 'Run log-watcher.py on your ARK server.\nSee: `companion/`', inline: false },
          { name: 'Option B: FTP Access', value: 'Use `/ark admin logs-connect` with your FTP URL.', inline: false },
        );
      return interaction.reply({ embeds: [embed] });
    }

    case 'deaths-disable': {
      configManager.setFeature(guildId, 'deathFeed', false);
      return interaction.reply({ content: 'Death announcements disabled for this server.', flags: MessageFlags.Ephemeral });
    }

    case 'logs-connect': {
      const url = interaction.options.getString('url');
      try { new URL(url); } catch {
        return interaction.reply({ content: 'Invalid URL format.', flags: MessageFlags.Ephemeral });
      }
      configManager.setFeature(guildId, 'logWatcherUrl', url);
      return interaction.reply({ content: `Log connection configured for this server: ${url}`, flags: MessageFlags.Ephemeral });
    }
  }
}

module.exports = { execute };
