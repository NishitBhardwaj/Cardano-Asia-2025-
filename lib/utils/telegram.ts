/**
 * Telegram Bot Utility Functions
 */

const TELEGRAM_BOT_TOKEN = '8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramMessage {
    chat_id: string | number;
    text: string;
    parse_mode?: 'HTML' | 'Markdown';
    reply_markup?: any;
}

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });

        const data = await response.json();
        return data.ok === true;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return false;
    }
}

/**
 * Get bot updates (messages sent to the bot)
 */
export async function getTelegramUpdates(offset?: number) {
    try {
        const url = `${TELEGRAM_API_URL}/getUpdates${offset ? `?offset=${offset}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting Telegram updates:', error);
        return null;
    }
}

/**
 * Set webhook URL for receiving messages
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
        const data = await response.json();
        return data.ok === true;
    } catch (error) {
        console.error('Error setting Telegram webhook:', error);
        return false;
    }
}

/**
 * Get bot information
 */
export async function getBotInfo() {
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting bot info:', error);
        return null;
    }
}

