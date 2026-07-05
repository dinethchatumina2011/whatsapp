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
            image: { url: "https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg" },
            caption: formatMessage("`📡 CHATHUWA X MINI SYSTEM INFOMATION 📡`", content, config.BOT_FOOTER),
            quoted: msg
        });
    }
};
