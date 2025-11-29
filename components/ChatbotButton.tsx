'use client';

import { useState, useEffect } from 'react';
import Chatbot from './Chatbot';

export default function ChatbotButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [showPulse, setShowPulse] = useState(true);
    const [unreadCount, setUnreadCount] = useState(1);

    // Hide pulse after user clicks
    useEffect(() => {
        if (isOpen) {
            setShowPulse(false);
            setUnreadCount(0);
        }
    }, [isOpen]);

    return (
        <>
            {/* Floating Chat Button - Messenger Style */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 group"
                title="Chat with us"
            >
                {/* Pulse ring animation */}
                {showPulse && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 animate-ping" />
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </>
                )}
                
                {/* Main button - WhatsApp/Messenger style */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-500/50 group-hover:from-emerald-400 group-hover:to-cyan-400">
                    {/* Chat bubble icon */}
                    <svg 
                        className="w-8 h-8 text-white transition-transform group-hover:scale-110" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                        <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
                    </svg>
                    
                    {/* Online indicator */}
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </span>

                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
                    <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-xl">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Chat with us
                        </span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1 right-6 w-3 h-3 bg-gray-900 transform rotate-45" />
                </div>
            </button>

            {/* Chatbot Panel */}
            <Chatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
