// handlers/messageHandler.js
const { delay } = require('@whiskeysockets/baileys');

async function setupMessageHandlers(socket) {
    console.log('✅ Message handlers ready');
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        // Skip status and newsletter messages
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        
        try {
            // Auto-react to messages (if enabled)
            const { getUserEnv } = require('../mongodbSettings');
            
            const senderJid = msg.key.remoteJid;
            const senderNumber = senderJid?.split('@')[0];
            
            let autoReact = false;
            let autoReactEmojis = ['❤️', '👍', '🔥'];
            
            try {
                const settings = await getUserEnv(null, senderNumber);
                autoReact = settings?.AUTO_REACT === 'on';
                if (settings?.AUTO_LIKE_EMOJI && Array.isArray(settings.AUTO_LIKE_EMOJI)) {
                    autoReactEmojis = settings.AUTO_LIKE_EMOJI;
                }
            } catch (error) {
                autoReact = false;
            }
            
            if (autoReact && !msg.key.fromMe) {
                const randomEmoji = autoReactEmojis[Math.floor(Math.random() * autoReactEmojis.length)];
                try {
                    await socket.sendMessage(senderJid, {
                        react: { text: randomEmoji, key: msg.key }
                    });
                } catch (error) {
                    // Silent fail
                }
            }
            
        } catch (error) {
            // Silent fail
        }
    });
}

module.exports = { setupMessageHandlers };
