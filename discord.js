import DiscordJS, {Intents} from 'discord.js'
import {config} from "./config.js";
import dotenv from "dotenv";
import he from "he";
import {sendHuginMessage} from "./hugin.js";

dotenv.config()

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

export const startDiscord = () => {

    client.on('ready', () => {
        console.log('The bot is ready 🥳')
    })

    client.login(process.env.TOKEN)
        .then(() => {
            console.log('Logged into Discord')
        })

    client.on('messageCreate', data => {
        if (data.channelId === config.CHANNEL_ID && data.author.id !== config.BOT_ID) {
            sendHuginMessage(data.author.username, (data.content))
        }
    })

}

//Sends message to set CHANNEL_ID
export const sendDiscordMessage = (nickname, message) => {
    message = he.decode(message)
    let channel = client.channels.cache.get(config.CHANNEL_ID)
    if (nickname == null) nickname = config.DEFAULT_NICKNAME
    channel.send(`${nickname}: ${message}`)
    console.log(`Sent Discord message`)
    console.log(`${nickname}: ${message}`)
}

