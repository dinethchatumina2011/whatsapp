const fs = require('fs');
const path = require('path');

const plugins = new Map();

// Load all plugins from the plugins folder
function loadPlugins() {
    const pluginsDir = __dirname;
    const files = fs.readdirSync(pluginsDir);
    
    for (const file of files) {
        if (file !== 'index.js' && file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin.name && plugin.execute) {
                    plugins.set(plugin.name, plugin);
                    console.log(`✅ Loaded plugin: ${plugin.name}`);
                }
            } catch (error) {
                console.error(`❌ Failed to load plugin ${file}:`, error.message);
            }
        }
    }
}

// Execute plugin command
async function executePlugin(command, socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, WORK_TYPE, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv) {
    const plugin = plugins.get(command);
    
    if (plugin) {
        // Check work type restrictions
        if (WORK_TYPE === "only_group" && !isGroup && !isMe && !isOwner) return false;
        if (WORK_TYPE === "private" && !isMe && !isOwner) return false;
        if (WORK_TYPE === "inbox" && isGroup && !isMe && !isOwner) return false;
        
        try {
            await plugin.execute(socket, msg, args, sender, isOwner, isGroup, isMe, currentBotNumber, config, sendMessageWithRetry, formatMessage, runtime, os, axios, sharp, fetch, OWNER_NUMBER, getUserEnv, updateUserEnv, getAllUserEnv);
            return true;
        } catch (error) {
            console.error(`Plugin error (${command}):`, error);
            await sendMessageWithRetry(socket, sender, { text: '❌ An error occurred in plugin.', quoted: msg });
            return true;
        }
    }
    
    return false;
}

// Get all plugin names
function getPluginNames() {
    return Array.from(plugins.keys());
}

// Initialize
loadPlugins();

module.exports = { executePlugin, getPluginNames, loadPlugins };
