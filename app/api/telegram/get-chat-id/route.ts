import { NextRequest, NextResponse } from 'next/server';
import { getBotToken } from '@/lib/utils/telegram';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * GET /api/telegram/get-chat-id
 * 
 * Helper endpoint to get chat IDs from recent Telegram updates
 * Helps find the agent's chat ID for configuration
 */
export async function GET(request: NextRequest) {
    try {
        const token = getBotToken();
        const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getUpdates`);
        
        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Telegram API error: ${response.status} ${response.statusText}`,
                },
                { status: response.status }
            );
        }
        
        const data = await response.json();

        if (!data.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: data.description || 'Failed to get updates',
                },
                { status: 400 }
            );
        }

        // Extract unique chat IDs
        const chats = new Map();

        if (data.result && Array.isArray(data.result) && data.result.length > 0) {
            data.result.forEach((update: any) => {
                if (update.message && update.message.chat && update.message.chat.id) {
                    const chat = update.message.chat;
                    const from = update.message.from;

                    if (!chats.has(chat.id)) {
                        chats.set(chat.id, {
                            chatId: chat.id,
                            chatType: chat.type || 'unknown',
                            username: chat.username || from?.username || null,
                            firstName: chat.first_name || from?.first_name || null,
                            lastName: chat.last_name || from?.last_name || null,
                            lastMessage: update.message.text ? update.message.text.substring(0, 100) : null,
                            lastMessageDate: update.message.date 
                                ? new Date(update.message.date * 1000).toISOString() 
                                : null,
                        });
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Chat IDs retrieved successfully',
            chats: Array.from(chats.values()),
            instructions: [
                '1. Find your chat ID (agent) from the list above',
                '2. Set it as TELEGRAM_AGENT_CHAT_ID in .env.local',
                '3. Make sure the bot has received at least one message from the agent',
            ],
        });

    } catch (error: any) {
        console.error('Error getting chat IDs:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to get chat IDs',
            },
            { status: 500 }
        );
    }
}
