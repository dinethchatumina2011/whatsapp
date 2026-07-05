const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();
const pino = require('pino');
const moment = require('moment-timezone');
const axios = require('axios');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const os = require('os');
const sharp = require('sharp');

// MongoDB Settings
const { initUserEnvIfMissing, initEnvsettings, getUserEnv, updateUserEnv, getAllUserEnv, getBotWorkType, updateBotWorkType } = require('./mongodbSettings');

// Handlers
const { setupStatusHandlers } = require('./handlers/statusHandler');
const { setupAntiCallHandler } = require('./handlers/antiCallHandler');
const { setupAntiDeleteHandler } = require('./handlers/antiDeleteHandler');
const { setupMessageHandlers } = require('./handlers/messageHandler');

// Plugin System
const { executePlugin } = require('./plugins');

//=======================================
// CONFIGURATION
//=======================================
const ORIGINAL_OWNER = '94741336839';
let currentBotNumber = null;

const extraOwnersMap = new Map();

//=======================================
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
} = require('@whiskeysockets/baileys');

//=======================================
const config = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['🧩', '🍉', '💜', '🌸', '🪴', '💊', '💫', '🍂', '🌟', '🎋', '😶‍🌫️', '🫀', '🧿', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/Inhb4ts1A7zAYnQvjW6Ekv',
    ADMIN_LIST_PATH: './admin.json',
    IMAGE_PATH: 'https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg',
    NEWSLETTER_JID: '120363424546838736@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    NEWS_JSON_URL: '',
    BOT_NAME: '𝘾𝙃𝘼𝙏𝙃𝙐𝙒𝘼 𝙓 𝙈𝙄𝙉𝙄',
    OWNER_NAME: 'ƈԋαƚԋυɯα',
    OWNER_NUMBER: ORIGINAL_OWNER,
    BOT_VERSION: '1.0.0',
    BOT_FOOTER: '𝗖𝗛𝗔𝗧𝗛𝗨𝗪𝗔 𝗫 𝗠𝗜𝗡𝗜',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb6zdUyFsn0cyFknXz2t',
    BUTTON_IMAGES: {
        ALIVE: 'https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg',
        MENU: 'https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg',
        OWNER: 'https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg',
        SONG: 'https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg',
        VIDEO: 'https://cdn.phototourl.com/free/2026-06-30-6f0acaed-3fbd-40fc-b215-31440c3310e8.jpg'
    }
};

const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const mongoUri = 'mongodb+srv://dinu60970_db_user:RfGn7kG6A5jLe2px@cluster0.4yb6fvp.mongodb.net/';
const client = new MongoClient(mongoUri);
let db;

async function initMongo() {
    if (!db) {
        await client.connect();
        db = client.db('mcerror');
        await db.collection('sessions').createIndex({ number: 1 });
        await db.collection('extra_owners').createIndex({ botNumber: 1 });
    }
    return db;
}

const activeSockets = new Map();
const socketCreationTime = new Map();
const reconnectAttempts = new Map();
const logoutRetryCount = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';

if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

function loadAdmins() {
    try {
        if (fs.existsSync(config.ADMIN_LIST_PATH)) {
            return JSON.parse(fs.readFileSync(config.ADMIN_LIST_PATH, 'utf8'));
        }
        return [];
    } catch (error) {
        return [];
    }
}

function formatMessage(title, content, footer) {
    return `${title}\n\n${content}\n\n${footer}`;
}

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return (d > 0 ? d + "d " : "") + (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + s + "s";
}

async function joinGroup(socket) {
    let retries = 3;
    const inviteCodeMatch = config.GROUP_INVITE_LINK.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
    if (!inviteCodeMatch) return { status: 'failed', error: 'Invalid invite link' };
    const inviteCode = inviteCodeMatch[1];
    while (retries > 0) {
        try {
            const response = await socket.groupAcceptInvite(inviteCode);
            if (response?.gid) return { status: 'success', gid: response.gid };
        } catch (error) {
            retries--;
            if (retries === 0) return { status: 'failed', error: error.message };
            await delay(2000);
        }
    }
    return { status: 'failed', error: 'Max retries' };
}

