'use client';

import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'donatedao-cookie-consent';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Show banner after a short delay
            const timer = setTimeout(() => setShowBanner(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            accepted: true,
            timestamp: new Date().toISOString(),
            preferences: { analytics: true, marketing: false, functional: true }
        }));
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            accepted: false,
            timestamp: new Date().toISOString(),
            preferences: { analytics: false, marketing: false, functional: true }
        }));
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="container mx-auto max-w-4xl">
                <div className="glass p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🍪</span>
                                <h4 className="font-bold text-sm sm:text-base">Cookie Preferences</h4>
                            </div>
                            <p className="text-xs sm:text-sm text-foreground/70">
                                We use cookies to improve your experience, analyze traffic, and personalize content. 
                                By clicking "Accept", you consent to our use of cookies.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={declineCookies}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm glass rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={acceptCookies}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

