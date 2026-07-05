const { getRecentErrors, getConnectionLogs, clearLogs } = require('../logger');

module.exports = {
    name: 'log',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        const senderNumber = sender.split('@')[0];
        
        // Only owner can view logs
        if (senderNumber !== OWNER_NUMBER && !isOwner) {
            await sendMessageWithRetry(socket, sender, {
                text: '❌ You are not authorized to view logs.',
                quoted: msg
            });
            return;
        }
        
        const subCommand = args[0]?.toLowerCase();
        
        if (subCommand === 'clear') {
            await clearLogs();
            await sendMessageWithRetry(socket, sender, {
                text: '✅ Logs cleared successfully!',
                quoted: msg
            });
            return;
        }
        
        // Get errors
        const errors = await getRecentErrors(10);
        const connections = await getConnectionLogs(10);
        
        let errorText = '📋 *RECENT ERRORS:*\n\n';
        if (errors.length === 0) {
            errorText += 'No errors found.\n';
        } else {
            errors.forEach((err, i) => {
                errorText += `${i+1}. [${err.timestamp}] ${err.message.substring(0, 100)}\n`;
            });
        }
        
        let connText = '\n📡 *RECENT CONNECTIONS:*\n\n';
        if (connections.length === 0) {
            connText += 'No connection logs found.\n';
        } else {
            connections.forEach((conn, i) => {
                connText += `${i+1}. [${conn.timestamp}] ${conn.event}\n`;
            });
        }
        
        const message = errorText + connText + '\n\n📌 *Commands:*\n.getlogs - View logs\n.getlogs clear - Clear logs';
        
        await sendMessageWithRetry(socket, sender, {
            text: message,
            quoted: msg
        });
    }
};
