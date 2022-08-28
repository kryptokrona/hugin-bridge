import DiscordJS, {Intents} from 'discord.js'
import {config} from "./config.js";
import dotenv from "dotenv";
import he from "he";
import {sendHuginMessage} from "./hugin.js";
import wait from  'node:timers/promises'

dotenv.config()

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]

})

export const startDiscord = () => {

    client.on('ready', () => {

        //SERVER ID, TODO MOVE THIS ID TO CONFIG
        const guildId = '788875613753835530'
        const guild = client.guilds.cache.get(guildId)

        let commands

        if (guild) {
            commands = guild.commands
        } else {
            commands = client.application?.commands
        }

        //Creates the slash command
        commands?.create({
            name: 'respond',
            description: "Respond to board",
            options: [{
                name: 'board',
                description: "Select board to reply to",
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
                {
                    name: 'message',
                    description: "Enter message",
                    required: true,
                    type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
                }
            ]
        })

        console.log('The bot is ready 🥳')
    })

    client.login(process.env.DISCORD_BOT_TOKEN)
        .then(() => {
            console.log('Logged into Discord')
        })

    client.on('messageCreate', data => {
        if (data.channelId === config.DISCORD_CHANNEL_ID && data.author.id !== config.DISCORD_BOT_ID) {
            sendHuginMessage(data.author.username, (data.content), "Discord")
        }
    })
}

//Listen for slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }


    const {commandName, options} = interaction

    if (commandName === 'respond') {
        console.log('🚨 /respond command received')
        const nickname = interaction.member.nickname
        const board = options.getString('board')
        const message = options.getString('message')

        await interaction.deferReply();

        sendHuginMessage(nickname, message, board)
            .then(await interaction.editReply(`**${board} | ${nickname}:** ${message}`))
    }
})

//Sends message to set CHANNEL_ID
export const sendDiscordMessage = (nickname, message, board) => {
    message = he.decode(message)
    let channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID)
    if (nickname == null) nickname = config.DEFAULT_NICKNAME
    channel.send(`**${board} | ${nickname}:** ${message}`)
    console.log(`Sent Discord message`)
    console.log(`${board} | ${nickname}: ${message}`)
}
