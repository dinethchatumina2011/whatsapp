// logger.js
const fs = require('fs-extra');
const path = require('path');

const LOGS_DIR = path.join(__dirname, 'logs');
const ERROR_LOG_FILE = path.join(LOGS_DIR, 'error.log');
const CONNECTION_LOG_FILE = path.join(LOGS_DIR, 'connection.log');
const COMMAND_LOG_FILE = path.join(LOGS_DIR, 'command.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Get current timestamp
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Log error to file
async function logError(error, context = {}) {
    const logEntry = {
        timestamp: getTimestamp(),
        type: 'ERROR',
        message: error.message || error,
        stack: error.stack,
        context: context
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(ERROR_LOG_FILE, logLine);
    console.error(`❌ [ERROR] ${error.message}`);
    return logEntry;
}

// Log connection event
async function logConnection(event, details = {}) {
    const logEntry = {
        timestamp: getTimestamp(),
        type: 'CONNECTION',
        event: event,
        details: details
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(CONNECTION_LOG_FILE, logLine);
    console.log(`🔌 [CONNECTION] ${event}`);
}

// Log command
async function logCommand(command, from, args = []) {
    const logEntry = {
        timestamp: getTimestamp(),
        type: 'COMMAND',
        command: command,
        from: from,
        args: args
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(COMMAND_LOG_FILE, logLine);
}

// Get recent errors
async function getRecentErrors(limit = 20) {
    try {
        if (!fs.existsSync(ERROR_LOG_FILE)) return [];
        const content = await fs.readFile(ERROR_LOG_FILE, 'utf8');
        const lines = content.trim().split('\n').filter(l => l);
        const errors = lines.slice(-limit).map(l => JSON.parse(l));
        return errors.reverse();
    } catch (error) {
        return [];
    }
}

// Get connection logs
async function getConnectionLogs(limit = 50) {
    try {
        if (!fs.existsSync(CONNECTION_LOG_FILE)) return [];
        const content = await fs.readFile(CONNECTION_LOG_FILE, 'utf8');
        const lines = content.trim().split('\n').filter(l => l);
        return lines.slice(-limit).map(l => JSON.parse(l)).reverse();
    } catch (error) {
        return [];
    }
}

// Clear logs
async function clearLogs() {
    try {
        await fs.writeFile(ERROR_LOG_FILE, '');
        await fs.writeFile(CONNECTION_LOG_FILE, '');
        await fs.writeFile(COMMAND_LOG_FILE, '');
        console.log('✅ Logs cleared');
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    logError,
    logConnection,
    logCommand,
    getRecentErrors,
    getConnectionLogs,
    clearLogs
};
