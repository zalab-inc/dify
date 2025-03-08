import React, { FormEvent, ChangeEvent } from 'react';

interface ChatInputProps {
    input: string;
    handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
}) => {
    // Auto-resize textarea based on content
    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        handleInputChange(e);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-gray-200 p-4 bg-white"
        >
            <div className="relative flex-grow">
                <textarea
                    className="w-full resize-none rounded-lg border border-gray-300 p-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    rows={1}
                    value={input}
                    onChange={handleTextareaChange}
                    disabled={isLoading}
                    style={{ maxHeight: '200px', minHeight: '44px' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim()) {
                                handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                            }
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute bottom-2 right-2 rounded-full bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                    >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                    </svg>
                </button>
            </div>
        </form>
    );
};

export default ChatInput; 