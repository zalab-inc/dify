'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
    typingAnimationEnabled: boolean;
    setTypingAnimationEnabled: (enabled: boolean) => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    highContrastMode: boolean;
    setHighContrastMode: (enabled: boolean) => void;
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
    const [fontSize, setFontSizeState] = useState<FontSize>('medium');
    const [highContrastMode, setHighContrastModeState] = useState<boolean>(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('app-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.typingAnimationEnabled !== undefined) {
                    setTypingAnimationEnabledState(settings.typingAnimationEnabled);
                }
                if (settings.fontSize !== undefined) {
                    setFontSizeState(settings.fontSize);
                }
                if (settings.highContrastMode !== undefined) {
                    setHighContrastModeState(settings.highContrastMode);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }, []);

    // Apply font size to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('text-small', 'text-medium', 'text-large');
        root.classList.add(`text-${fontSize}`);
    }, [fontSize]);

    // Apply high contrast mode to document
    useEffect(() => {
        const root = document.documentElement;
        if (highContrastMode) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    }, [highContrastMode]);

    // Save settings to localStorage when they change
    const setTypingAnimationEnabled = (enabled: boolean) => {
        setTypingAnimationEnabledState(enabled);
        saveSettings({ typingAnimationEnabled: enabled });
    };

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        saveSettings({ fontSize: size });
    };

    const setHighContrastMode = (enabled: boolean) => {
        setHighContrastModeState(enabled);
        saveSettings({ highContrastMode: enabled });
    };

    const saveSettings = (newSettings: Partial<SettingsContextType>) => {
        try {
            const savedSettings = localStorage.getItem('app-settings');
            const settings = savedSettings ? JSON.parse(savedSettings) : {};
            const updatedSettings = { ...settings, ...newSettings };
            localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const value = {
        typingAnimationEnabled,
        setTypingAnimationEnabled,
        fontSize,
        setFontSize,
        highContrastMode,
        setHighContrastMode,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
} 