import DiscordJS, {Intents} from 'discord.js'
import dotenv from 'dotenv'
import {WebSocket} from "ws";
import {myAddress, sendHuginMessage} from "./wb.js";
import he from 'he'

dotenv.config()

//Config
//Where to connect
const URL = 'wss://cache.hugin.chat'

//Discord Channel ID
const CHANNEL_ID = '1005512632855445654'

//The bot User ID
const BOT_ID = '1005518787484856400'

//Default nickname (if no nickname)
const DEFAULT_NICKNAME = 'Anon'

const BOT_ADDRESS = myAddress

const socket = new WebSocket(URL);
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

// Open connection wit Cache
socket.addEventListener('open', function (event) {
    console.log(`Connected to ${URL} 🤖`)

    //Ping cache to keep Websocket alive
    setInterval(() => {
        socket.send('Keep me alive')
    }, 10000)
});

client.on('ready', () => {
    console.log('The bot is ready 🥳')
})

// Listen for messages
socket.addEventListener('message', function (event) {
    let data = event.data

    //Guard against welcome message
    if (data.startsWith('Connected')) {
        return
    }

    //Parse data from WS
    let json = JSON.parse(data)
    console.log(data)
    let { message, nickname, board, key } = json

    //Send message if public
    if(board === 'Home' && message !== undefined && key !== BOT_ADDRESS) {
        sendDiscordMessage(nickname,message)
    }
});

//Sends message to set CHANNEL_ID
const sendDiscordMessage = (nickname, message) => {
    message = he.decode(message)
    let channel = client.channels.cache.get(CHANNEL_ID)
    if (nickname == null) nickname = DEFAULT_NICKNAME
    channel.send(`${nickname}: ${message}`)
    console.log(`Sent Discord message`)
    console.log(`${nickname}: ${message}`)
}

client.on('messageCreate', data => {
    if (data.channelId === CHANNEL_ID && data.author.id !== BOT_ID) {
        sendHuginMessage(data.author.username, (data.content))
    }
})

client.login(process.env.TOKEN)