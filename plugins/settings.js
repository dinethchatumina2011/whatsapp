// plugins/setting.js
module.exports = {
    name: 'setting',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        
        // Get sender number safely
        let senderNumber;
        try {
            if (sender) {
                senderNumber = sender.split('@')[0];
            }
        } catch (error) {
            senderNumber = OWNER_NUMBER;
        }
        
        if (!senderNumber) senderNumber = OWNER_NUMBER;
        
        const subCommand = args[0]?.toLowerCase();
        
        // Get current settings
        let settings = {};
        try {
            const allSettings = await getAllUserEnv(senderNumber);
            if (allSettings && typeof allSettings === 'object') {
                settings = allSettings;
            }
        } catch (error) {
            settings = {};
        }
        
        const defaultSettings = {
            AUTO_VIEW_STATUS: 'true',
            AUTO_LIKE_STATUS: 'on',
            AUTO_LIKE_EMOJI: ['❤️', '💜', '💙', '💚', '💛'],
            ANTI_CALL: 'on',
            ANTI_DELETE: 'on',
            AUTO_REACT: 'off',
            PRESENCE_TYPE: 'on'
        };
        
        // Merge settings
        for (const key in defaultSettings) {
            if (settings[key] === undefined || settings[key] === null) {
                settings[key] = defaultSettings[key];
            }
        }
        
        // ========== HANDLE BUTTON CALLBACKS ==========
        if (subCommand === 'btn') {
            const action = args[1];
            const value = args[2];
            
            try {
                switch (action) {
                    case 'view_status':
                        const newViewStatus = settings.AUTO_VIEW_STATUS === 'true' ? 'false' : 'true';
                        await updateUserEnv('AUTO_VIEW_STATUS', newViewStatus, senderNumber);
                        break;
                    case 'like_status':
                        const newLikeStatus = settings.AUTO_LIKE_STATUS === 'on' ? 'off' : 'on';
                        await updateUserEnv('AUTO_LIKE_STATUS', newLikeStatus, senderNumber);
                        break;
                    case 'anti_call':
                        const newAntiCall = settings.ANTI_CALL === 'on' ? 'off' : 'on';
                        await updateUserEnv('ANTI_CALL', newAntiCall, senderNumber);
                        break;
                    case 'anti_delete':
                        const newAntiDelete = settings.ANTI_DELETE === 'on' ? 'off' : 'on';
                        await updateUserEnv('ANTI_DELETE', newAntiDelete, senderNumber);
                        break;
                    case 'auto_react':
                        const newAutoReact = settings.AUTO_REACT === 'on' ? 'off' : 'on';
                        await updateUserEnv('AUTO_REACT', newAutoReact, senderNumber);
                        break;
                    case 'presence':
                        const newPresence = settings.PRESENCE_TYPE === 'on' ? 'off' : 'on';
                        await updateUserEnv('PRESENCE_TYPE', newPresence, senderNumber);
                        break;
                    case 'emoji':
                        if (value === 'hearts') {
                            await updateUserEnv('AUTO_LIKE_EMOJI', ['❤️', '💜', '💙', '💚', '💛', '🧡'], senderNumber);
                        } else if (value === 'thumbs') {
                            await updateUserEnv('AUTO_LIKE_EMOJI', ['👍', '👎', '👏', '🙌', '🤝', '💪'], senderNumber);
                        } else if (value === 'fire') {
                            await updateUserEnv('AUTO_LIKE_EMOJI', ['🔥', '💯', '⭐', '✨', '🌟', '⚡'], senderNumber);
                        } else if (value === 'all') {
                            await updateUserEnv('AUTO_LIKE_EMOJI', ['❤️', '👍', '🔥', '🎉', '💜', '😂', '😍', '🥳', '✨', '⭐'], senderNumber);
                        }
                        break;
                    case 'reset':
                        await updateUserEnv('AUTO_VIEW_STATUS', 'true', senderNumber);
                        await updateUserEnv('AUTO_LIKE_STATUS', 'on', senderNumber);
                        await updateUserEnv('AUTO_LIKE_EMOJI', ['❤️', '💜', '💙', '💚', '💛'], senderNumber);
                        await updateUserEnv('ANTI_CALL', 'on', senderNumber);
                        await updateUserEnv('ANTI_DELETE', 'on', senderNumber);
                        await updateUserEnv('AUTO_REACT', 'off', senderNumber);
                        await updateUserEnv('PRESENCE_TYPE', 'on', senderNumber);
                        break;
                }
            } catch (error) {
                console.error('Error in button action:', error);
            }
            
            await sendCleanSettings(socket, sender, msg, config, settings, senderNumber, getAllUserEnv, sendMessageWithRetry);
            return;
        }
        
        // ========== HANDLE CUSTOM EMOJI INPUT ==========
        if (subCommand === 'setemoji' && args[1]) {
            const emojis = args.slice(1).join('').split(',').map(e => e.trim()).filter(e => e.length > 0);
            if (emojis.length > 0) {
                try {
                    await updateUserEnv('AUTO_LIKE_EMOJI', emojis, senderNumber);
                    await sendMessageWithRetry(socket, sender, {
                        text: `✅ *Emojis Updated!*\n\n${emojis.join('  ')}`,
                        quoted: msg
                    });
                } catch (error) {
                    console.error('Error updating emojis:', error);
                }
                await sendCleanSettings(socket, sender, msg, config, settings, senderNumber, getAllUserEnv, sendMessageWithRetry);
            }
            return;
        }
        
        // ========== SHOW SETTINGS ==========
        await sendCleanSettings(socket, sender, msg, config, settings, senderNumber, getAllUserEnv, sendMessageWithRetry);
    }
};

