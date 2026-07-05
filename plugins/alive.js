module.exports = {
    name: 'alive',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderNumber = senderJid.split('@')[0].replace(/[^0-9]/g, '');
        const specialUsers = global.specialUsers || [];
        if (!isMe && !specialUsers.includes(senderNumber)) {
            return await sendMessageWithRetry(socket, sender, {
                text: '*❌❌මේ බොට් ඔයාට වැඩ කරන්නේ නෑ.❌❌*\n*WEBSITE LINK "tmp"*\n*‼️⭕කරුණාකර ඉහත වෙබ් සයිට් එක වෙත පිවිස ඔබගේ නම්බර් එකට බොට් කෙනෙකු සාදා ගන්න.‼️⭕*\n\n\n*❌❌This bot will not work for you.❌❌*\n*WEBSITE LINK "tmp"*\n*‼️⭕Please visit the above website and create a bot for your number.‼️⭕*\n\n\n*❌❌இந்த பாட் உங்களுக்கு வேலை செய்யாது.❌❌*\n*இணையதள இணைப்பு "tmp"*\n*‼️⭕தயவுசெய்து மேலே உள்ள இணையதளத்திற்குச் சென்று உங்கள் எண்ணுக்கு ஒரு பாட்டை உருவாக்கவும்.‼️⭕*\n\n_𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗖𝗛𝗔𝗧𝗛𝗨𝗪𝗔 </>_🇱🇰'
            });
        }
        const startTime = socket.creationTime || Date.now();
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const title = `┏━❐  \`HII - THEIR I AM ALIVE NOW  \`
┃ \`THIS IS\`: *ᴄʜᴀᴛʜᴜᴡᴀ-xᴍᴅ-ᴍɪɴɪ*
┃ \`Type\`: *MULTI SESSION*
┃ \`Platform\`: *CHATHUWA PVT SERVER*
┃ \`UpTime\`: *${hours}h ${minutes}m ${seconds}s*
┗━❐`;

        const content = `*ᴄʜᴀᴛʜᴜᴡᴀ*
*◯ A B O U T*
> \`This is a lightweight WhatsApp Mini bot 🎀\`

*◯ CHATHUWA TEAM*
> ＣＨＡＴＨＵＷＡ`;

        const footer = config.BOT_FOOTER;

        await sendMessageWithRetry(socket, sender, {
            image: { url: config.BUTTON_IMAGES.MENU },
            caption: `${title}\n\n${content}\n\n${footer}`,
            buttons: [
                { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📜 MENU' }, type: 1 },
                { buttonId: `${config.PREFIX}ping`, buttonText: { displayText: '⚡ PING' }, type: 1 },
                { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: '👑 OWNER' }, type: 1 },
                { buttonId: `${config.PREFIX}system`, buttonText: { displayText: '⚙️ SYSTEM' }, type: 1 }
            ],
            quoted:msg
        });
    }
};
