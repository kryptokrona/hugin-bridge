import SockJS from "sockjs-client";
import Stomp from "stompjs";

import {sendDiscordMessage} from "./discord.js";
import {config} from "./config.js";
import {sendTelegramMessage} from "./telegram.js";

export const startWebsocket = () => {
    var socket = new SockJS(config.WEBSOCKET_URL);
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log(`Connected to ${config.WEBSOCKET_URL} 🤖`)
        
        stompClient.subscribe('/topic/posts', function (post) {
            try {
                let json = JSON.parse(post.body)
                let {message, nickname, board, key} = json
    
                if(config.BOT_ADDRESS !== key) {
                    sendDiscordMessage(nickname, message, board)
                    //sendTelegramMessage(nickname, message)
                }
            } catch (err) {
                console.log(err)
            }
        });
    });

    socket.onclose = () => {
        console.log('Connection closed')
    }
}