async function sendAdminConnectMessage(socket, number) {
    const admins = loadAdmins();
    for (const admin of admins) {
        try {
            await socket.sendMessage(`${admin}@s.whatsapp.net`, {
                image: { url: config.IMAGE_PATH },
                caption: `*Connected*\nNumber: ${number}\nStatus: Online`
            });
        } catch (error) {}
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== config.NEWSLETTER_JID) return;
        try {
            const messageId = message.newsletterServerId;
            if (messageId) {
                await socket.newsletterReactMessage(config.NEWSLETTER_JID, messageId.toString(), '❤️');
            }
        } catch (error) {}
    });
}

async function deleteSessionFromMongo(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        await db.collection('sessions').deleteOne({ number: sanitizedNumber });
        console.log(`🗑️ Deleted session for ${sanitizedNumber}`);
    } catch (error) {}
}

async function markSessionInactive(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        await db.collection('sessions').updateOne(
            { number: sanitizedNumber },
            { $set: { active: false, disconnectedAt: new Date() } }
        );
        console.log(`📝 Marked session inactive for ${sanitizedNumber}`);
    } catch (error) {}
}

async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        const doc = await db.collection('sessions').findOne({ number: sanitizedNumber, active: true });
        if (doc?.creds) return JSON.parse(doc.creds);
    } catch (error) {}
    return null;
}

async function loadExtraOwners(botNumber) {
    try {
        const db = await initMongo();
        const doc = await db.collection('extra_owners').findOne({ botNumber });
        const owners = doc?.owners || [];
        extraOwnersMap.set(botNumber, owners);
        return owners;
    } catch (error) {
        return [];
    }
}

async function startKeepAlive(socket, phoneNumber) {
    if (socket.keepAliveInterval) clearInterval(socket.keepAliveInterval);
    if (socket.selfPingInterval) clearInterval(socket.selfPingInterval);
    const interval = setInterval(async () => {
        try {
            await socket.sendPresenceUpdate('available');
        } catch (err) {}
    }, 10 * 60 * 1000);
    socket.keepAliveInterval = interval;
    const selfPing = setInterval(async () => {
        if (!socket.user?.id) return;
        try {
            await socket.sendPresenceUpdate('available');
        } catch (err) {}
    }, 60 * 60 * 1000);
    socket.selfPingInterval = selfPing;
    const cleanup = () => {
        if (socket.keepAliveInterval) clearInterval(socket.keepAliveInterval);
        if (socket.selfPingInterval) clearInterval(socket.selfPingInterval);
        socket.keepAliveInterval = null;
        socket.selfPingInterval = null;
    };
    socket.ev.on('connection.update', (update) => {
        if (update.connection === 'close') cleanup();
    });
}

function setupAutoRestart(socket, number) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    let reconnectTimeout = null;
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.message || 'Unknown';
            console.log(`🔌 Connection closed for ${sanitizedNumber}, StatusCode: ${statusCode}, Reason: ${reason}`);
            activeSockets.delete(sanitizedNumber);
            socketCreationTime.delete(sanitizedNumber);
            if (statusCode === 401 || statusCode === 428 || reason.includes('logged out') || reason.includes('not authorized')) {
                const retryCount = (logoutRetryCount.get(sanitizedNumber) || 0) + 1;
                logoutRetryCount.set(sanitizedNumber, retryCount);
                if (retryCount <= 3) {
                    console.log(`🔄 Logout error ${retryCount}/3 - attempting reconnect...`);
                    if (reconnectTimeout) clearTimeout(reconnectTimeout);
                    reconnectTimeout = setTimeout(() => {
                        if (!activeSockets.has(sanitizedNumber)) EmpirePair(number, { headersSent: false, send: () => {}, status: () => ({}) });
                    }, 15000);
                } else {
                    console.log(`🚫 Permanent session failure after ${retryCount} attempts, clearing...`);
                    await markSessionInactive(sanitizedNumber);
                    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
                    if (fs.existsSync(sessionPath)) await fs.remove(sessionPath);
                    await deleteSessionFromMongo(sanitizedNumber);
                    logoutRetryCount.delete(sanitizedNumber);
                    if (reconnectTimeout) clearTimeout(reconnectTimeout);
                    reconnectTimeout = setTimeout(() => {
                        if (!activeSockets.has(sanitizedNumber)) EmpirePair(number, { headersSent: false, send: () => {}, status: () => ({}) });
                    }, 10000);
                }
            } else {
                const attempts = (reconnectAttempts.get(sanitizedNumber) || 0) + 1;
                reconnectAttempts.set(sanitizedNumber, attempts);
                let backoffDelay = Math.min(5000 * Math.pow(2, attempts - 1), 300000);
                console.log(`🔄 Temporary disconnect, reconnecting in ${backoffDelay/1000}s (Attempt ${attempts})`);
                if (reconnectTimeout) clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(() => {
                    if (!activeSockets.has(sanitizedNumber)) EmpirePair(number, { headersSent: false, send: () => {}, status: () => ({}) });
                }, backoffDelay);
            }
        } else if (connection === 'open') {
            reconnectAttempts.set(sanitizedNumber, 0);
            logoutRetryCount.set(sanitizedNumber, 0);
            console.log(`✅ Connection restored for ${sanitizedNumber}`);
        }
    });
}

