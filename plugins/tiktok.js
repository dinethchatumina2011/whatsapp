module.exports = {
    name: 'tiktok',

    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp) {

        try {
            const query = args.join(' ').trim();
            if (!query) {
                return await socket.sendMessage(sender, {
                    text: '🔎 *Please give a TikTok URL!*\nEx: .tiktok https://vm.tiktok.com/xxxx'
                });
            }

            await socket.sendMessage(sender, { react: { text: '🎥', key: msg.key } });

            // Clean URL (remove ?... part) and encode
            const tiktokUrl = query.split('?')[0];
            const encodedUrl = encodeURIComponent(tiktokUrl);

            // Call tikwm API
            const response = await axios.get(`https://tikwm.com/api/?url=${encodedUrl}`, { timeout: 30000 });
            const video = response.data?.data;
            if (!video) {
                return await socket.sendMessage(sender, { text: '❌ *Video details not found. Check the link.*' });
            }

            const wm = "_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐙𝐄𝐔𝐒 𝐈𝐍𝐂 </>_ 🇱🇰";

            let caption = `*🎥 ZEUS X MINI TIK TOK DOWNLOADER 🎥*\n\n`;
            caption += `*╭───────────────┈⊷*\n`;
            caption += `*┊• 🏷️ ᴛɪᴛʟᴇ :-* ${video.title || 'No Title'}\n`;
            caption += `*┊• 👤 ᴀᴜᴛʜᴏʀ :-* ${video.author?.nickname || 'Unknown'}\n`;
            caption += `*┊• ⏱️ ᴅᴜʀᴀᴛɪᴏɴ :-* ${video.duration}s\n`;
            caption += `*┊• 👁️ ᴠɪᴇᴡꜱ :-* ${video.play_count?.toLocaleString() || 0}\n`;
            caption += `*╰───────────────┈⊷*\n\n`;
            caption += `*ꜱᴇʟᴇᴄᴛ ꜰᴏʀᴍᴀᴛ ʙᴇʟᴏᴡ 👇*\n`;
            
            const getUrl = (path) => path?.startsWith('http') ? path : `https://tikwm.com${path}`;

            const buttons = [
                {
                    buttonId: 'tiktok_nowm',
                    buttonText: { displayText: '📼 No Watermark' },
                    type: 1
                },
                {
                    buttonId: 'tiktok_wm',
                    buttonText: { displayText: '💧 With Watermark' },
                    type: 1
                },
                {
                    buttonId: 'tiktok_audio',
                    buttonText: { displayText: '🎵 Audio Only' },
                    type: 1
                }
            ];

            await socket.sendMessage(sender, {
                image: { url: video.cover },
                caption: caption,
                buttons: buttons,
                headerType: 4
            }, { quoted: msg });

            // Button response listener
            const buttonListener = async (update) => {
                try {
                    const m = update.messages[0];
                    if (!m?.message?.buttonsResponseMessage) return;
                    if (m.key.remoteJid !== sender) return;
                    if (m.key.fromMe) return;

                    const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
                    if (!buttonId || !buttonId.startsWith('tiktok_')) return;

                    await socket.sendMessage(sender, { react: { text: '⏳', key: m.key } });

                    if (buttonId === 'tiktok_nowm') {
                        if (video.play) {
                            await socket.sendMessage(sender, {
                                video: { url: getUrl(video.play) },
                                mimetype: "video/mp4",
                                caption: `*No Watermark*\n\n${wm}`
                            });
                        } else {
                            await socket.sendMessage(sender, { text: "❌ *No watermark video not available.*" });
                        }
                    } else if (buttonId === 'tiktok_wm') {
                        if (video.wmplay) {
                            await socket.sendMessage(sender, {
                                video: { url: getUrl(video.wmplay) },
                                mimetype: "video/mp4",
                                caption: `*With Watermark*\n\n${wm}`
                            });
                        } else {
                            await socket.sendMessage(sender, { text: "❌ *Watermarked video not available.*" });
                        }
                    } else if (buttonId === 'tiktok_audio') {
                        if (video.music) {
                            await socket.sendMessage(sender, {
                                audio: { url: getUrl(video.music) },
                                mimetype: "audio/mpeg"
                            });
                        } else {
                            await socket.sendMessage(sender, { text: "❌ *Audio not available.*" });
                        }
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
            console.error('TikTok command error:', err);
            await socket.sendMessage(sender, { text: `❌ *Error:* ${err.message}` });
        }
    }
};
