// mongodbSettings.js
const { MongoClient } = require('mongodb');

const mongoUri = 'mongodb+srv://dinu60970_db_user:RfGn7kG6A5jLe2px@cluster0.4yb6fvp.mongodb.net/';
const client = new MongoClient(mongoUri);
let db;

async function initMongo() {
    if (!db) {
        await client.connect();
        db = client.db('mcerror');
        
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        if (!collectionNames.includes('user_env')) {
            await db.createCollection('user_env');
            console.log('✅ Created user_env collection');
        }
        if (!collectionNames.includes('sessions')) {
            await db.createCollection('sessions');
            await db.collection('sessions').createIndex({ number: 1 });
            console.log('✅ Created sessions collection');
        }
        if (!collectionNames.includes('bot_config')) {
            await db.createCollection('bot_config');
            await db.collection('bot_config').createIndex({ key: 1, botNumber: 1 }, { unique: true });
            console.log('✅ Created bot_config collection');
        }
        console.log('✅ MongoDB connected');
    }
    return db;
}

const DEFAULT_SETTINGS = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'on',
    AUTO_LIKE_EMOJI: ['❤️', '💜', '💙', '💚', '💛'],
    ANTI_CALL: 'on',
    ANTI_DELETE: 'on',
    AUTO_REACT: 'off',
    PRESENCE_TYPE: 'on'
};

async function getUserEnv(key, number) {
    try {
        if (!number) return key ? DEFAULT_SETTINGS[key] : DEFAULT_SETTINGS;
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        if (!sanitizedNumber) return key ? DEFAULT_SETTINGS[key] : DEFAULT_SETTINGS;
        const db = await initMongo();
        const user = await db.collection('user_env').findOne({ number: sanitizedNumber });
        if (!user || !user.settings) return key ? DEFAULT_SETTINGS[key] : DEFAULT_SETTINGS;
        if (key) return user.settings[key] !== undefined ? user.settings[key] : DEFAULT_SETTINGS[key];
        return { ...DEFAULT_SETTINGS, ...user.settings };
    } catch (error) {
        console.error('Error in getUserEnv:', error);
        return key ? DEFAULT_SETTINGS[key] : DEFAULT_SETTINGS;
    }
}

async function updateUserEnv(key, value, number) {
    try {
        if (!number) return false;
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        if (!sanitizedNumber) return false;
        const db = await initMongo();
        await db.collection('user_env').updateOne(
            { number: sanitizedNumber },
            { $set: { [`settings.${key}`]: value, updatedAt: new Date() } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Error in updateUserEnv:', error);
        return false;
    }
}

async function getAllUserEnv(number) {
    try {
        if (!number) return DEFAULT_SETTINGS;
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        if (!sanitizedNumber) return DEFAULT_SETTINGS;
        const db = await initMongo();
        const user = await db.collection('user_env').findOne({ number: sanitizedNumber });
        if (user && user.settings) return { ...DEFAULT_SETTINGS, ...user.settings };
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error in getAllUserEnv:', error);
        return DEFAULT_SETTINGS;
    }
}

async function initUserEnvIfMissing(number) {
    try {
        if (!number) return;
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        if (!sanitizedNumber) return;
        const db = await initMongo();
        const existing = await db.collection('user_env').findOne({ number: sanitizedNumber });
        if (!existing) {
            await db.collection('user_env').insertOne({
                number: sanitizedNumber,
                settings: DEFAULT_SETTINGS,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Initialized default settings for ${sanitizedNumber}`);
        }
    } catch (error) {
        console.error('Error in initUserEnvIfMissing:', error);
    }
}

async function initEnvsettings(number) {
    return await initUserEnvIfMissing(number);
}

async function saveSessionToMongo(number, credsData) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        await db.collection('sessions').updateOne(
            { number: sanitizedNumber },
            { $set: { creds: credsData, active: true, updatedAt: new Date() } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
}

async function restoreSessionFromMongo(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        const doc = await db.collection('sessions').findOne({ number: sanitizedNumber });
        if (doc?.creds) return JSON.parse(doc.creds);
    } catch (error) { console.error('Error restoring session:', error); }
    return null;
}

async function deleteSessionFromMongo(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        await db.collection('sessions').deleteOne({ number: sanitizedNumber });
        return true;
    } catch (error) { console.error('Error deleting session:', error); return false; }
}

async function markSessionInactive(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const db = await initMongo();
        await db.collection('sessions').updateOne(
            { number: sanitizedNumber },
            { $set: { active: false, disconnectedAt: new Date() } }
        );
        return true;
    } catch (error) { console.error('Error marking session inactive:', error); return false; }
}

async function getActiveSessions() {
    try {
        const db = await initMongo();
        const docs = await db.collection('sessions').find({ active: true }).toArray();
        return docs.map(doc => doc.number);
    } catch (error) { console.error('Error getting active sessions:', error); return []; }
}

// ========== WORK TYPE FUNCTIONS (ADDED) ==========
async function getBotWorkType(botNumber) {
    try {
        if (!botNumber) return 'public';
        const sanitizedNumber = botNumber.replace(/[^0-9]/g, '');
        if (!sanitizedNumber) return 'public';
        const db = await initMongo();
        const doc = await db.collection('bot_config').findOne({ key: 'work_type', botNumber: sanitizedNumber });
        const workType = doc?.value || 'public';
        console.log(`📌 Work type for ${sanitizedNumber}: ${workType}`);
        return workType;
    } catch (error) {
        console.error('getBotWorkType error:', error);
        return 'public';
    }
}

async function updateBotWorkType(botNumber, newType) {
    try {
        if (!botNumber) return false;
        const sanitizedNumber = botNumber.replace(/[^0-9]/g, '');
        if (!sanitizedNumber) return false;
        const db = await initMongo();
        await db.collection('bot_config').updateOne(
            { key: 'work_type', botNumber: sanitizedNumber },
            { $set: { value: newType, updatedAt: new Date() } },
            { upsert: true }
        );
        console.log(`✅ Updated work type for bot ${sanitizedNumber} to ${newType}`);
        return true;
    } catch (error) {
        console.error('updateBotWorkType error:', error);
        return false;
    }
}

// ========== ANTI-CALL FUNCTION (ADDED) ==========
async function getAntiCallStatus(number) {
    try {
        const status = await getUserEnv('ANTI_CALL', number);
        return status || 'on';
    } catch (error) {
        return 'on';
    }
}

// ========== EXPORT ALL FUNCTIONS ==========
module.exports = {
    initMongo,
    getUserEnv,
    updateUserEnv,
    getAllUserEnv,
    initUserEnvIfMissing,
    initEnvsettings,
    saveSessionToMongo,
    restoreSessionFromMongo,
    deleteSessionFromMongo,
    markSessionInactive,
    getActiveSessions,
    getBotWorkType,        // Added
    updateBotWorkType,     // Added
    getAntiCallStatus,     // Added
    DEFAULT_SETTINGS
};
