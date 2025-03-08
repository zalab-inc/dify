import React, { useEffect, useRef } from 'react';
import { Message as MessageType } from 'ai';
import Message from './Message';

interface ChatDisplayProps {
    messages: MessageType[];
    isLoading: boolean;
    onStopGenerating?: () => void;
    onRegenerateResponse?: () => void;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({
    messages,
    isLoading,
    onStopGenerating,
    onRegenerateResponse
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Get the last message for regeneration
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const isLastMessageFromAI = lastMessage?.role === 'assistant';

    return (
        <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-8 w-8 text-primary"
                        >
                            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">How can I help you today?</h3>
                    <p className="text-muted-foreground">
                        Ask me anything, and I'll do my best to assist you.
                    </p>
                </div>
            ) : (
                <>
                    {messages.map((message, index) => (
                        <div key={message.id} ref={index === messages.length - 1 ? lastMessageRef : null}>
                            <Message message={message} />

                            {/* Show controls for the last AI message */}
                            {index === messages.length - 1 && message.role === 'assistant' && !isLoading && (
                                <div className="flex justify-center mt-2 mb-4 space-x-2">
                                    <button
                                        onClick={onRegenerateResponse}
                                        className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm hover:bg-secondary"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="mr-1 h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Regenerate
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="mb-4">
                            <div className="flex justify-start mb-2">
                                <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-2 text-secondary-foreground rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                            {onStopGenerating && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={onStopGenerating}
                                        className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm hover:bg-secondary"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="mr-1 h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Stop generating
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
};

export default ChatDisplay; 