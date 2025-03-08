import React, { useEffect, useRef, useState } from 'react';
import { Message as MessageType } from 'ai';
import Message from './Message';

interface ChatDisplayProps {
    messages: MessageType[];
    isLoading: boolean;
    onStopGenerating?: () => void;
    onRegenerateResponse?: (variation?: string) => void;
}

interface MessageFeedback {
    messageId: string;
    feedback: 'helpful' | 'not_helpful';
}

type RegenerateVariation = 'default' | 'shorter' | 'longer' | 'simpler' | 'detailed';

const ChatDisplay: React.FC<ChatDisplayProps> = ({
    messages,
    isLoading,
    onStopGenerating,
    onRegenerateResponse
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const [feedbacks, setFeedbacks] = useState<MessageFeedback[]>([]);
    const [showVariations, setShowVariations] = useState(false);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Get the last message for regeneration
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const isLastMessageFromAI = lastMessage?.role === 'assistant';

    // Handle feedback
    const handleFeedback = (messageId: string, feedback: 'helpful' | 'not_helpful') => {
        // Check if feedback already exists
        const existingFeedbackIndex = feedbacks.findIndex(f => f.messageId === messageId);

        if (existingFeedbackIndex !== -1) {
            // Update existing feedback
            const updatedFeedbacks = [...feedbacks];
            updatedFeedbacks[existingFeedbackIndex].feedback = feedback;
            setFeedbacks(updatedFeedbacks);
        } else {
            // Add new feedback
            setFeedbacks([...feedbacks, { messageId, feedback }]);
        }

        // Here you could also send the feedback to your backend
        console.log(`Feedback for message ${messageId}: ${feedback}`);
    };

    // Check if a message has feedback
    const getMessageFeedback = (messageId: string): 'helpful' | 'not_helpful' | null => {
        const feedback = feedbacks.find(f => f.messageId === messageId);
        return feedback ? feedback.feedback : null;
    };

    // Handle regenerate with variation
    const handleRegenerateWithVariation = (variation?: RegenerateVariation) => {
        setShowVariations(false);

        let systemPrompt = '';
        switch (variation) {
            case 'shorter':
                systemPrompt = 'Provide a shorter and more concise response.';
                break;
            case 'longer':
                systemPrompt = 'Provide a more detailed and comprehensive response.';
                break;
            case 'simpler':
                systemPrompt = 'Explain in simpler terms, using less technical language.';
                break;
            case 'detailed':
                systemPrompt = 'Provide a more technical and detailed explanation.';
                break;
            default:
                systemPrompt = '';
        }

        if (onRegenerateResponse) {
            onRegenerateResponse(systemPrompt);
        }
    };

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

                            {/* Show controls and feedback for AI messages */}
                            {message.role === 'assistant' && (
                                <div className="flex flex-col items-center mt-1 mb-4">
                                    {/* Feedback buttons */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <button
                                            onClick={() => handleFeedback(message.id, 'helpful')}
                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${getMessageFeedback(message.id) === 'helpful'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-background border border-border hover:bg-secondary'
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="mr-1 h-3 w-3"
                                            >
                                                <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                                            </svg>
                                            Helpful
                                        </button>
                                        <button
                                            onClick={() => handleFeedback(message.id, 'not_helpful')}
                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${getMessageFeedback(message.id) === 'not_helpful'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-background border border-border hover:bg-secondary'
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="mr-1 h-3 w-3"
                                            >
                                                <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
                                            </svg>
                                            Not helpful
                                        </button>
                                    </div>

                                    {/* Regenerate button for last message */}
                                    {index === messages.length - 1 && !isLoading && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowVariations(!showVariations)}
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
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="ml-1 h-3 w-3"
                                                >
                                                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {/* Regeneration variations dropdown */}
                                            {showVariations && (
                                                <div className="absolute bottom-full mb-1 w-48 rounded-md border border-border bg-background shadow-lg">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleRegenerateWithVariation()}
                                                            className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                        >
                                                            Standard regeneration
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerateWithVariation('shorter')}
                                                            className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                        >
                                                            Shorter response
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerateWithVariation('longer')}
                                                            className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                        >
                                                            Longer response
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerateWithVariation('simpler')}
                                                            className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                        >
                                                            Simpler explanation
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerateWithVariation('detailed')}
                                                            className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                        >
                                                            More technical details
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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