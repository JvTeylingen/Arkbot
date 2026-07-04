# Arkbot

A lightweight Discord bot for **ARK: Survival Evolved** game knowledge, built with Node.js and Discord.js v14. No RCON or server plugins required — all data is served from static JSON files.

## Features

| Command | Description |
|---|---|
| `/ark dino <name>` | Dino stats, taming info, preferred kibble, drops, saddle level |
| `/ark resource <name>` | Spawn locations, best gathering tools, weight, uses |
| `/ark item <name>` | Crafting recipe, blueprint path, unlock level |
| `/ark kibble <dino>` | Preferred kibble type, recipe, taming effectiveness |
| `/ark engram <level>` | All engrams unlocked at a given player level |
| `/ark next <level>` | Progression checklist with objectives, taming targets, base priorities |
| `/ark calc breed <dino>` | Incubation, maturation, imprint intervals, mutation chances |
| `/ark calc craft <item>` | Exact material requirements, crafting station, and time |
| `/ark admin setup` | Initial bot setup wizard |
| `/ark admin status` | Bot health: uptime, memory, data load status |
| `/ark admin deaths` | Toggle automatic death announcements |
| `/ark admin logs` | Connect to ARK server logs via FTP/SFTP/webhook |
| `/ark admin backup` | Export bot configuration as a downloadable JSON |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Discord application](https://discord.com/developers/applications) with a bot token
- (Optional) FTP credentials or a webhook endpoint for the death-feed feature

## Quick Start

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env and set DISCORD_TOKEN to your bot token

# Register slash commands
npm run deploy-commands

# Start the bot
npm start
```

## Project Structure

```
├── src/
│   ├── commands/          # Slash command implementations
│   ├── utils/             # Helpers (embedBuilder, dataLoader)
│   └── index.js           # Bot entry point
├── data/                  # Static JSON data files
├── companion/             # Python log watcher script
├── scripts/               # Utility scripts (validate-data, deploy)
├── .env.example
├── package.json
└── README.md
```

## Data Layer

All game data lives in `data/` as static JSON files loaded into memory at startup:

| File | Contents |
|---|---|
| `dinos.json` | 36 base-game dinos with stats, taming, drops, spawn maps |
| `items.json` | Items with crafting recipes and unlock levels |
| `resources.json` | Resources with spawn biomes and gathering tools |
| `engrams.json` | All engrams organized by unlock level |
| `calculators.json` | Breeding and crafting formulas |
| `progression.json` | Level-by-level objectives and suggestions |

Run `npm run validate-data` to check data integrity.

## Companion Log Watcher

The `companion/` directory contains a small Python script that tails ARK server log files and forwards death events to the bot via webhook, enabling automatic death announcements without FTP.

## Deployment

| Platform | Quick Start |
|---|---|
| **Replit** | Create Node.js repl, copy files, set `DISCORD_TOKEN` in Secrets, click Run |
| **Fly.io** | `fly launch --now && fly secrets set DISCORD_TOKEN=... && fly deploy` |
| **Railway** | `railway login && railway init && railway up` — set `DISCORD_TOKEN` in dashboard |


## License

GNU General Public License v3.0
