import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Webhook to receive messages from Telegram
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Handle incoming message from Telegram
        if (body.message) {
            const { chat, text, from } = body.message;
            
            // Log the message (in production, you'd process this and respond)
            console.log('Received Telegram message:', {
                chatId: chat.id,
                from: from?.username || from?.first_name,
                text: text,
            });

            // Auto-respond if needed
            if (text && text.toLowerCase().includes('hello')) {
                await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat.id,
                        text: `Hello! This is Sumanth, your DonateDAO support agent. How can I help you today?`,
                    }),
                });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

// GET method to set webhook (for initial setup)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'set-webhook') {
        const webhookUrl = searchParams.get('url') || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telegram/webhook`;
        
        try {
            const response = await fetch(`${TELEGRAM_API_URL}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
            const data = await response.json();
            
            return NextResponse.json({ 
                success: data.ok, 
                message: data.description || 'Webhook set successfully',
                data 
            });
        } catch (error: any) {
            return NextResponse.json({ 
                success: false, 
                error: error.message 
            }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Telegram webhook endpoint' });
}

