import DiscordJS, {Intents} from 'discord.js'
import dotenv from 'dotenv'
import {WebSocket} from "ws";

dotenv.config()

//Config

//Where to connect
const URL = 'wss://cache.hugin.chat'

//Discord Channel ID
const CHANNEL_ID = '1005512632855445654'

//Default nickname (if no nickname)
const DEFAULT_NICKNAME = 'Anon'

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
    let { message, nickname, board } = json

    //Send message if public
    if(message !== undefined && board === 'Home') {
        nickname = null ? DEFAULT_NICKNAME : nickname
        sendMessage(nickname, message)
    }
});

//Sends message to set CHANNEL_ID
const sendMessage = (nickname, message) => {
    let channel = client.channels.cache.get(CHANNEL_ID)
    channel.send(`${nickname}: ${message}`)
}

client.login(process.env.TOKEN)