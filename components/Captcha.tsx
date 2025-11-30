'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CaptchaProps {
    onVerify: (isValid: boolean) => void;
    resetKey?: number; // Key to trigger reset
}

export default function Captcha({ onVerify, resetKey }: CaptchaProps) {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isValid, setIsValid] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const onVerifyRef = useRef(onVerify);
    
    // Keep ref updated
    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    // Generate random captcha text
    const generateCaptcha = useCallback(() => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let text = '';
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        setUserInput('');
        setIsValid(false);
        onVerifyRef.current(false);
        return text;
    }, []);

    // Draw captcha on canvas
    const drawCaptcha = useCallback((text: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text with random colors and positions
        ctx.font = 'bold 24px Arial';
        for (let i = 0; i < text.length; i++) {
            const x = 20 + i * 30;
            const y = 30 + Math.random() * 10;
            const angle = (Math.random() - 0.5) * 0.3;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }

        // Add noise lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // Add noise dots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                1,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }, []);

    // Generate captcha on mount
    useEffect(() => {
        const text = generateCaptcha();
        drawCaptcha(text);
    }, [generateCaptcha, drawCaptcha]);

    // Handle reset when resetKey changes
    useEffect(() => {
        if (resetKey !== undefined && resetKey > 0) {
            const text = generateCaptcha();
            drawCaptcha(text);
        }
    }, [resetKey, generateCaptcha, drawCaptcha]);

    // Validate input
    useEffect(() => {
        if (userInput.length === captchaText.length && captchaText.length > 0) {
            const valid = userInput.toUpperCase() === captchaText.toUpperCase();
            setIsValid(valid);
            onVerifyRef.current(valid);
        } else {
            setIsValid(false);
            if (captchaText.length > 0) {
                onVerifyRef.current(false);
            }
        }
    }, [userInput, captchaText]);

    // Handle refresh button click
    const handleRefresh = useCallback(() => {
        const text = generateCaptcha();
        drawCaptcha(text);
    }, [generateCaptcha, drawCaptcha]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <canvas
                    ref={canvasRef}
                    width={180}
                    height={50}
                    className="border border-border rounded-lg bg-background"
                />
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="px-4 py-2 text-sm glass rounded-lg hover:bg-primary/20 transition-colors"
                    title="Refresh captcha"
                >
                    🔄
                </button>
            </div>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                placeholder="Enter captcha"
                maxLength={5}
                className={`w-full px-4 py-2 rounded-lg border ${
                    userInput.length === captchaText.length
                        ? isValid
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-red-500 bg-red-500/10'
                        : 'border-border bg-background'
                } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {userInput.length === captchaText.length && !isValid && (
                <p className="text-sm text-red-500">Captcha does not match</p>
            )}
        </div>
    );
}

