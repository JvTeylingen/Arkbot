const path = require('path');

module.exports = {
  prefix: '/',
  features: {
    deathFeed: false,
    logWatcher: false,
  },
  rateLimits: {
    commands: 10,
    autocomplete: 20,
  },
  dataPath: path.join(__dirname, '../data'),
  discord: {
    intents: ['Guilds', 'GuildMessages'],
  },
};