module.exports = {
    name: 'jid',

    async execute(socket, msg, args, context) {
        try {
            let targetJid;

            const m = msg.message;

            // reply
            if (m?.extendedTextMessage?.contextInfo?.participant) {
                targetJid = m.extendedTextMessage.contextInfo.participant;
            }
            // tag
            else if (m?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
                targetJid = m.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            // default (chat JID)
            else {
                targetJid = msg.key.remoteJid;
            }

            // send only JID
            await socket.sendMessage(msg.key.remoteJid, {
                text: targetJid
            });

        } catch (err) {
            console.error('JID ERROR:', err);
            await socket.sendMessage(msg.key.remoteJid, {
                text: '❌ Error getting JID'
            });
        }
    }
};
