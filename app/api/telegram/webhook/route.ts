import { NextRequest, NextResponse } from 'next/server';
import { getBotToken, sendMessage } from '@/lib/utils/telegram';
import { appendMessage } from '@/lib/store/telegramSessions';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * POST /api/telegram/webhook
 * 
 * Webhook endpoint configured in BotFather
 * Receives messages from Telegram and processes agent replies
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle incoming message
        if (body.message) {
            const { chat, text, from } = body.message;

            if (!text) {
                return NextResponse.json({ ok: true });
            }

            // Parse session ID from message format: #sess:<SESSION_ID> Your reply here
            const sessionMatch = text.match(/^#sess:([a-zA-Z0-9-]+)\s+([\s\S]+)$/);

            if (sessionMatch) {
                const [, sessionId, replyText] = sessionMatch;

                // Add agent message to session
                appendMessage(sessionId, {
                    id: Date.now().toString(),
                    role: 'agent',
                    text: replyText.trim(),
                    timestamp: Date.now(),
                });

                // Optional: Confirm delivery to agent
                await sendMessage(chat.id, `✅ Reply sent to session ${sessionId.substring(0, 8)}...`);
            } else {
                // Message doesn't match format, log for debugging
                console.log('Received Telegram message without session format:', {
                    chatId: chat.id,
                    from: from?.username || from?.first_name,
                    text: text.substring(0, 100), // Log first 100 chars
                });
            }
        }

        // Handle callback queries (for inline buttons)
        if (body.callback_query) {
            // Could handle button clicks here if needed
            console.log('Callback query received:', body.callback_query);
        }

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error('Webhook error:', error);
        // Always return ok: true to prevent Telegram from retrying
        return NextResponse.json({ ok: true, error: error.message });
    }
}

/**
 * GET /api/telegram/webhook?action=set-webhook
 * 
 * Helper endpoint to set the webhook URL in Telegram
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'set-webhook') {
        try {
            const token = getBotToken();
            const webhookUrl = searchParams.get('url') || 
                `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/telegram/webhook`;

            const response = await fetch(
                `${TELEGRAM_API_BASE}/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
            );
            const data = await response.json();

            return NextResponse.json({
                success: data.ok,
                message: data.description || 'Webhook set successfully',
                webhookUrl: webhookUrl,
                data: data,
            });

        } catch (error: any) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message || 'Failed to set webhook',
                },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({
        message: 'Telegram webhook endpoint',
        usage: 'GET /api/telegram/webhook?action=set-webhook&url=<your-webhook-url>',
    });
}