async function sendMessageWithRetry(socket, jid, content, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await socket.sendMessage(jid, content);
        } catch (error) {
            if (error.message?.includes('Connection Closed') || error.statusCode === 428) {
                await delay(2000);
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

// ========== COMMAND HANDLER WITH FIXED PLUGIN EXECUTION ==========
function setupCommandHandlers(socket, botNumber) {
    socket.creationTime = socketCreationTime.get(botNumber) || Date.now();
    loadExtraOwners(botNumber).then(owners => {
        console.log(`📋 Loaded extra owners for ${botNumber}:`, owners);
    });
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;

        let command = null;
        let args = [];
        const chatJid = msg.key.remoteJid;
        
        // ✅ FIX: Get actual sender's JID (for groups use participant, for private use remoteJid)
        const actualSenderJid = msg.key.participant || msg.key.remoteJid;
        let senderNumber = actualSenderJid.split('@')[0];
        senderNumber = senderNumber.replace(/[^0-9]/g, '');
        
        let botJid = null;
        if (socket.user?.id) {
            botJid = jidNormalizedUser(socket.user.id).split('@')[0].replace(/[^0-9]/g, '');
        }
        
        const extraOwners = extraOwnersMap.get(botNumber) || [];
        const isOwner = (senderNumber === ORIGINAL_OWNER) ||
                        (botJid && senderNumber === botJid) ||
                        extraOwners.includes(senderNumber);
        
        const isMe = (senderNumber === currentBotNumber);
        const isGroup = chatJid.endsWith('@g.us');
        const isSudo = isOwner;

        // ========== 🆕 REACT TO SPECIFIC USERS (CUSTOM EMOJIS) ==========
        const userReacts = {
            "97912990253248": "👨🏻‍💻",
            "122286761861330":"☠️"
        };

        if (!global.reactedMessages) global.reactedMessages = new Map();
        const messageId = msg.key.id;
        const alreadyReacted = global.reactedMessages.get(messageId);

        // Make special users list globally available for plugins
        global.specialUsers = Object.keys(userReacts);

        // React only if: not already reacted, sender is in map, and not bot itself
        if (!alreadyReacted && userReacts[senderNumber] && !isMe) {
            try {
                await socket.sendMessage(chatJid, { react: { text: userReacts[senderNumber], key: msg.key } });
                global.reactedMessages.set(messageId, true);
            } catch (reactErr) {
                console.error('React error:', reactErr.message);
            }
        }
        // ========== END OF REACT SECTION ==========

        // Extract command text - FIXED SYNTAX ERROR
        let messageText = '';
        if (msg.message.conversation) {
            messageText = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            messageText = msg.message.extendedTextMessage.text;
        } else if (msg.message.buttonsResponseMessage?.selectedButtonId) {
            const btnId = msg.message.buttonsResponseMessage.selectedButtonId;
            if (btnId && btnId.startsWith(config.PREFIX)) {
                messageText = btnId;
            }
        }
        
        if (messageText && messageText.startsWith(config.PREFIX)) {
            const parts = messageText.slice(config.PREFIX.length).trim().split(/\s+/);
            command = parts[0].toLowerCase();
            args = parts.slice(1) || [];
        }

        if (!command) return;

        // ========== DYNAMIC WORK TYPE CHECK ==========
        let workType = 'public';
        try {
            workType = await getBotWorkType(botNumber);
        } catch (err) {
            console.error('Failed to get worktype:', err);
        }
        
        if (workType === "only_group") {
            if (!isGroup && !isMe && !isOwner && !isSudo) {
                console.log(`⛔ "${command}" blocked: only_group mode`);
                return;
            }
        } else if (workType === "private") {
            if (!isMe && !isOwner && !isSudo) {
                console.log(`⛔ "${command}" blocked: private mode`);
                return;
            }
        } else if (workType === "inbox") {
            if (isGroup && !isMe && !isOwner && !isSudo) {
                console.log(`⛔ "${command}" blocked: inbox mode`);
                return;
            }
        }

        console.log(`✅ Command: ${command} from ${senderNumber} in ${chatJid}`);

        // Execute plugin
        try {
            const executed = await executePlugin(
                command, socket, msg, args, chatJid, isOwner, isGroup, isMe,
                currentBotNumber, workType, config, sendMessageWithRetry,
                formatMessage, runtime, os, axios, sharp, fetch, ORIGINAL_OWNER,
                getUserEnv, updateUserEnv, getAllUserEnv
            );

            if (executed) return;
        } catch (pluginError) {
            console.error(`Plugin execution error for ${command}:`, pluginError);
        }

        // Unknown command
        await sendMessageWithRetry(socket, chatJid, {
            text: `❌ Unknown command: ${command}\n\nType .menu for available commands`,
            quoted: msg
        }).catch(err => console.error('Unknown command error:', err));
    });
}

