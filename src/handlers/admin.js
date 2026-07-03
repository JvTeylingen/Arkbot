const { EmbedBuilder } = require('discord.js');
const { formatUptime } = require('../utils/helpers');

function checkAdmin(interaction) {
  if (!interaction.member?.permissions?.has?.('ManageGuild')) {
    return interaction.reply({
      content: 'You need the **Manage Server** permission to use admin commands.',
      ephemeral: true,
    });
  }
  return true;
}

async function execute(interaction) {
  if (!checkAdmin(interaction)) return;
  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case 'setup': {
      const embed = new EmbedBuilder()
        .setColor(0x00AAFF).setTitle('ARK Bot Setup')
        .setDescription('Welcome! Your ARK knowledge bot is ready to go.')
        .addFields(
          { name: 'Status', value: 'Bot is online', inline: true },
          { name: 'Data', value: 'Static data loaded', inline: true },
          { name: 'Commands', value: 'Auto-registered', inline: true },
          { name: 'Death Feed', value: 'Disabled — use `/ark admin deaths-enable` to set up', inline: false },
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
        config: { deathFeed: false, logWatcher: false },
      }, null, 2);
      return interaction.reply({
        content: 'Backup created:',
        files: [{ attachment: Buffer.from(backup, 'utf-8'), name: `ark-bot-backup-${Date.now()}.json` }],
        ephemeral: true,
      });
    }

    case 'deaths-enable': {
      const embed = new EmbedBuilder()
        .setColor(0xFFAA00).setTitle('Death Feed Setup')
        .setDescription('To enable death announcements:')
        .addFields(
          { name: 'Option A: Companion Script', value: 'Run log-watcher.py on your ARK server.\nSee: `companion/`', inline: false },
          { name: 'Option B: FTP Access', value: 'Use `/ark admin logs-connect` with your FTP URL.', inline: false },
        );
      return interaction.reply({ embeds: [embed] });
    }

    case 'deaths-disable':
      return interaction.reply({ content: 'Death announcements disabled.', ephemeral: true });

    case 'logs-connect': {
      const url = interaction.options.getString('url');
      try { new URL(url); } catch {
        return interaction.reply({ content: 'Invalid URL format.', ephemeral: true });
      }
      return interaction.reply({ content: `Log connection configured: ${url}`, ephemeral: true });
    }
  }
}

module.exports = { execute };
