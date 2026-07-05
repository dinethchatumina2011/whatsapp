module.exports = {
    name: 'system',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        const content = `
◦ ⚡ \`Runtime\`: *${runtime(process.uptime())}*
◦ 🧬 \`Os Name\`: *Windows 10 Pro*
◦ 💾 \`Total Ram\`: *${Math.floor(os.totalmem() / 1024 / 1024)} MB*
◦ 🪫 \`Free Ram\`: *${Math.floor(os.freemem() / 1024 / 1024)} MB*
◦ ⚙️ \`CPU Model\`: *Intel i9*
◦ 📟 \`CPU Speed\`: *6.2 GHz*
◦ 💾 \`CPU Cores\`: *24*
`;
        await sendMessageWithRetry(socket, sender, {
            image: { url: "https://mc-error-db.pages.dev/VIHAGA%20XMD/Data/ZEUS%20X%20MD%20MINI%201%20.png" },
            caption: formatMessage("`📡 ZEUS X MINI SYSTEM INFOMATION 📡`", content, config.BOT_FOOTER),
            quoted: msg
        });
    }
};
