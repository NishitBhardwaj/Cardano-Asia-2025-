# Telegram Bot Setup Guide

This guide explains how to set up the Telegram bot integration for agent handoff in the DonateDAO chatbot.

## Overview

The chatbot can automatically connect users to a Telegram agent (Sumanth) when it cannot answer their questions. The integration uses the Telegram Bot API.

## Bot Token

The bot token is already configured:
```
8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk
```

## Setup Steps

### 1. Get Agent Chat ID

To connect messages to the agent (Sumanth), you need to get their Telegram chat ID:

1. **Start a conversation with the bot:**
   - Open Telegram
   - Search for your bot (you'll need to create it first or use an existing one)
   - Send any message to the bot

2. **Get the chat ID:**
   - Visit: `http://localhost:3000/api/telegram/get-chat-id` (or your deployed URL)
   - This will show all recent chat IDs
   - Find Sumanth's chat ID from the list

3. **Set the chat ID:**
   - Option A: Set environment variable:
     ```bash
     TELEGRAM_AGENT_CHAT_ID=123456789
     ```
   - Option B: Update the code in `app/api/telegram/connect/route.ts`

### 2. Create Telegram Bot (if not exists)

If you need to create a new bot:

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create a bot
4. Save the bot token (you already have one)
5. Set bot name and username
6. Enable the bot to receive messages

### 3. Configure Webhook (Optional)

For receiving messages from Telegram to your server:

1. Set webhook URL:
   ```
   GET /api/telegram/webhook?action=set-webhook&url=https://yourdomain.com/api/telegram/webhook
   ```

2. Or manually:
   ```bash
   curl "https://api.telegram.org/bot8405397592:AAF6SdgC5MvVBwlKUuOBO-xEcQG0aDGxlQk/setWebhook?url=https://yourdomain.com/api/telegram/webhook"
   ```

### 4. Test the Integration

1. **Test chatbot:**
   - Open the app
   - Click the chat button (bottom right)
   - Ask a question the bot can't answer
   - Click "Connect to Agent Sumanth"

2. **Verify Telegram message:**
   - Check Telegram for the message
   - Agent should receive the user's question

## API Endpoints

### Connect to Agent
```
POST /api/telegram/connect
Body: {
  userMessage: "User's question",
  userInfo: { timestamp: "..." }
}
```

### Get Chat IDs
```
GET /api/telegram/get-chat-id
Returns: List of all chat IDs that have messaged the bot
```

### Webhook (Receive Messages)
```
POST /api/telegram/webhook
Body: Telegram webhook payload
```

## Troubleshooting

### "Agent chat not found"
- Make sure the agent has sent at least one message to the bot
- Check that `TELEGRAM_AGENT_CHAT_ID` is set correctly
- Visit `/api/telegram/get-chat-id` to verify chat IDs

### "Failed to send message"
- Verify bot token is correct
- Check that bot is not blocked by the agent
- Ensure bot has permission to send messages

### Bot not receiving messages
- Make sure webhook is set correctly
- Check that bot is enabled and active
- Verify bot token is valid

## Security Notes

⚠️ **Important:**
- Never commit bot tokens to public repositories
- Use environment variables for sensitive data
- Restrict webhook endpoint access in production
- Consider rate limiting for API endpoints

## Production Deployment

1. Set environment variables:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token_here
   TELEGRAM_AGENT_CHAT_ID=agent_chat_id
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. Update webhook URL to production domain

3. Test thoroughly before going live

## Support

For issues with the Telegram integration:
- Check Telegram Bot API documentation: https://core.telegram.org/bots/api
- Review bot logs in Telegram
- Test API endpoints directly

