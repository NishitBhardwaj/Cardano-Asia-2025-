import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, getAgentChatId } from '@/lib/utils/telegram';
import { ensureSession, appendMessage } from '@/lib/store/telegramSessions';

/**
 * POST /api/telegram/connect
 * 
 * Called when user clicks "Connect to Agent" in the chatbot
 * Creates/updates a session and sends message to Telegram agent
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, userMessage, userInfo } = body;

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'sessionId is required' },
                { status: 400 }
            );
        }

        if (!userMessage) {
            return NextResponse.json(
                { success: false, error: 'userMessage is required' },
                { status: 400 }
            );
        }

        // Ensure session exists
        ensureSession(sessionId);

        // Append user message to session
        appendMessage(sessionId, {
            id: Date.now().toString(),
            role: 'user',
            text: userMessage,
            timestamp: Date.now(),
        });

        // Get agent chat ID
        const agentChatId = getAgentChatId();
        if (!agentChatId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'TELEGRAM_AGENT_CHAT_ID not configured',
                    instructions: [
                        '1. Start a conversation with the bot on Telegram',
                        '2. Send any message to the bot',
                        '3. Visit /api/telegram/get-chat-id to get your chat ID',
                        '4. Set TELEGRAM_AGENT_CHAT_ID in .env.local',
                    ],
                },
                { status: 400 }
            );
        }

        // Format message for agent
        const userEmail = userInfo?.email || 'anonymous';
        const username = userInfo?.username || 'anonymous';
        const formattedMessage = `🆕 New support request from DonateDAO\n\n` +
            `Session: \`${sessionId}\`\n` +
            `User: ${username} (${userEmail})\n\n` +
            `Last message:\n${userMessage}\n\n` +
            `💬 Reply with: #sess:${sessionId} Your reply here`;

        // Send to Telegram
        await sendMessage(agentChatId, formattedMessage);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Telegram connect error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to connect to Telegram agent',
            },
            { status: 500 }
        );
    }
}
