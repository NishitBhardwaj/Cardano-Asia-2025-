/**
 * Telegram Bot API Utilities
 * 
 * Server-side utilities for interacting with Telegram Bot API
 * All functions must be called from server code only (API routes)
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * Get Telegram bot token from environment variables
 * Throws error if not configured
 */
export function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set. Please configure it in .env.local');
    }
    return token;
}

/**
 * Get Telegram agent chat ID from environment variables
 * Returns null if not configured
 */
export function getAgentChatId(): string | null {
    return process.env.TELEGRAM_AGENT_CHAT_ID || null;
}

/**
 * Send a plain text message to a Telegram chat
 */
export async function sendMessage(chatId: string | number, text: string): Promise<void> {
    const token = getBotToken();
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ description: 'Unknown error' }));
        throw new Error(error.description || `Failed to send message: ${response.statusText}`);
    }
}

/**
 * Send a Markdown-formatted message to a Telegram chat
 * Uses MarkdownV2 format
 */
export async function sendMarkdownMessage(chatId: string | number, text: string): Promise<void> {
    const token = getBotToken();
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'MarkdownV2',
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ description: 'Unknown error' }));
        throw new Error(error.description || `Failed to send markdown message: ${response.statusText}`);
    }
}

/**
 * Answer a callback query (for inline buttons)
 */
export async function answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert: boolean = false
): Promise<void> {
    const token = getBotToken();
    const url = `${TELEGRAM_API_BASE}/bot${token}/answerCallbackQuery`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text,
            show_alert: showAlert,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ description: 'Unknown error' }));
        throw new Error(error.description || `Failed to answer callback query: ${response.statusText}`);
    }
}
