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
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
            >
                {message.content}
            </div>
        </div>
    );
};

export default Message; 