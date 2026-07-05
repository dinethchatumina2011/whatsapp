module.exports = {
    name: 'adaderana',
    async execute(
        socket, msg, args, sender, isOwner, isGroup, isMe,
        currentBotNumber, config, sendMessageWithRetry, formatMessage,
        runtime, os, axios, sharp, fetch, OWNER_NUMBER,
        getUserEnv, updateUserEnv, getAllUserEnv
    ) {
        const senderJid = (typeof sender === 'string') ? sender : (sender?.split('@')[0] || msg?.key?.remoteJid);
        const prefix = config?.PREFIX || '.';
        const limit = args[0] && !isNaN(args[0]) ? Math.min(parseInt(args[0]), 20) : 10;
        const apiUrl = `https://mr-thinuzz-api-build.zone.id/api/adaderana/?limit=${limit}&apiKey=key_4797e0dcedd66cca`;

        await socket.sendPresenceUpdate('composing', senderJid);

        try {
            const response = await axios.get(apiUrl);
            const result = response.data;

            if (!result || !result.status || !result.data || !result.data.news || result.data.news.length === 0) {
                const text = `📰 *No news found* from Ada Derana at the moment.\nTry again later.`;
                await (sendMessageWithRetry?.(socket, senderJid, { text, quoted: msg }) ||
                    socket.sendMessage(senderJid, { text, quoted: msg }));
                return true;
            }

            const articles = result.data.news;
            const totalNews = result.data.total_news || articles.length;

            let newsText = `📰 *ADA DERANA LATEST NEWS* (${articles.length}/${totalNews})\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            articles.forEach((article, idx) => {
                const title = article.title || 'No title';
                const description = article.teaser || article.article_details?.short_description || '';
                const shortDesc = description.length > 100 ? description.slice(0, 100) + '…' : description;
                const link = article.url || '#';
                newsText += `${idx + 1}. *${title}*\n📌 ${shortDesc}\n🔗 ${link}\n\n`;
            });

            newsText += `━━━━━━━━━━━━━━━━━━━━━━\n_Use ${prefix}adaderana <number> to get more/less news (max 20)_`;

            await (sendMessageWithRetry?.(socket, senderJid, { text: newsText, quoted: msg }) ||
                socket.sendMessage(senderJid, { text: newsText, quoted: msg }));

        } catch (error) {
            console.error('Ada Derana News Error:', error);
            let errorMsg = `❌ *Failed to fetch Ada Derana news*\n`;
            if (error.response) {
                errorMsg += `API status: ${error.response.status}`;
            } else if (error.request) {
                errorMsg += `No response from API server`;
            } else {
                errorMsg += error.message || 'Unknown error';
            }
            errorMsg += `\nPlease try again later.`;

            try {
                await (sendMessageWithRetry?.(socket, senderJid, { text: errorMsg, quoted: msg }) ||
                    socket.sendMessage(senderJid, { text: errorMsg, quoted: msg }));
            } catch (e) {
                console.error('Final error sending news error message:', e);
            }
        }

        return true;
    }
};
