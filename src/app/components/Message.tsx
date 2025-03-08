import React, { useEffect, useState } from 'react';
import { Message as MessageType } from 'ai';

interface MessageProps {
    message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const [isTyping, setIsTyping] = useState(false);
    const [displayedContent, setDisplayedContent] = useState('');
    const [contentIndex, setContentIndex] = useState(0);

    // Simulate typing effect for AI messages
    useEffect(() => {
        if (isUser) {
            setDisplayedContent(message.content);
            return;
        }

        // Reset state when message changes
        setIsTyping(true);
        setContentIndex(0);
        setDisplayedContent('');

        // Typing animation
        const typingInterval = setInterval(() => {
            if (contentIndex < message.content.length) {
                setDisplayedContent(prev => prev + message.content.charAt(contentIndex));
                setContentIndex(prev => prev + 1);
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 10); // Adjust speed as needed

        return () => clearInterval(typingInterval);
    }, [message.content, isUser, contentIndex]);

    // Format content with line breaks and code blocks
    const formatContent = (content: string) => {
        // Split by line breaks
        const lines = content.split('\n');

        return lines.map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < lines.length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'
                } mb-4`}
        >
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${isUser
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
            >
                {formatContent(isUser ? message.content : displayedContent)}
                {isTyping && !isUser && (
                    <span className="inline-block ml-1 animate-pulse">▌</span>
                )}
            </div>
        </div>
    );
};

export default Message; 