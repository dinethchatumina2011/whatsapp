// handlers/antiDeleteHandler.js
const { getUserEnv } = require('../mongodbSettings');
const moment = require('moment-timezone');

const messageCache = new Map();

function getSriLankaTimestamp() {
    return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

async function setupAntiDeleteHandler(socket, number, OWNER_NUMBER, BOT_FOOTER) {
    // Capture messages
    socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            try {
                if (msg.key && msg.key.id && msg.message && !msg.key.fromMe) {
                    const messageId = msg.key.id;
                    const remoteJid = msg.key.remoteJid;
                    const participant = msg.key.participant;
                    const sender = participant || remoteJid;
                    const senderNumber = sender.split('@')[0];
                    
                    let content = '';
                    if (msg.message.conversation) {
                        content = msg.message.conversation;
                    } else if (msg.message.extendedTextMessage?.text) {
                        content = msg.message.extendedTextMessage.text;
                    } else if (msg.message.imageMessage?.caption) {
                        content = `📷 Image: ${msg.message.imageMessage.caption || 'No caption'}`;
                    } else if (msg.message.imageMessage) {
                        content = `📷 Image`;
                    } else if (msg.message.videoMessage?.caption) {
                        content = `🎥 Video: ${msg.message.videoMessage.caption || 'No caption'}`;
                    } else if (msg.message.videoMessage) {
                        content = `🎥 Video`;
                    } else if (msg.message.audioMessage) {
                        content = `🎵 Voice message`;
                    } else if (msg.message.documentMessage) {
                        content = `📄 Document: ${msg.message.documentMessage.fileName || 'File'}`;
                    } else if (msg.message.stickerMessage) {
                        content = `🎨 Sticker`;
                    } else {
                        content = `📨 ${Object.keys(msg.message)[0] || 'Message'}`;
                    }
                    
                    messageCache.set(messageId, {
                        id: messageId,
                        sender: sender,
                        senderNumber: senderNumber,
                        remoteJid: remoteJid,
                        content: content,
                        timestamp: Date.now()
                    });
                    setTimeout(() => messageCache.delete(messageId), 10 * 60 * 1000);
                }
            } catch (err) {}
        }
    });
    
    // Handle deletion
    socket.ev.on('messages.delete', async (event) => {
        try {
            const { keys } = event;
            if (!keys || keys.length === 0) return;
            
            const antiDelete = await getUserEnv('ANTI_DELETE', number);
            if (antiDelete !== 'on') return;
            
            for (const key of keys) {
                const cachedMsg = messageCache.get(key.id);
                if (cachedMsg) {
                    const deletionTime = getSriLankaTimestamp();
                    const chatType = key.remoteJid.includes('g.us') ? 'Group' : 'Private';
                    const notification = `╭──◯\n│ *📩 MESSAGE DELETED*\n│ *From:* +${cachedMsg.senderNumber}\n│ *Time:* ${deletionTime}\n│ *Chat:* ${chatType}\n│ *Content:* ${cachedMsg.content}\n╰──◯\n\n${BOT_FOOTER}`;
                    
                    try {
                        await socket.sendMessage(key.remoteJid, { text: notification });
                        console.log(`📝 Sent deletion notification to ${key.remoteJid}`);
                    } catch (sendErr) {
                        await socket.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, {
                            text: `🗑️ *Message Deleted*\nFrom: +${cachedMsg.senderNumber}\nChat: ${key.remoteJid}\nTime: ${deletionTime}\nContent: ${cachedMsg.content}`
                        });
                    }
                    messageCache.delete(key.id);
                }
            }
        } catch (error) {}
    });
}

module.exports = { setupAntiDeleteHandler };
