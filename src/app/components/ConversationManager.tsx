'use client';

import React, { useState, useEffect } from 'react';
import { Message } from 'ai';

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

interface ConversationManagerProps {
    currentMessages: Message[];
    onLoadConversation: (messages: Message[]) => void;
    onNewConversation: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
    currentMessages,
    onLoadConversation,
    onNewConversation,
    isOpen,
    onClose,
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Load conversations from localStorage
    useEffect(() => {
        try {
            const savedConversations = localStorage.getItem('conversations');
            if (savedConversations) {
                setConversations(JSON.parse(savedConversations));
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }, [isOpen]);

    // Save current conversation
    const saveCurrentConversation = () => {
        if (currentMessages.length === 0) {
            alert('No messages to save');
            return;
        }

        if (!newTitle.trim()) {
            alert('Please enter a title for the conversation');
            return;
        }

        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: newTitle,
            messages: currentMessages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const updatedConversations = [...conversations, newConversation];
        setConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        setNewTitle('');
        setIsCreating(false);
    };

    // Delete conversation
    const deleteConversation = (id: string) => {
        const updatedConversations = conversations.filter((conv) => conv.id !== id);
        setConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    };

    // Load conversation
    const loadConversation = (conversation: Conversation) => {
        onLoadConversation(conversation.messages);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Conversations</h2>
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
                    <button
                        onClick={() => {
                            if (isCreating) {
                                setIsCreating(false);
                                setNewTitle('');
                            } else {
                                setIsCreating(true);
                            }
                        }}
                        className="mb-2 flex items-center text-sm text-primary hover:underline"
                    >
                        {isCreating ? 'Cancel' : 'Save current conversation'}
                    </button>

                    {isCreating && (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter conversation title"
                                className="flex-1 rounded-lg border border-input bg-background p-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                onClick={saveCurrentConversation}
                                className="rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-4 max-h-[300px] overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="text-center text-muted-foreground">No saved conversations</p>
                    ) : (
                        <ul className="space-y-2">
                            {conversations.map((conversation) => (
                                <li
                                    key={conversation.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50"
                                >
                                    <button
                                        onClick={() => loadConversation(conversation)}
                                        className="flex-1 text-left"
                                    >
                                        <p className="font-medium">{conversation.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(conversation.updatedAt).toLocaleString()}
                                        </p>
                                    </button>
                                    <button
                                        onClick={() => deleteConversation(conversation.id)}
                                        className="ml-2 rounded-full p-1 text-destructive hover:bg-destructive/10"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={() => {
                        onNewConversation();
                        onClose();
                    }}
                    className="w-full rounded-lg bg-primary py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    New Conversation
                </button>
            </div>
        </div>
    );
};

export default ConversationManager; 