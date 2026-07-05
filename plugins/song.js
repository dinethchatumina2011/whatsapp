const yts = require('yt-search');

module.exports = {
    name: 'song',

    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp) {

        try {
            let query = args.join(' ').trim();
            if (!query) {
                return await socket.sendMessage(sender, {
                    text: '🔎 *Please provide a song name or a YouTube link!*'
                });
            }

            await socket.sendMessage(sender, { react: { text: '🎧', key: msg.key } });

            // Search YouTube
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) {
                return await socket.sendMessage(sender, { text: '❌ *Song not found!*' });
            }

            const wm = "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʜᴀᴛʜᴜᴡᴀ ";

            let caption = `*🎵 CHATHUWA-XMD AUDO PLAYER 🎵*\n\n`;
            caption += `*╭───────────────┈⊷*\n`;
            caption += `*┊• 📌 ᴛɪᴛʟᴇ :- ${video.title}\n`;
            caption += `*┊• ⏱️ ᴅᴜʀᴀᴛɪᴏɴ :- ${video.duration.timestamp}\n`;
            caption += `*┊• 👁️ ᴠɪᴇᴡꜱ :- ${video.views.toLocaleString()}\n`;
            caption += `*╰───────────────┈⊷*\n\n`;
            caption += `*ꜱᴇʟᴇᴄᴛ ꜰᴏʀᴍᴀᴛ ʙᴇʟᴏᴡ 👇*\n`;

            const buttons = [
                {
                    buttonId: 'song_audio',
                    buttonText: { displayText: '🎶 Audio File' },
                    type: 1
                },
                {
                    buttonId: 'song_document',
                    buttonText: { displayText: '📁 Document File' },
                    type: 1
                },
                {
                    buttonId: 'song_voice',
                    buttonText: { displayText: '🎤 Voice Note' },
                    type: 1
                }
            ];

            await socket.sendMessage(sender, {
                image: { url: video.thumbnail },
                caption: caption,
                buttons: buttons,
                headerType: 4
            }, { quoted: msg });

            const buttonListener = async (update) => {
                try {
                    const m = update.messages[0];
                    if (!m?.message?.buttonsResponseMessage) return;
                    if (m.key.remoteJid !== sender) return;
                    if (m.key.fromMe) return;

                    const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
                    if (!buttonId || !buttonId.startsWith('song_')) return;

                    await socket.sendMessage(sender, { react: { text: '⏳', key: m.key } });

                    let downloadUrl = null;
                    try {
                        const apiUrl = `https://www.ominisave.com/api/ytmp3_v2?url=${video.url}`;
                        const response = await axios.get(apiUrl, { timeout: 30000 });
                        const res = response.data;
                        if (res?.status && res?.result?.downloadLink) {
                            downloadUrl = res.result.downloadLink;
                        }
                    } catch (err) {
                        console.error('API error:', err.message);
                    }

                    if (!downloadUrl) {
                        await socket.sendMessage(sender, { text: "❌ *Server error! Failed to get download link.*" });
                        return;
                    }

                    await socket.sendMessage(sender, { react: { text: '⬆️', key: m.key } });

                    const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 60000 });
                    const buffer = Buffer.from(audioResponse.data);

                    if (buttonId === 'song_audio') {
                        await socket.sendMessage(sender, {
                            audio: buffer,
                            mimetype: "audio/mpeg"
                        });
                    } else if (buttonId === 'song_document') {
                        await socket.sendMessage(sender, {
                            document: buffer,
                            mimetype: "audio/mpeg",
                            fileName: `🎧ᴄʜᴀᴛʜᴜᴡᴀ-xᴍᴅ🎧${video.title.replace(/[^\w\s]/g, '')}.mp3`,
                            caption: wm
                        });
                    } else if (buttonId === 'song_voice') {
                        await socket.sendMessage(sender, {
                            audio: buffer,
                            mimetype: "audio/ogg; codecs=opus",
                            ptt: true
                        });
                    }

                    await socket.sendMessage(sender, { react: { text: '✅', key: m.key } });
                    socket.ev.off('messages.upsert', buttonListener);
                } catch (err) {
                    console.error('Button listener error:', err);
                    await socket.sendMessage(sender, { text: `❌ *Error:* ${err.message}` });
                    socket.ev.off('messages.upsert', buttonListener);
                }
            };

            socket.ev.on('messages.upsert', buttonListener);

            setTimeout(() => {
                socket.ev.off('messages.upsert', buttonListener);
            }, 120000);

        } catch (err) {
            console.error('Song command error:', err);
            await socket.sendMessage(sender, { text: `❌ *Error:* ${err.message}` });
        }
    }
};
