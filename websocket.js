import {WebSocket} from "ws";
import {sendDiscordMessage} from "./discord.js";
import {config} from "./config.js";
import {sendTelegramMessage} from "./telegram.js";

const socket = new WebSocket(config.WEBSOCKET_URL);

export const startWebsocket = () => {

    // Open connection wit Cache
    socket.addEventListener('open', function (event) {
        console.log(`Connected to ${config.WEBSOCKET_URL} 🤖`)

        //Ping cache to keep Websocket alive
        setInterval(() => {
            socket.send(JSON.stringify("ping"))
            console.log('ping')
        }, 30000)
    });

    socket.addEventListener('close', () => {
        console.log('Connection closed')
    })

// Listen for messages
    socket.addEventListener('message', function (event) {
        let data = event.data

        try {

            let json = JSON.parse(data)
            let {message, nickname, board} = json

            sendDiscordMessage(nickname, message, board)
            //sendTelegramMessage(nickname, message)

        } catch (err) {
            console.log(err)
        }

    });
}