// ========== MAIN PAIR FUNCTION ==========
async function EmpirePair(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    console.log(`🔄 Starting connection for ${sanitizedNumber}...`);
    
    if (activeSockets.has(sanitizedNumber)) {
        console.log(`⚠️ ${sanitizedNumber} already connected, skipping...`);
        if (res && !res.headersSent) res.send({ status: 'already_connected' });
        return;
    }
    
    await initUserEnvIfMissing(sanitizedNumber);
    await initEnvsettings(sanitizedNumber);
  
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
    await fs.ensureDir(sessionPath);

    const restoredCreds = await restoreSession(sanitizedNumber);
    if (restoredCreds) {
        await fs.writeFile(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
        console.log(`✅ Restored session for ${sanitizedNumber}`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: 'fatal' });

    try {
        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: ['Ubuntu', 'Chrome', '22.04'],
            defaultQueryTimeoutMs: undefined,
            keepAliveIntervalMs: 15000,
            connectTimeoutMs: 120000,
            reconnectInterval: 3000,
            reconnectTries: Number.MAX_SAFE_INTEGER,
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage || message.buttonsResponseMessage);
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                                ...message
                            }
                        }
                    };
                }
                return message;
            },
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            fireInitQueries: true
        });

        socketCreationTime.set(sanitizedNumber, Date.now());

        setupStatusHandlers(socket);
        setupCommandHandlers(socket, sanitizedNumber);
        setupMessageHandlers(socket);
        setupAutoRestart(socket, number);
        setupNewsletterHandlers(socket);
        setupAntiCallHandler(socket, ORIGINAL_OWNER);
        setupAntiDeleteHandler(socket, sanitizedNumber, ORIGINAL_OWNER, config.BOT_FOOTER);

        if (!socket.authState.creds.registered) {
            let code, retries = 3;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await socket.requestPairingCode(sanitizedNumber);
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await delay(2000);
                }
            }
            if (!res.headersSent) res.send({ code });
        } else {
            if (!res.headersSent) res.send({ status: 'already_paired' });
        }

        socket.ev.on('creds.update', async () => {
            await saveCreds();
            const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
            const db = await initMongo();
            const sessionId = uuidv4();
            await db.collection('sessions').updateOne(
                { number: sanitizedNumber },
                { $set: { sessionId, number: sanitizedNumber, creds: fileContent, active: true, updatedAt: new Date() } },
                { upsert: true }
            );
            console.log(`✅ Saved creds for ${sanitizedNumber}`);
        });

        socket.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                console.log(`✅ Connection OPEN for ${sanitizedNumber}`);
                try {
                    await delay(3000);
                    const userJid = jidNormalizedUser(socket.user.id);
                    currentBotNumber = userJid.split('@')[0];
                    console.log(`🤖 Bot connected as: ${currentBotNumber}`);
                    
                    reconnectAttempts.set(sanitizedNumber, 0);
                    logoutRetryCount.set(sanitizedNumber, 0);
                    
                    await startKeepAlive(socket, sanitizedNumber);
                    await joinGroup(socket);
                    try {
                        await socket.newsletterFollow(config.NEWSLETTER_JID);
                        await socket.sendMessage(config.NEWSLETTER_JID, { react: { text: '❤️', key: { id: config.NEWSLETTER_MESSAGE_ID } } });
                        console.log('✅ Auto-followed newsletter');
                    } catch (error) {
                        console.error('❌ Newsletter error:', error.message);
                    }
                    
                    activeSockets.set(sanitizedNumber, socket);
                    await socket.sendMessage(userJid, {
                        image: { url: config.IMAGE_PATH },
                        caption: formatMessage('*✅ Bot Connected*', `Number: ${sanitizedNumber}\n\n.menu for commands`, config.BOT_FOOTER)
                    });
                    await sendAdminConnectMessage(socket, sanitizedNumber);
                    
                    let numbers = [];
                    if (fs.existsSync(NUMBER_LIST_PATH)) numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
                    if (!numbers.includes(sanitizedNumber)) {
                        numbers.push(sanitizedNumber);
                        fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
                    }
                    console.log(`✅ ${sanitizedNumber} is now online!`);
                } catch (error) {
                    console.error('Connection error:', error);
                }
            }
        });
        
    } catch (error) {
        console.error('Pairing error for', sanitizedNumber, ':', error.message);
        socketCreationTime.delete(sanitizedNumber);
        activeSockets.delete(sanitizedNumber);
        if (!res.headersSent) res.status(503).send({ error: 'Service Unavailable: ' + error.message });
    }
}

