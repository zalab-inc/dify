'use client';

import React, { useState, useEffect } from 'react';
import { Message } from 'ai';

interface FileReference {
    name: string;
    content: string;
    uploadedAt: string;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    files?: FileReference[];
    createdAt: string;
    updatedAt: string;
}

interface ConversationManagerProps {
    currentMessages: Message[];
    currentFiles?: FileReference[];
    onLoadConversation: (messages: Message[], files?: FileReference[]) => void;
    onNewConversation: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
    currentMessages,
    currentFiles = [],
    onLoadConversation,
    onNewConversation,
    isOpen,
    onClose,
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

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
            files: currentFiles.length > 0 ? currentFiles : undefined,
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
        setSelectedConversation(null);
    };

    // Load conversation
    const loadConversation = (conversation: Conversation) => {
        onLoadConversation(conversation.messages, conversation.files);
        onClose();
    };

    // View conversation details
    const viewConversationDetails = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {selectedConversation ? 'Conversation Details' : 'Conversations'}
                    </h2>
                    <button
                        onClick={() => {
                            setSelectedConversation(null);
                            onClose();
                        }}
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

                {selectedConversation ? (
                    // Conversation details view
                    <div>
                        <button
                            onClick={() => setSelectedConversation(null)}
                            className="mb-4 flex items-center text-sm text-primary hover:underline"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to conversations
                        </button>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">{selectedConversation.title}</h3>
                            <p className="text-xs text-muted-foreground">
                                Created: {new Date(selectedConversation.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Updated: {new Date(selectedConversation.updatedAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-medium">Messages</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedConversation.messages.length} messages in this conversation
                            </p>
                        </div>

                        {selectedConversation.files && selectedConversation.files.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium">Files</h4>
                                <ul className="mt-2 space-y-1">
                                    {selectedConversation.files.map((file, index) => (
                                        <li key={index} className="text-sm">
                                            <span className="font-medium">{file.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <button
                                onClick={() => loadConversation(selectedConversation)}
                                className="flex-1 rounded-lg bg-primary py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Load Conversation
                            </button>
                            <button
                                onClick={() => deleteConversation(selectedConversation.id)}
                                className="rounded-lg bg-destructive py-2 px-4 text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    // Conversations list view
                    <>
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
                                                onClick={() => viewConversationDetails(conversation)}
                                                className="flex-1 text-left"
                                            >
                                                <p className="font-medium">{conversation.title}</p>
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <span>{new Date(conversation.updatedAt).toLocaleString()}</span>
                                                    {conversation.files && conversation.files.length > 0 && (
                                                        <span className="ml-2 flex items-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="mr-1 h-3 w-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                                />
                                                            </svg>
                                                            {conversation.files.length} file(s)
                                                        </span>
                                                    )}
                                                </div>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default ConversationManager; 