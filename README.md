# Hugin Bridge

<p>
<a href="https://chat.kryptokrona.se">
    <img src="https://img.shields.io/discord/562673808582901793?label=Discord&logo=Discord&logoColor=white&style=flat">
</a>
<a href="https://github.com/kryptokrona/hugin-bridge/issues">
    <img src="https://img.shields.io/github/issues/kryptokrona/hugin-bridge">
</a>
<a href="https://github.com/kryptokrona/hugin-bridge/pulls">
    <img src="https://img.shields.io/github/issues-pr/kryptokrona/hugin-bridge">
</a>
<a href="https://github.com/kryptokrona/hugin-bridge/commits/main">
    <img src="https://img.shields.io/github/commit-activity/m/kryptokrona/hugin-bridge">
</a>
<a href="https://github.com/kryptokrona/hugin-bridge/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/kryptokrona/hugin-bridge">
</a>
<a href="https://twitter.com/kryptokrona">
    <img src="https://img.shields.io/twitter/follow/kryptokrona">
</a>
</p>

A bridge that relays messages between [Hugin Messenger](https://github.com/kryptokrona/hugin) encrypted groups, Discord and Telegram, so a conversation started on one platform shows up on the others.

## Requirements

- Node.js 16+ and npm
- A synced [Kryptokrona](https://github.com/kryptokrona/kryptokrona) daemon (`kryptokrona-nodegui` or `kryptokrond`), reachable at the `NODE`/`PORT` configured in `config.js`
- A Discord bot token, with the bot invited to your server
- A Telegram bot token, with the bot added to your group

## Configuration

1. Copy `.env-example` to `.env` and fill in your tokens:

   ```
   DISCORD_BOT_TOKEN=your-discord-bot-token
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ```

2. Edit `config.js` with the IDs for your own setup:

   | Key | Description |
   | --- | --- |
   | `WEBSOCKET_URL` | Hugin cache websocket to listen on for incoming messages |
   | `NODE` / `PORT` | Address of the Kryptokrona daemon used by the bridge wallet |
   | `DISCORD_CHANNEL_ID` | Discord channel that mirrors the Hugin board |
   | `DISCORD_BOT_ID` | Your Discord bot's application ID |
   | `DEFAULT_NICKNAME` | Nickname used when a sender has none set |
   | `BOT_ADDRESS` | The bridge wallet's Hugin address |
   | `TELEGRAM_GROUP_ID` | Telegram group that mirrors the Hugin board |

On first run the bridge creates a `bridge.wallet` file and prints its address to the console; fund or register that address as needed on the Hugin side.

## Running locally

```bash
npm install
npm start
```

`npm start` runs `app.js`, which connects the websocket, wallet, Telegram bot and Discord bot together. Use `npm run dev` instead to auto-restart on file changes while developing.

## Example

**Hugin → Discord/Telegram:** a message posted to a Hugin board is relayed as:

```
**general | Anon:** hello from Hugin
```

**Discord/Telegram → Hugin:** replying from Discord with the `/respond` slash command (or sending a message in the linked Telegram group) encrypts and relays the text back onto the Hugin board under the sender's nickname.

# Technologies

- Node
- Express
- kryptokrona-wallet-backend-js
- kryptokrona-crypto
- Discord.js
- Telegram API

## Donate

### Bitcoin (BTC)
bc1ql97dlhhexma7agkk7gmg76t7ljycuqc9xgr4vl


### Monero (XMR)
49AWzFTrZZvDKNzCUHPSXm5ZUyBrFan7xXXrKmfS6ircfcTAeiXBH1Yg99V4jiiEdT8RYhXvEiAgbMjEzq8AJJCbAd5ckJG


### Kryptokrona (XKR)
SEKReXXU9aJPiwjX2XkpbK8ACMWbUNXcYPxUVSiUYpNdhj8Z2snEy8CjjorZUNyswQNfzAmVWuGksU72Sf3Kq79Zd3fJWHq4Nyx


# Help and Support

For questions and support please use the channel #support in Kryptokrona Discord server. The issue tracker is for bug reports and feature discussions only.

# Contributors

The following contributors have either helped to start this project, have contributed
code, are actively maintaining it (including documentation), or in other ways
being awesome contributors to this project. **We'd like to take a moment to recognize them.**

[<img src="https://github.com/Swepool.png?size=72" alt="Swepool" width="72">](https://github.com/Swepool)
[<img src="https://avatars.githubusercontent.com/u/3246908?v=4?size=72" alt="f-r00t" width="72">](https://github.com/f-r00t)
[<img src="https://avatars.githubusercontent.com/u/33717111?v=4?size=72" alt="mjovanc" width="72">](https://github.com/mjovanc)
[<img src="https://avatars.githubusercontent.com/u/65623992?v=4?size=72" alt="TechyGuy17" width="72">](https://github.com/TechyGuy17)

# License

The license is GPL-3.0 License.
