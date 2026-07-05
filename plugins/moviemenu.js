module.exports = {
    name: 'moviemenu',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        const startTime = socket.creationTime || Date.now();
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const prefix = config?.PREFIX || '.';
        
        await sendMessageWithRetry(socket, sender, { 
            react: { text: "🎬", key: msg.key } 
        });

        const text = `╭━〔🎬 MOVIE CMDS 〕
┃
┃
┃ 🔹 Get Movies From Cinesubz
┃    ➜ ${prefix}cinesubz <movie name> 
┃
┃ 🔹 Get Movies From Sinhalasub
┃    ➜ ${prefix}sinhalasub <movie name>
┃
┃ 💡 *Tip*: Use these commands in any chat.
╰━━━━━━━━━━━━━━━━━━━━━⬣

_${config?.BOT_FOOTER || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʜᴀᴛʜᴜᴡᴀ '}_`;

        await sendMessageWithRetry(socket, sender, {
            image: { url: "https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg" },
            caption: text,
            contextInfo: {
                mentionedJid: ['94741336839@s.whatsapp.net'],
                forwardingScore: 999,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363424546838736@newsletter',
                    newsletterName: "ᴄʜᴀᴛʜᴜᴡᴀ-xᴍᴅ",
                    serverMessageId: 999
                },
            },
            quoted: msg
        });
    }
};
