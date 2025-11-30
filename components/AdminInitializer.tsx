'use client';

import { useEffect, useState } from 'react';
import { initializeAdminAccount, ADMIN_CREDENTIALS } from '@/lib/utils/initAdminAccount';

/**
 * AdminInitializer Component
 * 
 * Automatically initializes the admin account on app load
 * This ensures the admin account is always available for testing
 */
export function AdminInitializer() {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Initialize admin account once on mount
        if (!initialized) {
            initializeAdminAccount()
                .then((success) => {
                    if (success) {
                        setInitialized(true);
                        console.log('✅ Admin account ready:', ADMIN_CREDENTIALS.email);
                    }
                })
                .catch((error) => {
                    console.error('Failed to initialize admin:', error);
                });
        }
    }, [initialized]);

    // This component doesn't render anything
    return null;
}

