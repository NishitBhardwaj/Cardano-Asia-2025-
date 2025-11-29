import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Get chat IDs from recent Telegram updates
 * This helps you find the agent's chat ID for configuration
 */
export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/getUpdates`);
        const data = await response.json();

        if (!data.ok) {
            return NextResponse.json({ 
                success: false, 
                error: data.description || 'Failed to get updates' 
            }, { status: 400 });
        }

        // Extract unique chat IDs
        const chats = new Map();
        
        if (data.result && data.result.length > 0) {
            data.result.forEach((update: any) => {
                if (update.message) {
                    const chat = update.message.chat;
                    const from = update.message.from;
                    
                    if (!chats.has(chat.id)) {
                        chats.set(chat.id, {
                            chatId: chat.id,
                            chatType: chat.type,
                            username: chat.username || from?.username,
                            firstName: chat.first_name || from?.first_name,
                            lastName: chat.last_name || from?.last_name,
                            lastMessage: update.message.text,
                            lastMessageDate: new Date(update.message.date * 1000).toISOString(),
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
                '1. Find your chat ID (agent Sumanth) from the list above',
                '2. Set it as TELEGRAM_AGENT_CHAT_ID environment variable',
                '3. Or use it directly in the connect API',
                '',
                'Note: Make sure the bot has received at least one message from the agent'
            ]
        });

    } catch (error: any) {
        console.error('Error getting chat IDs:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to get chat IDs' 
            },
            { status: 500 }
        );
    }
}

