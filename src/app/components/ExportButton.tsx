'use client';

import React from 'react';
import { Message } from 'ai';

interface ExportButtonProps {
    messages: Message[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ messages }) => {
    const exportAsText = () => {
        if (messages.length === 0) {
            alert('No messages to export');
            return;
        }

        const text = messages
            .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
            .join('\n\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportAsJSON = () => {
        if (messages.length === 0) {
            alert('No messages to export');
            return;
        }

        const json = JSON.stringify(messages, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportAsMarkdown = () => {
        if (messages.length === 0) {
            alert('No messages to export');
            return;
        }

        const markdown = messages
            .map((message) => {
                const role = message.role === 'user' ? 'You' : 'AI';
                return `### ${role}\n\n${message.content}`;
            })
            .join('\n\n');

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative">
            <button
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Export"
                onClick={() => {
                    const menu = document.getElementById('export-menu');
                    if (menu) {
                        menu.classList.toggle('hidden');
                    }
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                >
                    <path
                        fillRule="evenodd"
                        d="M9.75 6.75h-3a3 3 0 00-3 3v7.5a3 3 0 003 3h7.5a3 3 0 003-3v-7.5a3 3 0 00-3-3h-3V1.5a.75.75 0 00-1.5 0v5.25zm0 0h1.5v5.69l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V6.75z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div
                id="export-menu"
                className="absolute right-0 mt-2 hidden w-48 rounded-md border border-border bg-background shadow-lg"
            >
                <div className="py-1">
                    <button
                        onClick={exportAsText}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                    >
                        Export as Text
                    </button>
                    <button
                        onClick={exportAsJSON}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                    >
                        Export as JSON
                    </button>
                    <button
                        onClick={exportAsMarkdown}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary"
                    >
                        Export as Markdown
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportButton; 