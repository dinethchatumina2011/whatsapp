// handlers/antiCallHandler.js
const { delay } = require('@whiskeysockets/baileys');

async function setupAntiCallHandler(socket, OWNER_NUMBER) {
    console.log('✅ Anti-call handler ready');
    
    // Track processed calls to avoid duplicates
    const processedCalls = new Set();
    
    socket.ev.on('call', async (calls) => {
        for (const call of calls) {
            const callId = call.id;
            const callStatus = call.status;
            
            // Avoid duplicate processing
            if (processedCalls.has(callId)) continue;
            processedCalls.add(callId);
            setTimeout(() => processedCalls.delete(callId), 5000);
            
            try {
                const callerJid = call.from;
                const callerNumber = callerJid?.split('@')[0] || 'unknown';
                
                // Get anti-call setting using the new function
                const { getAntiCallStatus } = require('../mongodbSettings');
                let antiCallEnabled = true;
                
                try {
                    const status = await getAntiCallStatus(OWNER_NUMBER);
                    antiCallEnabled = status !== 'off';
                } catch (error) {
                    antiCallEnabled = true;
                }
                
                console.log(`📞 Call: ${callStatus}, From: ${callerNumber}`);
                
                if (!antiCallEnabled) {
                    console.log(`📞 ANTI_CALL: OFF - Not rejecting`);
                    continue;
                }
                
                console.log(`📞 ANTI_CALL: ON - Rejecting call...`);
                
                // ========== REJECT CALL ==========
                try {
                    // Method 1: Direct reject
                    if (socket.rejectCall && typeof socket.rejectCall === 'function') {
                        await socket.rejectCall(callId);
                        console.log(`✅ Call rejected from ${callerNumber}`);
                    }
                    
                    // Method 2: Send rejection message
                    await socket.sendMessage(callerJid, {
                        text: `╭━━━〔 *🚫 CALL REJECTED* 〕━━━⬣
┃
┃ ✧ *Sorry, I cannot answer calls*
┃ ✧ *This is an automated bot*
┃
┣━━━━━━━━━━━━━━━━━⬣
┃ 👑 *Owner:* wa.me/${OWNER_NUMBER}
┃
┣━━━━━━━━━━━━━━━━━⬣
┃ *𝐂𝐇𝐀𝐓𝐇𝐔𝐖𝐀*
╰━━━━━━━━━━━━━━━━━⬣`
                    });
                    
                } catch (error) {
                    console.log(`⚠️ Reject error: ${error.message}`);
                }
                
            } catch (error) {
                console.error('Anti-call handler error:', error.message);
            }
        }
    });
}

module.exports = { setupAntiCallHandler };
