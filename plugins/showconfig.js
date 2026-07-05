module.exports = {
    name: 'showconfig',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        const senderNumber = sender.split('@')[0];
        
        // Owner only
        if (senderNumber !== OWNER_NUMBER && !isOwner) {
            await sendMessageWithRetry(socket, sender, {
                text: '❌ Access Denied! Only owner can view config.',
                quoted: msg
            });
            return;
        }
        
        const uptime = runtime(process.uptime());
        const totalMem = Math.floor(os.totalmem() / 1024 / 1024);
        const freeMem = Math.floor(os.freemem() / 1024 / 1024);
        
        const message = `╭━━━〔 📋 *BOT CONFIG* 〕━━━⬣
┃
┃ 🤖 *BOT INFO*
┃ ├ Name: ${config.BOT_NAME}
┃ ├ Version: ${config.BOT_VERSION}
┃ ├ Owner: ${config.OWNER_NAME}
┃ ├ Bot Number: ${currentBotNumber || 'N/A'}
┃ └ Prefix: ${config.PREFIX}
┃
┃ ⚙️ *SETTINGS*
┃ ├ Auto View Status: ${config.AUTO_VIEW_STATUS === 'true' ? '✅' : '❌'}
┃ ├ Auto Like Status: ${config.AUTO_LIKE_STATUS === 'true' ? '✅' : '❌'}
┃ ├ Anti Call: ✅
┃ └ Anti Delete: ✅
┃
┃ 💻 *SYSTEM*
┃ ├ Uptime: ${uptime}
┃ ├ RAM: ${freeMem}/${totalMem}MB
┃ └ CPU: ${os.cpus().length} Cores
┃
┃ 🔗 *LINKS*
┃ ├ Channel: ${config.CHANNEL_LINK}
┃ └ Group: ${config.GROUP_INVITE_LINK}
┃
┣━━━━━━━━━━━━━━━━━⬣
┃ *© ${config.BOT_NAME}*
╰━━━━━━━━━━━━━━━━━⬣`;

        await sendMessageWithRetry(socket, sender, {
            text: message,
            quoted: msg
        });
    }
};
