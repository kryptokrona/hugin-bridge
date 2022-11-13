import {sendDiscordMessageGroup} from "./discord.js";
import {getGroupMessage} from "./hugin.js";

export async function getLatestEncryptedMessage() {
    let latestEncryptedMessage = 0;
    setInterval(async () => {
        await fetch(`https://api.hugin.chat/api/v1/posts-encrypted-group?size=1`)
        .then((response) => {
            return response.json()
        })
        .then(async (json) => {   
            // console.log(json.encrypted_group_posts[0])
            const response = await getGroupMessage(json.encrypted_group_posts[0])
            console.log(response)
            console.log("Latest: " + latestEncryptedMessage)
            console.log("New: " + json.encrypted_group_posts[0].id)
            if(json.encrypted_group_posts[0].id != latestEncryptedMessage ) {
                if(response != false){
                    sendDiscordMessageGroup(response.n, response.m, "General (encrypted)")
                }
                else {
                    return
                }
            }
            else{
                return
            }
            latestEncryptedMessage = json.encrypted_group_posts[0].id
        }) 
    }, 3000)
}