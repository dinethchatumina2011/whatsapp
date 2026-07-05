// plugins/worktype.js
const { getBotWorkType, updateBotWorkType } = require('../mongodbSettings');
const fs = require('fs-extra');
const path = require('path');

const ADMIN_LIST_PATH = path.join(process.cwd(), 'admin.json');

function loadAdmins() {
    try {
        if (fs.existsSync(ADMIN_LIST_PATH)) {
            const data = fs.readFileSync(ADMIN_LIST_PATH, 'utf8');
            const admins = JSON.parse(data);
            return admins.map(admin => admin.toString().replace(/[^0-9]/g, ''));
        }
        return [];
    } catch (error) {
        return [];
    }
}

function extractPhoneNumber(jid) {
    if (!jid) return null;
    const phoneRegex = /(\d{10,13})/;
    const match = jid.match(phoneRegex);
    if (match) {
        let number = match[1].replace(/[^0-9]/g, '');
        if (number.startsWith('0') && number.length === 10) {
            number = '94' + number.substring(1);
        }
        if (number.length === 10 && number.startsWith('7')) {
            number = '94' + number;
        }
        if (number.length === 9 && number.startsWith('7')) {
            number = '94' + number;
        }
        return number;
    }
    return null;
}

function getSenderNumber(msg, socket) {
    if (msg.key && msg.key.participant) {
        const num = extractPhoneNumber(msg.key.participant);
        if (num) return num;
    }
    if (msg.key && msg.key.remoteJid) {
        const remoteJid = msg.key.remoteJid;
        if (!remoteJid.includes('@g.us') && !remoteJid.includes('newsletter')) {
            const num = extractPhoneNumber(remoteJid);
            if (num) return num;
        }
    }
    return null;
}

module.exports = {
    name: 'worktype',
    async execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
        
        const senderNumber = getSenderNumber(msg, socket);
        const cleanBotNumber = currentBotNumber.toString().replace(/[^0-9]/g, '');
        const admins = loadAdmins();
        
        const isBotOwner = (senderNumber === cleanBotNumber);
        const isAdmin = admins.includes(senderNumber);
        
        if (!isBotOwner && !isAdmin && !isOwner) {
            await sendMessageWithRetry(socket, sender, {
                text: '❌ *Access Denied*\n\nOnly *Bot Owner* or *Admins* can change work type!',
                quoted: msg
            });
            return;
        }
        
        const currentType = await getBotWorkType(cleanBotNumber);
        
        // Settings list format එක (your old settings command style)
        const sections = [
            {
                title: "`🔮 WORK TYPE SETTINGS 🔮`",
                rows: [
                    {
                        title: "🌍 PUBLIC",
                        description: "Everyone can use commands",
                        rowId: config.PREFIX + 'work_type public'
                    },
                    {
                        title: "🔒 PRIVATE",
                        description: "Only bot owner & admins",
                        rowId: config.PREFIX + 'work_type private'
                    },
                    {
                        title: "👥 ONLY GROUP",
                        description: "Commands work only in groups",
                        rowId: config.PREFIX + 'work_type only_group'
                    },
                    {
                        title: "📥 INBOX",
                        description: "Commands work only in private chats",
                        rowId: config.PREFIX + 'work_type inbox'
                    }
                ]
            }
        ];
        
        const typeEmoji = {
            'public': '🌍',
            'private': '🔒',
            'inbox': '📥',
            'only_group': '👥'
        };
        
        const caption = `*⚙️ WORK TYPE SETTINGS ⚙️*\n\n${typeEmoji[currentType] || '🤖'} *Current Mode:* *${currentType.toUpperCase()}*\n\n📌 *Select a mode below to change*`;
        
        const listMessage = {
            text: caption,
            footer: config.BOT_FOOTER,
            title: '',
            buttonText: '🔽 SELECT WORK TYPE',
            sections: sections
        };
        
        // Buttons format (alternative)
        const workTypeButtons = [
            { buttonId: `${config.PREFIX}work_type public`, buttonText: { displayText: `🌍 PUBLIC` }, type: 1 },
            { buttonId: `${config.PREFIX}work_type private`, buttonText: { displayText: `🔒 PRIVATE` }, type: 1 },
            { buttonId: `${config.PREFIX}work_type inbox`, buttonText: { displayText: `📥 INBOX` }, type: 1 },
            { buttonId: `${config.PREFIX}work_type only_group`, buttonText: { displayText: `👥 ONLY GROUP` }, type: 1 }
        ];
        
        // Send as list message (like your settings command)
        try {
            await socket.sendMessage(sender, {
                text: caption,
                footer: config.BOT_FOOTER,
                buttons: workTypeButtons,
                headerType: 1
            }, { quoted: msg });
        } catch (error) {
            // Fallback to list message
            await socket.sendMessage(sender, listMessage, { quoted: msg });
        }
        
        await socket.sendMessage(sender, { react: { text: '⚙️', key: msg.key } });
    }
};

// Work type handler command (like your work_type command)
const { cmd, commands } = require('../command');
const { get, input } = require('../lib/database');

cmd({
    pattern: "work_type",
    react: "🔄",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, isSudo, isMe, isOwner, reply, sender, args }) => {
    try {
        // Get sender number
        let senderNumber = sender;
        if (sender.includes('@')) senderNumber = sender.split('@')[0];
        senderNumber = senderNumber.replace(/[^0-9]/g, '');
        
        // Load admins
        const admins = loadAdmins();
        const isAdmin = admins.includes(senderNumber);
        
        // Get bot number from connection
        let botNumber = '';
        if (conn.user && conn.user.id) {
            botNumber = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
        }
        
        if (!isSudo && !isMe && !isOwner && !isAdmin) {
            return await reply('*OWNER/ADMIN COMMAND ⛔*');
        }
        
        if (!q) return await reply('*Please provide a work type: public / private / inbox / only_group*');
        
        const validTypes = ['public', 'private', 'inbox', 'only_group'];
        if (!validTypes.includes(q.toLowerCase())) {
            return await reply('*Invalid work type!\n\nUse: public, private, inbox, only_group*');
        }
        
        const { updateBotWorkType } = require('../mongodbSettings');
        const success = await updateBotWorkType(botNumber, q.toLowerCase());
        
        if (success) {
            const emoji = {
                'public': '🌍',
                'private': '🔒',
                'inbox': '📥',
                'only_group': '👥'
            };
            
            await reply(`✅ *Work Type Updated!*\n\n${emoji[q.toLowerCase()]} *New Mode:* ${q.toUpperCase()}\n\n🔄 Bot will restart...`);
            
            setTimeout(() => {
                try { conn.end('Restarting to apply work type changes'); } catch(e) {}
            }, 2000);
        } else {
            await reply('❌ *Failed to update work type!*');
        }
        
    } catch (e) {
        console.log(e);
        await reply(`*Error:* ${e.message}`);
    }
});
