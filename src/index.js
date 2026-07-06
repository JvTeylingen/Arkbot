require('dotenv').config();
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

const dataLoader = require('./utils/dataLoader');
const configManager = require('./utils/configManager');
client.data = dataLoader.loadAll();
configManager.load(client.data);

require('./keepalive');

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  registerCommands(client);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command?.autocomplete) return;
    try {
      await command.autocomplete(interaction, client.data);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client.data);
  } catch (error) {
    console.error(error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error executing that command!',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

async function registerCommands(client) {
  try {
    const commands = [];
    for (const command of client.commands.values()) {
      commands.push(command.data.toJSON());
    }

    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commands },
      );
      console.log(`Registered ${commands.length} commands for guild ${process.env.GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log(`Registered ${commands.length} global commands`);
    }
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

client.login(process.env.DISCORD_TOKEN);