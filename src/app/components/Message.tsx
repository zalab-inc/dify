import React from 'react';
import { Message as MessageType } from 'ai';

interface MessageProps {
    message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

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
                {message.content}
            </div>
        </div>
    );
};

export default Message; 