'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './components/ThemeProvider';
import { SettingsProvider } from './components/SettingsContext';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <SettingsProvider>
                    {children}
                </SettingsProvider>
            </ThemeProvider>
        </SessionProvider>
    );
} 