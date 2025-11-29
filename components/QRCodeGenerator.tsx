'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
    value: string;
    title?: string;
    size?: number;
    campaignTitle?: string;
}

export default function QRCodeGenerator({ 
    value, 
    title = 'Scan to Donate',
    size = 180,
    campaignTitle 
}: QRCodeGeneratorProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadQRCode = async () => {
        if (!qrRef.current) return;

        setIsDownloading(true);
        try {
            // Dynamically import html2canvas
            const html2canvas = (await import('html2canvas')).default;
            
            const canvas = await html2canvas(qrRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
            });

            const link = document.createElement('a');
            link.download = `${campaignTitle ? campaignTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'campaign'}_qr.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to download QR code:', error);
            alert('Failed to download QR code');
        } finally {
            setIsDownloading(false);
        }
    };

    const copyLink = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(value).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground/80">{title}</h4>
            
            {/* QR Code Display */}
            <div className="flex flex-col items-center gap-4">
                <div 
                    ref={qrRef}
                    className="bg-white p-4 rounded-xl shadow-lg"
                    style={{ width: size + 32, height: size + 32 }}
                >
                    <QRCodeSVG
                        value={value}
                        size={size}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>

                {/* Campaign Title under QR */}
                {campaignTitle && (
                    <p className="text-xs text-foreground/60 text-center max-w-[200px] truncate">
                        {campaignTitle}
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={downloadQRCode}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                    {isDownloading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Save QR
                        </>
                    )}
                </button>
                <button
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                </button>
            </div>
        </div>
    );
}

