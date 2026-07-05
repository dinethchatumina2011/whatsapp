// handlers/statusHandler.js
const { delay } = require('@whiskeysockets/baileys');

async function setupStatusHandlers(socket) {
    console.log('✅ Status handlers ready');
    
    const processedStatuses = new Set();
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        // Check if it's a status message
        if (msg.key?.remoteJid !== 'status@broadcast') return;
        
        const statusId = msg.key.id;
        
        // Avoid duplicate processing
        if (processedStatuses.has(statusId)) return;
        processedStatuses.add(statusId);
        setTimeout(() => processedStatuses.delete(statusId), 60000);
        
        try {
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderNumber = senderJid?.split('@')[0] || 'unknown';
            
            // Get user settings from MongoDB
            const { getUserEnv } = require('../mongodbSettings');
            
            let autoViewStatus = true;
            let autoLikeStatus = true;
            let autoLikeEmojis = ['❤️', '💜', '💙', '💚', '💛'];
            
            try {
                const settings = await getUserEnv(null, senderNumber);
                if (settings) {
                    autoViewStatus = settings.AUTO_VIEW_STATUS !== 'false';
                    autoLikeStatus = settings.AUTO_LIKE_STATUS !== 'off';
                    if (settings.AUTO_LIKE_EMOJI && Array.isArray(settings.AUTO_LIKE_EMOJI)) {
                        autoLikeEmojis = settings.AUTO_LIKE_EMOJI;
                    }
                }
            } catch (error) {
                // Use defaults
            }
            
            // ========== VIEW STATUS ==========
            if (autoViewStatus) {
                try {
                    await socket.readMessages([{ 
                        id: statusId, 
                        remoteJid: 'status@broadcast', 
                        participant: senderJid 
                    }]);
                } catch (error) {
                    // Silent fail
                }
            }
            
            await delay(1000);
            
            // ========== REACT TO STATUS ==========
            if (autoLikeStatus && autoLikeEmojis.length > 0) {
                const randomEmoji = autoLikeEmojis[Math.floor(Math.random() * autoLikeEmojis.length)];
                try {
                    await socket.sendMessage('status@broadcast', {
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

module.exports = { setupStatusHandlers };
