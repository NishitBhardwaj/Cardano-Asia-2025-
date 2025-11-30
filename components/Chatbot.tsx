'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'agent';
    timestamp: Date;
    type?: 'text' | 'form' | 'step';
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserData {
    email?: string;
    username?: string;
    collectedAt?: string;
}

// Knowledge base for common questions
const knowledgeBase: { question: string[]; answer: string; steps?: string[] }[] = [
    {
        question: ['how to connect wallet', 'connect wallet', 'wallet connection', 'how do i connect my wallet'],
        answer: `To connect your wallet, follow these steps:`,
        steps: [
            '1. Click on "Connect Wallet" button in the top right header',
            '2. Select your Cardano wallet from the popup (Nami, Eternl, Flint, etc.)',
            '3. Approve the connection request in your wallet extension popup',
            '4. Your wallet address will be displayed once connected',
            '5. You\'re now ready to donate or create campaigns!'
        ]
    },
    {
        question: ['how to donate', 'make donation', 'donate', 'how do i donate'],
        answer: `Here's how to make a donation:`,
        steps: [
            '1. Go to the "Campaigns" page from the navigation menu',
            '2. Browse and find a campaign you want to support',
            '3. Click on the campaign to view details',
            '4. Click the "Donate" button on the campaign page',
            '5. Enter the amount you want to donate (in ADA)',
            '6. Connect your wallet if not already connected',
            '7. Confirm the transaction in your wallet popup',
            '8. Wait for blockchain confirmation (~20 seconds)'
        ]
    },
    {
        question: ['create campaign', 'how to create campaign', 'start campaign', 'new campaign'],
        answer: `To create a fundraising campaign:`,
        steps: [
            '1. First, verify your identity at /auth/verify-identity',
            '2. Click "Create Campaign" in the header',
            '3. Fill in your campaign title and description',
            '4. Set your fundraising goal (in ADA)',
            '5. Choose a category and deadline',
            '6. Upload an image for your campaign (optional)',
            '7. Select a campaign mode (Normal, Hydra Event, etc.)',
            '8. Submit and your campaign goes live!'
        ]
    },
    {
        question: ['verify identity', 'identity verification', 'kyc', 'verification'],
        answer: `Identity verification is required to create campaigns:`,
        steps: [
            '1. Go to /auth/verify-identity after logging in',
            '2. Choose a document type (Passport or Driving License)',
            '3. Upload a clear photo of your document',
            '4. Our AI will verify your document (takes a few seconds)',
            '5. If verification fails 3 times, you can submit a utility bill',
            '6. Utility bill verification takes up to 3 hours for manual review'
        ]
    },
    {
        question: ['what wallets are supported', 'supported wallets', 'which wallets', 'wallet support'],
        answer: `We support all CIP-30 compatible Cardano wallets including Nami, Eternl, Flint, Typhon, Gero, and more. Install one from your browser's extension store.`
    },
    {
        question: ['transaction failed', 'payment failed', 'donation failed', 'transaction error'],
        answer: `If your transaction failed:`,
        steps: [
            '1. Check your wallet has enough ADA (including ~0.2 ADA for fees)',
            '2. Ensure you\'re on the correct network (Preprod or Mainnet)',
            '3. Refresh the page and reconnect your wallet',
            '4. Check your wallet extension is up to date',
            '5. If issue persists, click "Connect to Agent" below for help'
        ]
    },
    {
        question: ['withdraw funds', 'how to withdraw', 'withdrawal', 'get my funds'],
        answer: `To withdraw funds from your campaign:`,
        steps: [
            '1. Go to your campaign page (My Campaigns → select campaign)',
            '2. Click "Request Withdrawal" button',
            '3. Enter the withdrawal amount and reason',
            '4. Submit the request for governance approval',
            '5. Wait for admin signatures (3 of 5 required)',
            '6. Funds will be sent to your wallet once approved'
        ]
    },
    {
        question: ['signup', 'sign up', 'create account', 'register'],
        answer: `To create an account:`,
        steps: [
            '1. Click "Login" in the header',
            '2. Choose "Email" authentication tab',
            '3. Click "Sign up" link',
            '4. Fill in your details (first name, last name, email)',
            '5. Create a unique username',
            '6. Set a strong password and confirm it',
            '7. Complete the captcha verification',
            '8. Verify your email by entering the OTP sent to you'
        ]
    },
    {
        question: ['2fa', 'two factor', 'two-factor', 'authenticator', 'google authenticator'],
        answer: `To set up Two-Factor Authentication:`,
        steps: [
            '1. Go to Profile → Settings tab',
            '2. Find "Two-Factor Authentication" section',
            '3. Click "Enable 2FA"',
            '4. Scan the QR code with Google Authenticator or Authy',
            '5. Enter the 6-digit code to verify',
            '6. Save your backup codes in a secure place',
            '7. 2FA will be required on your next login'
        ]
    },
    {
        question: ['forgot password', 'reset password', 'password reset'],
        answer: `To reset your password:`,
        steps: [
            '1. Go to the Login page',
            '2. Click "Forgot Password?" link',
            '3. Enter your email address',
            '4. Check your email for the OTP code (6 digits)',
            '5. Enter the OTP on the verification page',
            '6. Create a new password (minimum 8 characters)',
            '7. Login with your new password'
        ]
    },
    {
        question: ['admin', 'add admin', 'campaign admin', 'share campaign'],
        answer: `To manage campaign admins:`,
        steps: [
            '1. Go to your campaign detail page',
            '2. Scroll to "Campaign Management" section',
            '3. To add admin: Enter their username and click "Add Admin"',
            '4. Maximum 7 admins allowed per campaign',
            '5. Use "Admin Invite Link" to share with new admins',
            '6. Use "Public Donation Link" to share on social media'
        ]
    },
    {
        question: ['qr code', 'scan to donate', 'share qr'],
        answer: `Each campaign has a QR code for easy sharing. Find it in the Campaign Management section and click "Save QR" to download it for sharing.`
    },
    {
        question: ['hydra', 'hydra mode', 'fast donation', 'event mode'],
        answer: `Hydra Event Mode enables fast, low-fee donations for live events. When creating a campaign, select "Hydra Event Mode" for near-instant confirmations during livestreams or charity marathons.`
    },
    {
        question: ['verify email', 'email verification', 'verify my email', 'email not verified'],
        answer: `To verify your email:`,
        steps: [
            '1. Go to your Profile page',
            '2. Click on "Settings" tab',
            '3. Find the email section showing "Not Verified"',
            '4. Click "Send Verification Email"',
            '5. Check your email for the 6-digit OTP',
            '6. Enter the OTP to verify your email'
        ]
    },
    {
        question: ['contact support', 'help', 'support', 'need help', 'talk to human'],
        answer: `I'm here to help! If I can't answer your question, I can connect you to our support agent Sumanth via Telegram. Just click the "Connect to Agent" button below.`
    },
    {
        question: ['fees', 'transaction fees', 'how much fees', 'cost'],
        answer: `Transaction fees on Cardano are very low (~0.17-0.20 ADA). All fees go to the Cardano network - we don't charge any additional platform fees.`
    },
    {
        question: ['security', 'is it safe', 'secure', 'private'],
        answer: `Your security is our priority. We use wallet-based authentication, all transactions are on the blockchain, and we offer 2FA for email accounts. Your private keys never leave your wallet.`
    },
];

