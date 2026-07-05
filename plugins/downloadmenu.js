module.exports = {
    name: 'downloadmenu',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        const startTime = socket.creationTime || Date.now();
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const prefix = config?.PREFIX || '.';
        
        await sendMessageWithRetry(socket, sender, { 
            react: { text: "⬇️", key: msg.key } 
        });

        const text = `╭━〔⬇️ DOWNLOAD CMDS 〕
┃
┃
┃ 🔹 Download Videos From Youtube
┃    ➜ ${prefix}video <video link>
┃
┃ 🔹 Download songs from YouTube
┃    ➜ ${prefix}song <song name>
┃
┃ 💡 *Tip*: Use these commands in any chat.
╰━━━━━━━━━━━━━━━━━━━━━⬣

_${config?.BOT_FOOTER || 'POWERED BY ZEUS INC'}_`;

        await sendMessageWithRetry(socket, sender, {
            image: { url: "https://mc-error-db.pages.dev/VIHAGA%20XMD/Data/ZEUS%20X%20MD%20MINI%201%20.png" },
            caption: text,
            contextInfo: {
                mentionedJid: ['94774571418@s.whatsapp.net'],
                forwardingScore: 999,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425542933159@newsletter',
                    newsletterName: "𝒁 𝑬 𝑼 𝑺  𝑿 𝑴 𝑫  𝑩𝑶𝑻𝒁 𝑰𝑵𝑪 </> 🇱🇰",
                    serverMessageId: 999
                },
            },
            quoted: msg
        });
    }
};
