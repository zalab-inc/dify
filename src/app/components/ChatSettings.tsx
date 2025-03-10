import React from 'react';
import { useSettings } from './SettingsContext';

interface ChatSettingsProps {
    temperature: number;
    setTemperature: (temperature: number) => void;
    model: string;
    setModel: (model: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
    temperature,
    setTemperature,
    model,
    setModel,
    isOpen,
    onClose,
}) => {
    const {
        typingAnimationEnabled,
        setTypingAnimationEnabled,
        fontSize,
        setFontSize,
        highContrastMode,
        setHighContrastMode
    } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Chat Settings</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-secondary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <h3 className="mb-2 font-medium">Model Settings</h3>
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="model">
                                Model
                            </label>
                            <select
                                id="model"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <optgroup label="OpenAI Models">
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                </optgroup>
                                <optgroup label="Anthropic Models">
                                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Temperature: {temperature.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>More Precise</span>
                                <span>More Creative</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="mb-2 font-medium">Accessibility Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={typingAnimationEnabled}
                                    onChange={(e) => setTypingAnimationEnabled(e.target.checked)}
                                    className="h-4 w-4 rounded border-input accent-primary"
                                />
                                <span className="text-sm">Enable typing animation</span>
                            </label>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Disable this for improved accessibility or if you prefer instant responses.
                            </p>
                        </div>

                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={highContrastMode}
                                    onChange={(e) => setHighContrastMode(e.target.checked)}
                                    className="h-4 w-4 rounded border-input accent-primary"
                                />
                                <span className="text-sm">High contrast mode</span>
                            </label>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Enable this for improved visibility with higher contrast colors.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Font Size
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFontSize('small')}
                                    className={`flex-1 rounded-md border p-2 text-sm ${fontSize === 'small'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-input bg-background hover:bg-secondary'
                                        }`}
                                >
                                    Small
                                </button>
                                <button
                                    onClick={() => setFontSize('medium')}
                                    className={`flex-1 rounded-md border p-2 text-sm ${fontSize === 'medium'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-input bg-background hover:bg-secondary'
                                        }`}
                                >
                                    Medium
                                </button>
                                <button
                                    onClick={() => setFontSize('large')}
                                    className={`flex-1 rounded-md border p-2 text-sm ${fontSize === 'large'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-input bg-background hover:bg-secondary'
                                        }`}
                                >
                                    Large
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full rounded-lg bg-primary py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default ChatSettings; 