const CHAT_STORAGE_KEY = 'donatedao-chat-history';
const USER_DATA_KEY = 'donatedao-chat-user';
const SESSION_ID_KEY = 'donatedao-telegram-session';

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [connectingToAgent, setConnectingToAgent] = useState(false);
    const [connectedToAgent, setConnectedToAgent] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [lastServerTimestamp, setLastServerTimestamp] = useState<number | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [userFormData, setUserFormData] = useState({ email: '', username: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize sessionId on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Generate or load sessionId
            let storedSessionId = localStorage.getItem(SESSION_ID_KEY);
            if (!storedSessionId) {
                storedSessionId = crypto.randomUUID();
                localStorage.setItem(SESSION_ID_KEY, storedSessionId);
            }
            setSessionId(storedSessionId);
        }
    }, []);

    // Load chat history and user data from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Load chat history
            const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                // Convert timestamp strings back to Date objects
                const messagesWithDates = parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(messagesWithDates);
                
                // Check if we were connected to agent
                const wasConnected = messagesWithDates.some((m: any) => 
                    m.sender === 'agent' || (m.text && m.text.includes('connected to a human agent'))
                );
                if (wasConnected) {
                    setConnectedToAgent(true);
                }
            } else {
                // Initial greeting
                setMessages([{
                    id: '1',
                    text: "Hello! I'm your DonateDAO assistant. I can help you with wallet connections, donations, campaigns, and more. What would you like to know?",
                    sender: 'bot',
                    timestamp: new Date(),
                }]);
            }

            // Load user data
            const savedUserData = localStorage.getItem(USER_DATA_KEY);
            if (savedUserData) {
                setUserData(JSON.parse(savedUserData));
            }
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0 && typeof window !== 'undefined') {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for agent messages when connected
    useEffect(() => {
        if (!connectedToAgent || !sessionId) {
            // Clear polling if not connected
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            return;
        }

        // Start polling every 3 seconds
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const since = lastServerTimestamp || 0;
                const response = await fetch(
                    `/api/telegram/messages?sessionId=${encodeURIComponent(sessionId)}&since=${since}`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.messages && data.messages.length > 0) {
                        // Add new agent messages to chat
                        const newMessages: Message[] = data.messages
                            .filter((msg: any) => msg.role === 'agent')
                            .map((msg: any) => ({
                                id: msg.id,
                                text: msg.text,
                                sender: 'agent' as const,
                                timestamp: new Date(msg.timestamp),
                            }));

                        if (newMessages.length > 0) {
                            setMessages(prev => [...prev, ...newMessages]);
                            
                            // Update last timestamp
                            if (data.messages && data.messages.length > 0) {
                                const latestTimestamp = Math.max(
                                    ...data.messages.map((m: any) => m.timestamp)
                                );
                                setLastServerTimestamp(latestTimestamp);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error polling for messages:', error);
            }
        }, 3000); // Poll every 3 seconds

        // Cleanup on unmount or when disconnected
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [connectedToAgent, sessionId, lastServerTimestamp]);

    const saveUserData = (data: UserData) => {
        const fullData = { ...data, collectedAt: new Date().toISOString() };
        setUserData(fullData);
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(fullData));
        }
    };

    const findAnswer = (userMessage: string): { answer: string; steps?: string[] } | null => {
        const lowerMessage = userMessage.toLowerCase();
        
        for (const item of knowledgeBase) {
            for (const keyword of item.question) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    return { answer: item.answer, steps: item.steps };
                }
            }
        }
        
        return null;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const messageText = input;
        setInput('');
        setIsTyping(true);

        // If connected to agent, send message to Telegram
        if (connectedToAgent && sessionId) {
            setIsTyping(false);
            try {
                const response = await fetch('/api/telegram/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        userMessage: messageText,
                        userInfo: {
                            email: userData?.email,
                            username: userData?.username,
                        },
                    }),
                });

                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    // Show error in chat
                    const errorMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: data.error || 'Failed to send message. Please try again.',
                        sender: 'bot',
                        timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, errorMsg]);
                    
                    // If it's a configuration error, show instructions
                    if (data.instructions) {
                        const instructionsMsg: Message = {
                            id: (Date.now() + 2).toString(),
                            text: `Setup Instructions:\n${data.instructions.join('\n')}`,
                            sender: 'bot',
                            timestamp: new Date(),
                        };
                        setMessages(prev => [...prev, instructionsMsg]);
                    }
                }
                // Message already added to chat above, just send to Telegram
            } catch (error) {
                console.error('Failed to send message to agent:', error);
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: 'Failed to send message to agent. Please check your connection and try again.',
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMsg]);
            }
            return; // Don't process with AI when connected to agent
        }

        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to find answer in knowledge base
        const result = findAnswer(messageText);

        if (result) {
            // Add main answer
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: result.answer,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);

            // If there are steps, add them as a separate message
            if (result.steps && result.steps.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
                const stepsMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    text: result.steps.join('\n'),
                    sender: 'bot',
                    timestamp: new Date(),
                    type: 'step',
                };
                setMessages(prev => [...prev, stepsMessage]);
            }
        } else {
            // If no answer found, ask for user info if not collected, then offer agent
            if (!userData) {
                const askInfoMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "I'd like to help you better! Could you please share your email and username? This helps our team follow up if needed.",
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, askInfoMessage]);
                setShowUserForm(true);
            } else {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "I couldn't find a specific answer to your question. Would you like me to connect you to our support agent Sumanth via Telegram? He can help with more complex issues.",
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);
            }
        }

        setIsTyping(false);
    };

    const handleUserFormSubmit = () => {
        if (userFormData.email || userFormData.username) {
            saveUserData(userFormData);
            setShowUserForm(false);
            
            const thankYouMessage: Message = {
                id: Date.now().toString(),
                text: `Thanks${userFormData.username ? `, ${userFormData.username}` : ''}! I've saved your info. Now, would you like me to connect you to our support agent Sumanth?`,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, thankYouMessage]);
        }
    };

    const handleConnectToAgent = async () => {
        if (!sessionId) {
            alert('Session not initialized. Please refresh the page.');
            return;
        }

        setConnectingToAgent(true);
        
        const connectingMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Connecting you to a human agent...',
            sender: 'bot',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, connectingMessage]);

        try {
            // Get the last user message
            const lastUserMessage = messages.filter(m => m.sender === 'user').pop()?.text || 'User needs help';
            
            // Call API to send message to Telegram
            const response = await fetch('/api/telegram/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    userMessage: lastUserMessage,
                    userInfo: {
                        email: userData?.email,
                        username: userData?.username,
                    },
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setConnectedToAgent(true);
                setLastServerTimestamp(Date.now());
                
                const agentMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    text: '✅ You are now connected to a human agent. Please wait for their reply here.',
                    sender: 'agent',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, agentMessage]);
            } else {
                // Show error message in chat
                const errorMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    text: `⚠️ ${data.error || data.message || 'Connection issue'}. ${data.instructions ? '\n\n' + data.instructions.join('\n') : 'Please contact @DonateDAOSupport_bot directly on Telegram.'}`,
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
                
                // If it's a configuration error, provide helpful link
                if (data.error?.includes('TELEGRAM_AGENT_CHAT_ID') || data.error?.includes('not configured')) {
                    const helpMessage: Message = {
                        id: (Date.now() + 3).toString(),
                        text: '💡 Quick Setup:\n1. Visit /api/telegram/get-chat-id to get your chat ID\n2. Add it to .env.local as TELEGRAM_AGENT_CHAT_ID\n3. Restart the server',
                        sender: 'bot',
                        timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, helpMessage]);
                }
            }
        } catch (error: any) {
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: `❌ Failed to connect: ${error.message || 'Unknown error'}. Please try again or contact support directly.`,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setConnectingToAgent(false);
        }
    };

    const handleClearHistory = () => {
        if (confirm('Clear chat history?')) {
            localStorage.removeItem(CHAT_STORAGE_KEY);
            setMessages([{
                id: '1',
                text: "Chat history cleared. How can I help you today?",
                sender: 'bot',
                timestamp: new Date(),
            }]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] glass rounded-3xl shadow-2xl flex flex-col z-50 border border-white/10 overflow-hidden animate-scale-in">
            {/* Header - Messenger Style */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-cyan-600/30 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            {/* Chat icon */}
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                                <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
                            </svg>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full" />
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">DonateDAO Support</h3>
                        <p className="text-xs text-emerald-200/70 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            {userData?.username ? `Hi, ${userData.username}!` : 'Online • We typically reply instantly'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClearHistory}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all hover:scale-110 text-white/70 hover:text-white"
                        title="Clear history"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all text-white/70"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20 scrollbar-hide">
                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {message.sender !== 'user' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                                message.sender === 'agent' 
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                            }`}>
                                {message.sender === 'agent' ? (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                                    </svg>
                                )}
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                message.sender === 'user'
                                    ? 'gradient-primary text-white rounded-br-md shadow-lg shadow-primary/20'
                                    : message.sender === 'agent'
                                    ? 'bg-accent/20 border border-accent/30 rounded-bl-md'
                                    : message.type === 'step'
                                    ? 'bg-primary/10 border border-primary/20 rounded-bl-md'
                                    : 'bg-white/5 border border-white/5 rounded-bl-md'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                            <p className="text-[10px] opacity-50 mt-1.5 text-right">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        {message.sender === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center ml-2 flex-shrink-0">
                                <span className="text-sm">👤</span>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* User Info Form */}
                {showUserForm && (
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 space-y-3 border border-white/10 animate-scale-in">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">📝</span>
                            <p className="text-sm font-bold">Quick Info (optional)</p>
                        </div>
                        <input
                            type="email"
                            placeholder="Your email..."
                            value={userFormData.email}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                            type="text"
                            placeholder="Your username..."
                            value={userFormData.username}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowUserForm(false)}
                                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleUserFormSubmit}
                                className="flex-1 px-3 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold"
                            >
                                Submit ✓
                            </button>
                        </div>
                    </div>
                )}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                            <div className="loading-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="text-xs text-foreground/50">Thinking...</span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
                    <p className="text-xs text-foreground/40 mb-2 font-medium">💡 Popular topics:</p>
                    <div className="flex flex-wrap gap-2">
                        {['Connect Wallet', 'How to Donate', 'Create Campaign', 'Verify Identity', '2FA Setup'].map((q) => (
                            <button
                                key={q}
                                onClick={() => {
                                    setInput(q);
                                    setTimeout(() => handleSend(), 100);
                                }}
                                className="px-3 py-1.5 text-xs bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-all border border-white/5"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Connect to Agent Button */}
            {!connectedToAgent && messages.some(m => m.sender === 'bot' && (m.text.includes("connect you to") || m.text.includes("support agent"))) && (
                <div className="px-4 py-3 border-t border-white/5">
                    <button
                        onClick={handleConnectToAgent}
                        disabled={connectingToAgent}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent/20 border border-accent/30 text-accent rounded-xl font-semibold hover:bg-accent/30 transition-all disabled:opacity-50"
                    >
                        {connectingToAgent ? (
                            <>
                                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <span>👨‍💼</span>
                                Connect to Agent
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Connected to Agent Indicator */}
            {connectedToAgent && (
                <div className="px-4 py-3 border-t border-white/5 bg-accent/10">
                    <div className="flex items-center gap-2 text-sm text-accent">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-medium">Connected to human agent</span>
                    </div>
                    <p className="text-xs text-foreground/50 mt-1">
                        Your messages are being sent to the agent. They will reply here.
                    </p>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="px-5 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <p className="text-[10px] text-foreground/30 text-center mt-2">
                    Press Enter to send • AI-powered assistance
                </p>
            </div>
        </div>
    );
}
