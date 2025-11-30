/**
 * In-Memory Telegram Session Store
 * 
 * NOTE: This is a simple in-memory store for demo/hackathon purposes.
 * In production, use a proper database (Redis, PostgreSQL, etc.) as serverless
 * functions can lose memory between invocations.
 * 
 * This store bridges web chat messages with Telegram agent responses.
 */

export interface ChatMessage {
    id: string;
    role: 'user' | 'agent';
    text: string;
    timestamp: number;
}

// In-memory store: Map<sessionId, ChatMessage[]>
const sessionStore = new Map<string, ChatMessage[]>();

// Cleanup old sessions (older than 24 hours)
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Ensure a session exists in the store
 */
export function ensureSession(sessionId: string): void {
    if (!sessionStore.has(sessionId)) {
        sessionStore.set(sessionId, []);
    }
}

/**
 * Append a message to a session
 */
export function appendMessage(sessionId: string, message: ChatMessage): void {
    ensureSession(sessionId);
    const messages = sessionStore.get(sessionId)!;
    messages.push(message);
    sessionStore.set(sessionId, messages);
}

/**
 * Get all messages for a session
 */
export function getMessages(sessionId: string): ChatMessage[] {
    ensureSession(sessionId);
    return sessionStore.get(sessionId) || [];
}

/**
 * Get messages after a specific timestamp
 */
export function getMessagesSince(sessionId: string, since: number): ChatMessage[] {
    const allMessages = getMessages(sessionId);
    return allMessages.filter(msg => msg.timestamp > since);
}

/**
 * Cleanup old sessions (call periodically if needed)
 */
export function cleanupOldSessions(): void {
    const now = Date.now();
    const sessionsToDelete: string[] = [];

    sessionStore.forEach((messages, sessionId) => {
        if (messages.length === 0) {
            // Empty session, can be deleted
            sessionsToDelete.push(sessionId);
            return;
        }

        // Check if last message is older than TTL
        const lastMessage = messages[messages.length - 1];
        if (now - lastMessage.timestamp > SESSION_TTL) {
            sessionsToDelete.push(sessionId);
        }
    });

    sessionsToDelete.forEach(sessionId => sessionStore.delete(sessionId));
}

/**
 * Get session count (for debugging)
 */
export function getSessionCount(): number {
    return sessionStore.size;
}

