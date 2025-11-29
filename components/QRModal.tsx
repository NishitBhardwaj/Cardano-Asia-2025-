'use client';

import { useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';

interface QRModalProps {
    campaignId: string;
    campaignTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function QRModal({ campaignId, campaignTitle, isOpen, onClose }: QRModalProps) {
    if (!isOpen) return null;

    const donationLink = typeof window !== 'undefined' 
        ? `${window.location.origin}/donate/${campaignId}`
        : '';

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="glass p-8 rounded-2xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Campaign QR Code</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex flex-col items-center">
                    <QRCodeGenerator
                        value={donationLink}
                        title="Scan to Donate"
                        size={200}
                        campaignTitle={campaignTitle}
                    />
                    <p className="text-sm text-foreground/60 mt-4 text-center">
                        Share this QR code to let others donate to your campaign
                    </p>
                </div>
            </div>
        </div>
    );
}

