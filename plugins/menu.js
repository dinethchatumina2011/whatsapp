module.exports = {
  name: "menu",
  alias: ["help", "commands"],
  desc: "Show all available commands",
  category: "main",
  use: ".menu",
  filename: __filename,

  async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {

    const from = msg?.key?.remoteJid || sender;
    const reply = async (text) => {
      await socket.sendMessage(from, { text: text }, { quoted: msg });
    };

    try {
      const startTime = socket.creationTime || Date.now();
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const prefix = config?.PREFIX || '.';
      const botName = config?.BOT_NAME || 'ZEUS-X-MINI';
      const botFooter = config?.BOT_FOOTER || '_𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐙𝐄𝐔𝐒 𝐈𝐍𝐂 </>_🇱🇰';
      const menuImage = config?.BUTTON_IMAGES?.MENU || 'https://mc-error-db.pages.dev/VIHAGA%20XMD/Data/ZEUS%20X%20MD%20MINI%201%20.png';

      const title = `╭━━━〔 ✨ ${botName} ✨ 〕━━━⬣
┃
┃ 🤖 *Type*: MULTI SESSION
┃ 📡 *Platform*: ZEUS PRIVATE SERVER
┃ ⏱️ *Uptime*: ${hours}h ${minutes}m ${seconds}s
┃ 🔧 *Prefix*: ${prefix}
┃
╰━━━━━━━━━━━━━━━━━⬣`;

      const content = `┏━━━━━━━━━━━━━━━❐
┃ 🎬 *MOVIE DOWNLOADS*
┃ ├ ${prefix}sinhalasub <movie>
┃ ├ ${prefix}cinesubz <movie>
┃ ├ ${prefix}cinesubztv <show>
┃ ├ ${prefix}flixoraa <movie>
┃ └ ${prefix}moviesublk <movie>
┃
┃ ⚡ *UTILITY*
┃ ├ ${prefix}alive - Bot status
┃ ├ ${prefix}ping - Response time
┃ ├ ${prefix}owner - Contact owner
┃ ├ ${prefix}system - System info
┃ ├ ${prefix}setting - Bot settings
┃ └ ${prefix}downloadmenu - Download menu
┃
┃ 🔧 *OWNER ONLY*
┃ ├ ${prefix}worktype - Change work mode
┃ ├ ${prefix}getworktype - Show current mode
┃ └ ${prefix}setworktype <type>
┗━━━━━━━━━━━━━━━❐
`;

      const buttons = [
        { buttonId: prefix + 'mainmenu', buttonText: { displayText: 'MAIN COMMANDS' }, type: 1 },
        { buttonId: prefix + 'ownermenu', buttonText: { displayText: 'OWNER COMMANDS' }, type: 1 },
        { buttonId: prefix + 'groupmenu', buttonText: { displayText: 'GROUP COMMANDS' }, type: 1 },
        { buttonId: prefix + 'moviemenu', buttonText: { displayText: 'MOVIE COMMANDS' }, type: 1 },
        { buttonId: prefix + 'downloadmenu', buttonText: { displayText: 'DOWNLOAD COMMANDS' }, type: 1 }
      ];

      const fgclink = {
        key: {
          remoteJid: "status@broadcast",
          fromMe: false,
          id: 'FAKE_META_ID_001',
          participant: '13135550002@s.whatsapp.net'
        },
        message: {
          contactMessage: {
            displayName: '© ZEUS X MD',
            vcard: `BEGIN:VCARD
VERSION:3.0
N:Alip;;;;
FN:Alip
TEL;waid=13135550002:+1 313 555 0002
END:VCARD`
          }
        }
      };

      await socket.sendMessage(from, {
        react: {
          text: "📂",
          key: msg.key
        }
      });

      // ✅ CORRECT WAY - quoted එක message options එක ඇතුලට දාන්න
      const messageOptions = {
        image: { url: menuImage },
        caption: `${title}\n\n${content}`,
        buttons: buttons,
        footer: botFooter,
        headerType: 4,
        quoted: fgclink  // ✅ quoted මෙතන තියෙන්න ඕන
      };

      if (sendMessageWithRetry && typeof sendMessageWithRetry === 'function') {
        await sendMessageWithRetry(socket, from, messageOptions);
      } else {
        await socket.sendMessage(from, messageOptions);
      }

    } catch (error) {
      console.error('Menu error:', error);
      
      // Fallback - text only without buttons
      try {
        await socket.sendMessage(from, {
          text: `${title}\n\n${content}\n\n⚠️ Button feature unavailable. Please use commands manually.`,
          quoted: msg
        });
      } catch (e) {
        console.error('Final fallback error:', e);
        await reply(`❌ *Error:* ${error.message || 'Failed to load menu'}`);
      }
    }
  }
};
