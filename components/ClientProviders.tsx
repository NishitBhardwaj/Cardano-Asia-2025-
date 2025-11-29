'use client';

import { MeshProvider } from '@meshsdk/react';
import { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <MeshProvider>
            {children}
        </MeshProvider>
    );
}
