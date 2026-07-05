module.exports = {
    name: 'forward',

    async execute(socket, msg, args) {
        try {
            const from = msg.key.remoteJid;
            const target = args[0];

            if (!target) {
                return await socket.sendMessage(from, {
                    text: '❎ Give target JID\nExample:\n.forward 947XXXXXXXX@s.whatsapp.net'
                });
            }

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) {
                return await socket.sendMessage(from, {
                    text: '❎ Reply to a message'
                });
            }

            // 🔥 detect message type
            const type = Object.keys(quoted)[0];
            const content = quoted[type];

            // 📄 DOCUMENT
            if (type === 'documentMessage') {
                await socket.sendMessage(target, {
                    document: { url: content.url },
                    mimetype: content.mimetype,
                    fileName: content.fileName || 'file'
                });
            }

            // 🖼 IMAGE
            else if (type === 'imageMessage') {
                await socket.sendMessage(target, {
                    image: { url: content.url },
                    caption: content.caption || ''
                });
            }

            // 🎥 VIDEO
            else if (type === 'videoMessage') {
                await socket.sendMessage(target, {
                    video: { url: content.url },
                    caption: content.caption || ''
                });
            }

            // 🎵 AUDIO
            else if (type === 'audioMessage') {
                await socket.sendMessage(target, {
                    audio: { url: content.url },
                    mimetype: content.mimetype
                });
            }

            // 💬 TEXT
            else if (type === 'conversation') {
                await socket.sendMessage(target, {
                    text: content
                });
            }

            else {
                return await socket.sendMessage(from, {
                    text: '❎ Unsupported message type'
                });
            }

            await socket.sendMessage(from, { text: '✅ Forwarded' });

        } catch (err) {
            console.error('FORWARD ERROR:', err);
            await socket.sendMessage(msg.key.remoteJid, {
                text: '❌ Forward failed'
            });
        }
    }
};
