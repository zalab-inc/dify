import React from 'react';

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
                    <label className="mb-2 block font-medium" htmlFor="model">
                        Model
                    </label>
                    <select
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                </div>

                <div className="mb-6">
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