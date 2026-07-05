





module.exports = {
    name: 'owner',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        try {
            const vcard1 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';
            
            const vcard2 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';
            
            const vcard3 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';

            const vcard4 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';
            
            const vcard5 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';
            
            const vcard6 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';
            
            const vcard7 = 'BEGIN:VCARD\n' 
                         + 'VERSION:3.0\n' 
                         + 'FN:  Name \n' 
                         + 'ORG: Details ;\n' 
                         + 'TEL;type=CELL;type=VOICE;waid=Number:+Number again\n' 
                         + 'END:VCARD';
            
            await sendMessageWithRetry(socket, sender, {
                contacts: {
                    displayName: '👥 Bot Owners',
                    contacts: [
                        { vcard: vcard1 },
                        { vcard: vcard3 },
                        { vcard: vcard2 },
                        { vcard: vcard4 },
                        { vcard: vcard5 },
                        { vcard: vcard6 },
                        { vcard: vcard7 }
                    ]
                }
            });
        } catch (error) {
            console.error('Error sending owner contacts:', error);
            await sendMessageWithRetry(socket, sender, { text: `❌ Failed to send owner contacts: ${error.message}` });
        }
    }
};
