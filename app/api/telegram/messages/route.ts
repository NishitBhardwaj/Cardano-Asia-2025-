import { NextRequest, NextResponse } from 'next/server';
import { getMessagesSince } from '@/lib/store/telegramSessions';

/**
 * GET /api/telegram/messages
 * 
 * Polled by frontend to get new agent messages
 * Query params: ?sessionId=...&since=timestamp
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sessionId = searchParams.get('sessionId');
        const sinceParam = searchParams.get('since');

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'sessionId query parameter is required' },
                { status: 400 }
            );
        }

        const since = sinceParam ? parseInt(sinceParam, 10) : 0;
        
        if (isNaN(since)) {
            return NextResponse.json(
                { success: false, error: 'since parameter must be a valid timestamp' },
                { status: 400 }
            );
        }

        // Get messages since the specified timestamp
        const messages = getMessagesSince(sessionId, since);

        return NextResponse.json({
            success: true,
            messages: messages,
        });

    } catch (error: any) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to get messages',
            },
            { status: 500 }
        );
    }
}

