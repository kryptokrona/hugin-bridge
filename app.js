import {startWebsocket} from "./websocket.js";
import {startDiscord} from "./discord.js";
import {startHugin} from "./hugin.js";
import {startTelegram} from "./telegram.js";
import {getLatestEncryptedMessage} from "./getEncryptedMessages.js"


startWebsocket()
startHugin()
startTelegram()
startDiscord()
getLatestEncryptedMessage()

