import {config} from "./config.js";
import dotenv from "dotenv";
import he from "he";
import TelegramBot from "node-telegram-bot-api";
dotenv.config()

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

export const startTelegram = async () => {
    bot.on('message', data => {
        console.log('MESSAGE FROM TELEGRAM: ', data)
    })
}

export const sendTelegramMessage = (nickname, message) => {
    if (nickname == null) nickname = config.DEFAULT_NICKNAME
    let messageToSend = he.decode(`${nickname}: ${message}`)

    bot.sendMessage(config.TELEGRAM_GROUP_ID, messageToSend).then(() => {
        console.log('Sent Telegram message')
        console.log(messageToSend)
    })
}