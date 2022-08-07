import {WebSocket} from "ws";
import {sendDiscordMessage} from "./discord.js";
import {config} from "./config.js";

const socket = new WebSocket(config.WEBSOCKET_URL);

export const startWebsocket = () => {

    // Open connection wit Cache
    socket.addEventListener('open', function (event) {
        console.log(`Connected to ${config.WEBSOCKET_URL} 🤖`)

        //Ping cache to keep Websocket alive
        setInterval(() => {
            socket.send('Keep me alive')
        }, 10000)
    });

// Listen for messages
    socket.addEventListener('message', function (event) {
        let data = event.data

        //Guard against welcome message
        if (!data.startsWith('Connected')) {
            //Parse data from WS
            let json = JSON.parse(data)
            console.log(data)
            let { message, nickname, board, key } = json

            //Send message if public
            if(board === 'Home' && message !== undefined && key !== config.BOT_ADDRESS) {
                sendDiscordMessage(nickname,message)
            }
        }
    });
}