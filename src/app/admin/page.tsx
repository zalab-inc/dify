'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UsageStats {
    totalConversations: number;
    totalMessages: number;
    activeUsers: number;
    averageMessagesPerConversation: number;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [usageStats, setUsageStats] = useState<UsageStats>({
        totalConversations: 0,
        totalMessages: 0,
        activeUsers: 0,
        averageMessagesPerConversation: 0,
    });

    // In a real application, this data would come from an API
    useEffect(() => {
        // Mock data for demonstration purposes
        const mockUsers: User[] = [
            { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
            { id: '2', name: 'Regular User', email: 'user@example.com', role: 'user' },
            { id: '3', name: 'Analyst User', email: 'analyst@example.com', role: 'analyst' },
            { id: '4', name: 'John Doe', email: 'john@example.com', role: 'user' },
            { id: '5', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        ];

        const mockStats: UsageStats = {
            totalConversations: 125,
            totalMessages: 3782,
            activeUsers: 42,
            averageMessagesPerConversation: 30.3,
        };

        setUsers(mockUsers);
        setUsageStats(mockStats);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <Link
                        href="/"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Back to Chat
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Total Conversations</h2>
                        <p className="text-3xl font-bold">{usageStats.totalConversations}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Total Messages</h2>
                        <p className="text-3xl font-bold">{usageStats.totalMessages}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Active Users</h2>
                        <p className="text-3xl font-bold">{usageStats.activeUsers}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Avg. Messages per Conversation</h2>
                        <p className="text-3xl font-bold">{usageStats.averageMessagesPerConversation.toFixed(1)}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold">User Management</h2>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => (
                                    <tr key={user.id} className="bg-card hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm">{user.name}</td>
                                        <td className="px-4 py-3 text-sm">{user.email}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : user.role === 'analyst'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}
                                            >
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <button className="mr-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                Edit
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold">System Settings</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-medium">API Rate Limits</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Requests per minute:</span>
                                    <input
                                        type="number"
                                        className="w-24 rounded-md border border-input bg-background p-1 text-sm"
                                        defaultValue={60}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Requests per day:</span>
                                    <input
                                        type="number"
                                        className="w-24 rounded-md border border-input bg-background p-1 text-sm"
                                        defaultValue={10000}
                                    />
                                </div>
                            </div>
                            <button className="mt-4 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90">
                                Save Changes
                            </button>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-medium">Model Settings</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Default model:</span>
                                    <select className="w-48 rounded-md border border-input bg-background p-1 text-sm">
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        <option value="gpt-4">GPT-4</option>
                                        <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Default temperature:</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="1"
                                        className="w-24 rounded-md border border-input bg-background p-1 text-sm"
                                        defaultValue={0.7}
                                    />
                                </div>
                            </div>
                            <button className="mt-4 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 