'use client';

import React, { useState, useEffect } from 'react';
import { Message } from 'ai';
import { useTheme } from './ThemeProvider';

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

interface SidebarProps {
    currentMessages: Message[];
    currentFiles?: FileReference[];
    onLoadConversation: (messages: Message[], files?: FileReference[]) => void;
    onNewConversation: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
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
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const { theme } = useTheme();

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
    }, []);

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
        setSelectedConversation(newConversation.id);
    };

    // Delete conversation
    const deleteConversation = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            const updatedConversations = conversations.filter((conv) => conv.id !== id);
            setConversations(updatedConversations);
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));

            if (selectedConversation === id) {
                setSelectedConversation(null);
            }
        }
    };

    // Load conversation
    const loadConversation = (conversation: Conversation) => {
        onLoadConversation(conversation.messages, conversation.files);
        setSelectedConversation(conversation.id);
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-y-0 left-0 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-20`}>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-secondary"
                        aria-label="Close sidebar"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <div className="p-4">
                    <button
                        onClick={onNewConversation}
                        className="w-full mb-4 flex items-center justify-center gap-2 rounded-md bg-primary p-2 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Chat
                    </button>

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="w-full mb-2 text-sm text-left text-muted-foreground hover:text-foreground"
                    >
                        {isCreating ? 'Cancel' : 'Save current conversation'}
                    </button>

                    {isCreating && (
                        <div className="mb-4">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter conversation title"
                                className="w-full p-2 text-sm rounded-md border border-input bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                                onClick={saveCurrentConversation}
                                className="w-full mt-2 rounded-md bg-primary p-2 text-xs text-primary-foreground hover:bg-primary/90"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground p-4">No saved conversations</p>
                    ) : (
                        <ul className="space-y-1">
                            {conversations.map((conversation) => (
                                <li
                                    key={conversation.id}
                                    onClick={() => loadConversation(conversation)}
                                    className={`flex items-center justify-between rounded-md p-2 text-sm cursor-pointer ${selectedConversation === conversation.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-secondary'
                                        }`}
                                >
                                    <div className="flex-1 truncate">
                                        <p className="font-medium truncate">{conversation.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(conversation.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                        className="ml-2 p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">AI Chatbot</span>
                        </div>
                        <span className="text-xs text-muted-foreground">v1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 