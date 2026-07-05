module.exports = {
  name: "ping",
  alias: ["speed"],
  desc: "Check bot's response speed.",
  category: "main",
  use: ".ping",
  filename: __filename,
  
  async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
    
    const from = msg?.key?.remoteJid || sender;
    const reply = async (text) => {
      await socket.sendMessage(from, { text: text }, { quoted: msg });
    };
    
    const pushname = msg?.pushName || "User";

    try {
      const start = Date.now();

      await socket.sendMessage(from, {
        react: {
          text: "⚡",
          key: msg.key
        }
      });

      const fgclink = {
        key: {
          remoteJid: "status@broadcast",
          fromMe: false,
          id: 'FAKE_META_ID_001',
          participant: '13135550002@s.whatsapp.net'
        },
        message: {
          contactMessage: {
            displayName: 'CHATHUWA-XMD',
            vcard: `BEGIN:VCARD
VERSION:3.0
N:Alip;;;;
FN:Alip
TEL;waid=13135550002:+1 313 555 0002
END:VCARD`
          }
        }
      };

      const latency = Date.now() - start;

      let performanceEmoji = "";
      let statusText = "";
      
      if (latency <= 100) {
        performanceEmoji = "🚀";
        statusText = "EXCELLENT";
      } else if (latency <= 200) {
        performanceEmoji = "📶";
        statusText = "GOOD";
      } else if (latency <= 400) {
        performanceEmoji = "⚠️";
        statusText = "NORMAL";
      } else if (latency <= 800) {
        performanceEmoji = "🐌";
        statusText = "SLOW";
      } else {
        performanceEmoji = "❌";
        statusText = "POOR";
      }

      const quality = Math.min(100, Math.max(0, 100 - Math.floor(latency / 10)));

      const replyText = `⚡ PING RESULT\n\n` +
                        `┌─ ❍ *Latency:* ${latency} ms\n` +
                        `├─ ❍ *Status:*  ${statusText}\n` +
                        `├─ ❍ *Quality:* ${quality}%\n` +
                        `└─ ❍ *Response:* ${latency <= 200 ? 'Fast 🚀' : latency <= 400 ? 'Normal ⚠️' : 'Slow 🐌'}`;

      await socket.sendMessage(from, { text: replyText }, { quoted: fgclink });

      let reaction = '✅';
      if (latency < 100) reaction = '🔥';
      else if (latency < 200) reaction = '✅';
      else if (latency < 400) reaction = '⚠️';
      else if (latency < 800) reaction = '🐌';
      else reaction = '❌';
      
      await socket.sendMessage(from, {
        react: {
          text: reaction,
          key: msg.key
        }
      }).catch(() => {});

    } catch (error) {
      console.error('Ping command error:', error);
      
      if (error.message?.includes('rate-overlimit') || error.data === 429) {
        await reply(`⚠️ *Bot is busy!*\n└─ Please try again in a few seconds.`);
      } else {
        await reply(`❌ *Error:* ${error.message || 'Failed to measure ping'}`);
      }
    }
  }
};
