import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
// Agent Sumanth's chat ID - you can get this by:
// 1. Start a chat with the bot on Telegram
// 2. Send a message
// 3. Call GET /api/telegram/get-chat-id to see the chat ID
const AGENT_CHAT_ID = process.env.TELEGRAM_AGENT_CHAT_ID || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userMessage, userInfo } = body;

        // Format message for agent Sumanth
        const message = `🔔 <b>New Support Request from DonateDAO</b>\n\n` +
            `📝 <b>User Message:</b>\n${userMessage}\n\n` +
            `⏰ <b>Timestamp:</b> ${new Date().toLocaleString()}\n\n` +
            `Please respond to assist the user.`;

        // Try to get agent chat ID from environment or find it
        let chatId = AGENT_CHAT_ID;

        // If no chat ID configured, try to find it from recent updates
        if (!chatId) {
            const updatesResponse = await fetch(`${TELEGRAM_API_URL}/getUpdates`);
            const updates = await updatesResponse.json();

            if (updates.ok && updates.result && updates.result.length > 0) {
                // Find the most recent message from a user (not from bot)
                for (let i = updates.result.length - 1; i >= 0; i--) {
                    const update = updates.result[i];
                    if (update.message && !update.message.from?.is_bot) {
                        chatId = update.message.chat.id.toString();
                        break;
                    }
                }
            }
        }

        if (!chatId) {
            // Return instructions for setup
            return NextResponse.json({ 
                success: false, 
                message: 'Agent chat ID not configured',
                instructions: [
                    '1. Start a conversation with the bot on Telegram',
                    '2. Send any message to the bot',
                    '3. Visit /api/telegram/get-chat-id to get your chat ID',
                    '4. Set TELEGRAM_AGENT_CHAT_ID environment variable',
                    'OR',
                    'Contact the bot directly: @DonateDAOSupport_bot'
                ],
                telegramBot: '@DonateDAOSupport_bot'
            }, { status: 400 });
        }

        // Send message to Telegram agent
        const sendResponse = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const sendData = await sendResponse.json();

        if (!sendResponse.ok) {
            console.error('Telegram API error:', sendData);
            throw new Error(sendData.description || 'Failed to send message to Telegram');
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Connected to agent Sumanth successfully',
            chatId: chatId
        });

    } catch (error: any) {
        console.error('Telegram connection error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to connect to Telegram agent',
                fallback: 'Please contact @DonateDAOSupport_bot directly on Telegram'
            },
            { status: 500 }
        );
    }
}

