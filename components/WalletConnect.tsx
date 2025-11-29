'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { BrowserWallet } from '@meshsdk/core';

export default function WalletConnect() {
    const { connected, wallet, connect } = useWallet();
    const [address, setAddress] = useState<string>('');
    const [availableWallets, setAvailableWallets] = useState<any[]>([]);
    const [showWalletList, setShowWalletList] = useState(false);

    useEffect(() => {
        const wallets = BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets);
    }, []);

    useEffect(() => {
        if (connected && wallet) {
            const fetchAddress = async () => {
                const addr: string = await wallet.getChangeAddress();
                setAddress(addr);
            };
            fetchAddress();
        }
    }, [connected, wallet]);

    const handleConnect = async (walletName: string) => {
        try {
            await connect(walletName);
            setShowWalletList(false);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    return (
        <div className="relative flex items-center gap-4">
            {!connected ? (
                <div>
                    <button
                        onClick={() => setShowWalletList(!showWalletList)}
                        className="gradient-primary px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        Connect Wallet
                    </button>

                    {showWalletList && availableWallets.length > 0 && (
                        <div className="absolute top-full right-0 mt-2 glass rounded-lg p-2 min-w-[200px] z-50">
                            {availableWallets.map((wallet) => (
                                <button
                                    key={wallet.name}
                                    onClick={() => handleConnect(wallet.name)}
                                    className="w-full px-4 py-3 text-left hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                                >
                                    <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                                    <span>{wallet.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showWalletList && availableWallets.length === 0 && (
                        <div className="absolute top-full right-0 mt-2 glass rounded-lg p-4 min-w-[200px] z-50">
                            <p className="text-sm text-foreground/70">No Cardano wallet detected. Please install a wallet extension.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass px-6 py-3 rounded-lg flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium">
                        {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Connected'}
                    </span>
                </div>
            )}
        </div>
    );
}
