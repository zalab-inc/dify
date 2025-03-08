'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    typingAnimationEnabled: boolean;
    setTypingAnimationEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

interface SettingsProviderProps {
    children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    // Initialize state from localStorage if available
    const [typingAnimationEnabled, setTypingAnimationEnabledState] = useState<boolean>(true);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('app-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.typingAnimationEnabled !== undefined) {
                    setTypingAnimationEnabledState(settings.typingAnimationEnabled);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }, []);

    // Save settings to localStorage when they change
    const setTypingAnimationEnabled = (enabled: boolean) => {
        setTypingAnimationEnabledState(enabled);
        try {
            const savedSettings = localStorage.getItem('app-settings');
            const settings = savedSettings ? JSON.parse(savedSettings) : {};
            settings.typingAnimationEnabled = enabled;
            localStorage.setItem('app-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const value = {
        typingAnimationEnabled,
        setTypingAnimationEnabled,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
} 