import React, { useEffect, useRef, useState } from 'react';
import { Message as MessageType } from 'ai';
import Message from './Message';

interface FileReference {
    name: string;
    content: string;
    uploadedAt: string;
}

interface ChatDisplayProps {
    messages: MessageType[];
    isLoading: boolean;
    onStopGenerating?: () => void;
    onRegenerateResponse?: (variation?: string) => void;
    uploadedFiles?: FileReference[];
}

interface MessageFeedback {
    messageId: string;
    feedback: 'helpful' | 'not_helpful';
    reason?: string;
    comment?: string;
}

type RegenerateVariation = 'default' | 'shorter' | 'longer' | 'simpler' | 'detailed';

const ChatDisplay: React.FC<ChatDisplayProps> = ({
    messages,
    isLoading,
    onStopGenerating,
    onRegenerateResponse,
    uploadedFiles = []
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const [feedbacks, setFeedbacks] = useState<MessageFeedback[]>([]);
    const [showVariations, setShowVariations] = useState(false);
    const [showDetailedFeedback, setShowDetailedFeedback] = useState<string | null>(null);
    const [feedbackReason, setFeedbackReason] = useState<string>('');
    const [feedbackComment, setFeedbackComment] = useState<string>('');

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

        if (feedback === 'not_helpful') {
            setShowDetailedFeedback(messageId);
            return;
        }

        // If feedback already exists, update it
        if (existingFeedbackIndex !== -1) {
            const updatedFeedbacks = [...feedbacks];
            updatedFeedbacks[existingFeedbackIndex] = {
                ...updatedFeedbacks[existingFeedbackIndex],
                feedback
            };
            setFeedbacks(updatedFeedbacks);
        } else {
            // Otherwise, add new feedback
            setFeedbacks([...feedbacks, { messageId, feedback }]);
        }
    };

    // Handle detailed feedback submission
    const handleDetailedFeedbackSubmit = (messageId: string) => {
        const updatedFeedbacks = [...feedbacks];
        const existingFeedbackIndex = feedbacks.findIndex(f => f.messageId === messageId);

        const newFeedback = {
            messageId,
            feedback: 'not_helpful' as const,
            reason: feedbackReason,
            comment: feedbackComment
        };

        if (existingFeedbackIndex !== -1) {
            updatedFeedbacks[existingFeedbackIndex] = newFeedback;
        } else {
            updatedFeedbacks.push(newFeedback);
        }

        setFeedbacks(updatedFeedbacks);
        setShowDetailedFeedback(null);
        setFeedbackReason('');
        setFeedbackComment('');
    };

    // Handle regenerate variations
    const handleRegenerateClick = () => {
        setShowVariations(!showVariations);
    };

    const handleRegenerateVariation = (variation: RegenerateVariation) => {
        setShowVariations(false);

        let prompt = '';
        switch (variation) {
            case 'shorter':
                prompt = 'Please provide a shorter response to the previous question.';
                break;
            case 'longer':
                prompt = 'Please provide a more detailed response to the previous question.';
                break;
            case 'simpler':
                prompt = 'Please provide a simpler response to the previous question, using less technical language.';
                break;
            case 'detailed':
                prompt = 'Please provide a more technical and detailed response to the previous question.';
                break;
            default:
                prompt = '';
        }

        if (onRegenerateResponse) {
            onRegenerateResponse(prompt);
        }
    };

    // Handle stop generating
    const handleStopGenerating = () => {
        if (onStopGenerating) {
            onStopGenerating();
        }
    };

    // Render welcome message if no messages
    if (messages.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <h2 className="mb-2 text-2xl font-bold">Welcome to AI Chatbot</h2>
                <p className="mb-4 max-w-md text-muted-foreground">
                    Start a conversation by typing a message below. You can ask questions, request information, or just chat.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border p-4 hover:bg-secondary">
                        <h3 className="mb-2 font-medium">Ask a question</h3>
                        <p className="text-sm text-muted-foreground">
                            "What are the best practices for React performance optimization?"
                        </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 hover:bg-secondary">
                        <h3 className="mb-2 font-medium">Generate content</h3>
                        <p className="text-sm text-muted-foreground">
                            "Write a product description for a new smart water bottle."
                        </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 hover:bg-secondary">
                        <h3 className="mb-2 font-medium">Get creative</h3>
                        <p className="text-sm text-muted-foreground">
                            "Create a short story about a robot learning to paint."
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto p-4">
            {/* Display uploaded files */}
            {uploadedFiles.length > 0 && (
                <div className="mb-4 rounded-lg border border-border p-3">
                    <h3 className="mb-2 font-medium">Uploaded Files</h3>
                    <ul className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                            <li key={index} className="text-sm">
                                <span className="font-medium">{file.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {new Date(file.uploadedAt).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Display messages */}
            {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const messageId = `message-${index}`;
                const messageFeedback = feedbacks.find(f => f.messageId === messageId);

                return (
                    <div
                        key={index}
                        ref={isLastMessage ? lastMessageRef : null}
                        className="mb-4"
                    >
                        <Message message={message} />

                        {/* Feedback buttons for AI messages */}
                        {message.role === 'assistant' && (
                            <div className="mt-1 flex items-center justify-end space-x-2">
                                {/* Feedback buttons */}
                                <div className="flex items-center space-x-2 text-xs">
                                    {messageFeedback?.feedback === 'helpful' ? (
                                        <span className="text-green-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">Helpful</span>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleFeedback(messageId, 'helpful')}
                                            className="flex items-center text-muted-foreground hover:text-green-500"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">Helpful</span>
                                        </button>
                                    )}

                                    {messageFeedback?.feedback === 'not_helpful' ? (
                                        <span className="text-red-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.965 4.904l9.131 9.131a6.5 6.5 0 00-9.131-9.131zm8.07 10.192L4.904 5.965a6.5 6.5 0 009.131 9.131zM4.343 4.343a8 8 0 1111.314 11.314A8 8 0 014.343 4.343z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">Not helpful</span>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleFeedback(messageId, 'not_helpful')}
                                            className="flex items-center text-muted-foreground hover:text-red-500"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.965 4.904l9.131 9.131a6.5 6.5 0 00-9.131-9.131zm8.07 10.192L4.904 5.965a6.5 6.5 0 009.131 9.131zM4.343 4.343a8 8 0 1111.314 11.314A8 8 0 014.343 4.343z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">Not helpful</span>
                                        </button>
                                    )}
                                </div>

                                {/* Regenerate button for last AI message */}
                                {isLastMessage && isLastMessageFromAI && (
                                    <div className="relative" data-regenerate-menu>
                                        <button
                                            onClick={handleRegenerateClick}
                                            className="flex items-center text-muted-foreground hover:text-primary"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-1">Regenerate</span>
                                        </button>

                                        {/* Regenerate variations dropdown */}
                                        <div
                                            className={`absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg ${showVariations ? '' : 'hidden'
                                                }`}
                                            data-regenerate-dropdown
                                        >
                                            <div className="py-1">
                                                <button
                                                    onClick={() => handleRegenerateVariation('default')}
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                >
                                                    Regenerate response
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateVariation('shorter')}
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                >
                                                    Generate shorter response
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateVariation('longer')}
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                >
                                                    Generate longer response
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateVariation('simpler')}
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                >
                                                    Generate simpler response
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateVariation('detailed')}
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                                                >
                                                    Generate more detailed response
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Detailed feedback form */}
                        {showDetailedFeedback === messageId && (
                            <div className="mt-2 rounded-lg border border-border p-3">
                                <h4 className="mb-2 text-sm font-medium">What was wrong with this response?</h4>
                                <div className="mb-2">
                                    <select
                                        value={feedbackReason}
                                        onChange={(e) => setFeedbackReason(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="incorrect">Information is incorrect</option>
                                        <option value="incomplete">Information is incomplete</option>
                                        <option value="unclear">Response is unclear</option>
                                        <option value="irrelevant">Response is irrelevant</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <textarea
                                        value={feedbackComment}
                                        onChange={(e) => setFeedbackComment(e.target.value)}
                                        placeholder="Additional comments (optional)"
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowDetailedFeedback(null)}
                                        className="rounded-md border border-input px-3 py-1 text-sm hover:bg-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDetailedFeedbackSubmit(messageId)}
                                        className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-primary"></div>
                        <div className="text-sm text-muted-foreground">AI is thinking...</div>
                    </div>
                    <button
                        onClick={handleStopGenerating}
                        className="rounded-md border border-input px-3 py-1 text-sm hover:bg-secondary"
                    >
                        Stop generating
                    </button>
                </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatDisplay; 