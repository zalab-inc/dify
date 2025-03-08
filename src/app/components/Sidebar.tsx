'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Tooltip component
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    const [show, setShow] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onFocus={() => setShow(true)}
                onBlur={() => setShow(false)}
            >
                {children}
            </div>
            {show && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs rounded bg-foreground text-background whitespace-nowrap z-50">
                    {text}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 border-4 border-transparent border-t-foreground"></div>
                </div>
            )}
        </div>
    );
};

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
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [renameTitle, setRenameTitle] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const { theme } = useTheme();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

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

    // Rename conversation
    const startRenaming = (id: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenaming(id);
        setRenameTitle(currentTitle);
    };

    const saveRename = (id: string) => {
        if (!renameTitle.trim()) {
            alert('Please enter a title for the conversation');
            return;
        }

        const updatedConversations = conversations.map(conv =>
            conv.id === id
                ? { ...conv, title: renameTitle, updatedAt: new Date().toISOString() }
                : conv
        );

        setConversations(updatedConversations);
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        setIsRenaming(null);
        setRenameTitle('');
    };

    // Load conversation
    const loadConversation = (conversation: Conversation) => {
        onLoadConversation(conversation.messages, conversation.files);
        setSelectedConversation(conversation.id);
    };

    // Close sort menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sortMenu = document.getElementById('sort-menu');
            if (sortMenu && !sortMenu.contains(event.target as Node) && !(event.target as Element).closest('[data-sort-button]')) {
                sortMenu.classList.add('hidden');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(
        (conv) => conv.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    // Sort conversations
    const sortedConversations = [...filteredConversations].sort((a, b) => {
        switch (sortOrder) {
            case 'newest':
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            case 'oldest':
                return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            case 'alphabetical':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-y-0 left-0 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-20`}>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                    <Tooltip text="Close sidebar">
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
                    </Tooltip>
                </div>

                <div className="p-4">
                    <Tooltip text="Start a new conversation">
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
                    </Tooltip>

                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full p-2 pl-8 text-sm rounded-md border border-input bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                aria-label="Search conversations"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                                    aria-label="Clear search"
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
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4 flex justify-between items-center">
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="text-sm text-left text-muted-foreground hover:text-foreground"
                        >
                            {isCreating ? 'Cancel' : 'Save current conversation'}
                        </button>

                        <div className="relative">
                            <Tooltip text="Sort conversations">
                                <button
                                    data-sort-button
                                    onClick={() => {
                                        const menu = document.getElementById('sort-menu');
                                        if (menu) menu.classList.toggle('hidden');
                                    }}
                                    className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    aria-label="Sort conversations"
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
                                        <path d="M3 6h18M7 12h10M11 18h4" />
                                    </svg>
                                </button>
                            </Tooltip>
                            <div
                                id="sort-menu"
                                className="absolute right-0 mt-1 w-40 rounded-md border border-border bg-background shadow-lg hidden z-10"
                            >
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setSortOrder('newest');
                                            document.getElementById('sort-menu')?.classList.add('hidden');
                                        }}
                                        className={`block w-full px-4 py-2 text-left text-sm ${sortOrder === 'newest' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                                            }`}
                                    >
                                        Newest first
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortOrder('oldest');
                                            document.getElementById('sort-menu')?.classList.add('hidden');
                                        }}
                                        className={`block w-full px-4 py-2 text-left text-sm ${sortOrder === 'oldest' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                                            }`}
                                    >
                                        Oldest first
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortOrder('alphabetical');
                                            document.getElementById('sort-menu')?.classList.add('hidden');
                                        }}
                                        className={`block w-full px-4 py-2 text-left text-sm ${sortOrder === 'alphabetical' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                                            }`}
                                    >
                                        Alphabetical
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

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
                    {sortedConversations.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground p-4">
                            {debouncedSearchQuery ? 'No conversations found' : 'No saved conversations'}
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {sortedConversations.map((conversation) => (
                                <li
                                    key={conversation.id}
                                    onClick={() => loadConversation(conversation)}
                                    className={`flex items-center justify-between rounded-md p-2 text-sm cursor-pointer ${selectedConversation === conversation.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-secondary'
                                        }`}
                                >
                                    {isRenaming === conversation.id ? (
                                        <div className="flex-1 pr-2">
                                            <input
                                                type="text"
                                                value={renameTitle}
                                                onChange={(e) => setRenameTitle(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveRename(conversation.id);
                                                    if (e.key === 'Escape') {
                                                        setIsRenaming(null);
                                                        setRenameTitle('');
                                                    }
                                                }}
                                                className="w-full p-1 text-sm rounded-md border border-input bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            />
                                            <div className="flex mt-1 space-x-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        saveRename(conversation.id);
                                                    }}
                                                    className="flex-1 rounded-sm bg-primary/80 px-2 py-0.5 text-xs text-primary-foreground hover:bg-primary"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsRenaming(null);
                                                        setRenameTitle('');
                                                    }}
                                                    className="flex-1 rounded-sm bg-secondary px-2 py-0.5 text-xs hover:bg-secondary/80"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 truncate">
                                            <p className="font-medium truncate">{conversation.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(conversation.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {isRenaming !== conversation.id && (
                                        <div className="flex">
                                            <Tooltip text="Rename conversation">
                                                <button
                                                    onClick={(e) => startRenaming(conversation.id, conversation.title, e)}
                                                    className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                                                    aria-label="Rename conversation"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3.5 w-3.5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                                    </svg>
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Delete conversation">
                                                <button
                                                    onClick={(e) => deleteConversation(conversation.id, e)}
                                                    className="ml-1 p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    aria-label="Delete conversation"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3.5 w-3.5"
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
                                            </Tooltip>
                                        </div>
                                    )}
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