// ========== CLEAN SETTINGS MENU ==========
async function sendCleanSettings(socket, sender, msg, config, settings, senderNumber, getAllUserEnv, sendMessageWithRetry) {
    
    // Get fresh settings
    let freshSettings = {};
    try {
        const allSettings = await getAllUserEnv(senderNumber);
        if (allSettings && typeof allSettings === 'object') {
            freshSettings = allSettings;
        }
    } catch (error) {
        freshSettings = {};
    }
    
    const defaultSettings = {
        AUTO_VIEW_STATUS: 'true',
        AUTO_LIKE_STATUS: 'on',
        AUTO_LIKE_EMOJI: ['❤️', '💜', '💙', '💚', '💛'],
        ANTI_CALL: 'on',
        ANTI_DELETE: 'on',
        AUTO_REACT: 'off',
        PRESENCE_TYPE: 'on'
    };
    
    // Merge
    for (const key in defaultSettings) {
        if (freshSettings[key] === undefined || freshSettings[key] === null) {
            freshSettings[key] = defaultSettings[key];
        }
    }
    
    // Status text
    const viewStatusText = freshSettings.AUTO_VIEW_STATUS === 'true' ? '*ENABLED*' : '*DISABLED*';
    const likeStatusText = freshSettings.AUTO_LIKE_STATUS === 'on' ? '*ENABLED*' : '*DISABLED*';
    const antiCallText = freshSettings.ANTI_CALL === 'on' ? '*ENABLED*' : '*DISABLED*';
    const antiDeleteText = freshSettings.ANTI_DELETE === 'on' ? '*ENABLED*' : '*DISABLED*';
    const autoReactText = freshSettings.AUTO_REACT === 'on' ? '*ENABLED*' : '*DISABLED*';
    const presenceText = freshSettings.PRESENCE_TYPE === 'on' ? '*ENABLED*' : '*DISABLED*';
    
    const emojiList = Array.isArray(freshSettings.AUTO_LIKE_EMOJI) ? freshSettings.AUTO_LIKE_EMOJI.join(' ') : '❤️ 💜 💙 💚 💛';
    
    // Clean message
    const message = `⚙️ *BOT SETTINGS*

👤 *User:* ${senderNumber}

📱 *FEATURE CONFIGURATION*

\`AUTO VIEW STATUS\`    ${viewStatusText}
\`AUTO LIKE STATUS\`    ${likeStatusText}
\`ANTI CALL\`           ${antiCallText}
\`ANTI DELETE\`         ${antiDeleteText}
\`AUTO REACT\`          ${autoReactText}
\`PRESENCE\`            ${presenceText}

😊 *LIKE EMOJIS*
${emojiList}

💡 *QUICK TIPS*
• Click buttons below to toggle settings
• Use .setting setemoji ❤️,👍,🔥

🎭 *DARKLEX-MD v1.0*`;

    // Feature buttons
    const featureButtons = [
        { buttonId: `${config.PREFIX}setting btn view_status`, buttonText: { displayText: `👁️ VIEW STATUS` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn like_status`, buttonText: { displayText: `❤️ LIKE STATUS` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn anti_call`, buttonText: { displayText: `📞 ANTI CALL` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn anti_delete`, buttonText: { displayText: `🗑️ ANTI DELETE` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn auto_react`, buttonText: { displayText: `🔁 AUTO REACT` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn presence`, buttonText: { displayText: `🎬 PRESENCE` }, type: 1 }
    ];
    
    // Emoji buttons message
    const emojiMessage = `🎨 *EMOJI PRESETS*

💖 Hearts    👍 Thumbs    🔥 Fire
🎉 All       🔄 Reset

💡 *.setting setemoji ❤️,👍,🔥*`;

    const emojiButtons = [
        { buttonId: `${config.PREFIX}setting btn emoji hearts`, buttonText: { displayText: `💖 HEARTS` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn emoji thumbs`, buttonText: { displayText: `👍 THUMBS` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn emoji fire`, buttonText: { displayText: `🔥 FIRE` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn emoji all`, buttonText: { displayText: `🎉 ALL` }, type: 1 },
        { buttonId: `${config.PREFIX}setting btn reset`, buttonText: { displayText: `🔄 RESET` }, type: 1 }
    ];
    
    // Send main settings
    try {
        await sendMessageWithRetry(socket, sender, {
            text: message,
            buttons: featureButtons,
            quoted: msg
        });
    } catch (error) {
        console.error('Error sending settings:', error);
    }
    
    // Send emoji settings
    try {
        await sendMessageWithRetry(socket, sender, {
            text: emojiMessage,
            buttons: emojiButtons,
            quoted: msg
        });
    } catch (error) {
        console.error('Error sending emoji settings:', error);
    }
}