// ========== EXPRESS ROUTES ==========
router.get('/', async (req, res) => {
    const { number, force } = req.query;
    if (!number) return res.status(400).send({ error: 'Number parameter is required' });
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    if (activeSockets.has(sanitizedNumber)) return res.status(200).send({ status: 'already_connected' });
    if (force === 'true') {
        await deleteSessionFromMongo(sanitizedNumber);
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        if (fs.existsSync(sessionPath)) await fs.remove(sessionPath);
    }
    await EmpirePair(number, res);
});

router.get('/active', (req, res) => {
    res.status(200).send({ count: activeSockets.size, numbers: Array.from(activeSockets.keys()) });
});

router.get('/ping', (req, res) => {
    res.status(200).send({ status: 'active', activesession: activeSockets.size });
});

router.get('/reconnect', async (req, res) => {
    try {
        const db = await initMongo();
        const docs = await db.collection('sessions').find({ active: true }).toArray();
        for (const doc of docs) {
            const number = doc.number;
            if (!activeSockets.has(number)) {
                EmpirePair(number, { headersSent: false, send: () => {}, status: () => ({}) });
                await delay(2000);
            }
        }
        res.status(200).send({ status: 'success' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

process.on('exit', () => {
    activeSockets.forEach((socket) => { 
        try { 
            socket.ws?.close(); 
            if (socket.keepAliveInterval) clearInterval(socket.keepAliveInterval);
            if (socket.selfPingInterval) clearInterval(socket.selfPingInterval);
        } catch (err) {} 
    });
    activeSockets.clear();
    socketCreationTime.clear();
    reconnectAttempts.clear();
    logoutRetryCount.clear();
    client.close();
});

process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

setTimeout(async () => {
    try {
        await initMongo();
        const docs = await db.collection('sessions').find({ active: true }).toArray();
        console.log(`🔄 Found ${docs.length} active sessions in DB, restoring...`);
        for (const doc of docs) {
            const number = doc.number;
            if (!activeSockets.has(number)) {
                console.log(`🔄 Auto-reconnecting ${number} on startup...`);
                EmpirePair(number, { headersSent: false, send: () => {}, status: () => ({}) });
                await delay(3000);
            }
        }
        console.log('✅ Auto-reconnect completed on startup');
    } catch (error) {
        console.log('⚠️ Auto-reconnect skipped:', error.message);
    }
}, 10000);

module.exports = router;
