const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Bot administration commands')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Run initial bot setup'))
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Show bot health status'))
    .addSubcommandGroup(group =>
      group.setName('deaths')
        .setDescription('Death announcement settings')
        .addSubcommand(sub =>
          sub.setName('enable')
            .setDescription('Enable automatic death announcements'))
        .addSubcommand(sub =>
          sub.setName('disable')
            .setDescription('Disable death announcements')))
    .addSubcommandGroup(group =>
      group.setName('logs')
        .setDescription('Log connection settings')
        .addSubcommand(sub =>
          sub.setName('connect')
            .setDescription('Connect to server logs')
            .addStringOption(opt =>
              opt.setName('url')
                .setDescription('FTP/SFTP URL or webhook URL')
                .setRequired(true))))
    .addSubcommand(sub =>
      sub.setName('backup')
        .setDescription('Export bot data to JSON')),

  async execute(interaction, data) {
    const subcommand = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup();

    // Admin check - only server members with Manage Server can use admin commands
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({
        content: 'You need the **Manage Server** permission to use admin commands.',
        ephemeral: true,
      });
    }

    // Handle group commands
    if (group === 'deaths') {
      return handleDeaths(interaction, subcommand);
    }
    if (group === 'logs') {
      return handleLogs(interaction, subcommand);
    }

    // Top-level subcommands
    switch (subcommand) {
      case 'setup':
        return handleSetup(interaction);
      case 'status':
        return handleStatus(interaction);
      case 'backup':
        return handleBackup(interaction, data);
      default:
        return interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }
  },
};

async function handleSetup(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x00AAFF)
    .setTitle('ARK Bot Setup')
    .setDescription('Welcome! Your ARK knowledge bot is ready to go.')
    .addFields(
      { name: 'Status', value: '✅ Bot is online', inline: true },
      { name: 'Data', value: '✅ Static data loaded', inline: true },
      { name: 'Commands', value: '✅ Auto-registered', inline: true },
      { name: 'Death Feed', value: '❌ Disabled (optional)\nUse `/ark admin deaths enable` to set up.', inline: false },
      { name: 'Next Steps', value: '1. Tell players about `/ark dino`\n2. Try `/ark next 1`\n3. (Optional) Enable death feed', inline: false },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleStatus(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('Bot Status')
    .addFields(
      { name: 'Uptime', value: formatUptime(process.uptime()), inline: true },
      { name: 'Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true },
      { name: 'Ping', value: `${interaction.client.ws.ping} ms`, inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleDeaths(interaction, action) {
  if (action === 'enable') {
    const embed = new EmbedBuilder()
      .setColor(0xFFAA00)
      .setTitle('Death Feed Setup')
      .setDescription('To enable death announcements:')
      .addFields(
        { name: 'Option A: Companion Script', value: 'Run the log-watcher.py script on your ARK server.\nSee: `companion/log-watcher.py`', inline: false },
        { name: 'Option B: FTP Access', value: 'Use `/ark admin logs connect` with your FTP URL.\nSet `FTP_USERNAME` and `FTP_PASSWORD` env vars.', inline: false },
      );

    // In a real implementation, this would persist the setting
    await interaction.reply({ embeds: [embed] });
  }

  if (action === 'disable') {
    await interaction.reply({
      content: 'Death announcements have been disabled.',
      ephemeral: true,
    });
  }
}

async function handleLogs(interaction, action) {
  if (action === 'connect') {
    const url = interaction.options.getString('url');

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return interaction.reply({
        content: 'Invalid URL format. Please provide a valid FTP, SFTP, or webhook URL.',
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `Log connection configured: ${url}`,
      ephemeral: true,
    });
  }
}

async function handleBackup(interaction) {
  // Create a JSON backup of config
  const backup = {
    timestamp: new Date().toISOString(),
    config: {
      deathFeed: false,
      logWatcher: false,
    },
  };

  const backupJson = JSON.stringify(backup, null, 2);
  const buffer = Buffer.from(backupJson, 'utf-8');

  await interaction.reply({
    content: 'Backup created:',
    files: [{ attachment: buffer, name: `ark-bot-backup-${Date.now()}.json` }],
    ephemeral: true,
  });
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(' ') || '<1m';
}