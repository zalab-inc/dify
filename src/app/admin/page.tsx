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

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Link
                                href="/admin/audit-logs"
                                className="flex items-center rounded-lg border border-border p-3 hover:bg-muted"
                            >
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium">Audit Logs</h3>
                                    <p className="text-xs text-muted-foreground">View system activity logs</p>
                                </div>
                            </Link>
                            <Link
                                href="/analytics"
                                className="flex items-center rounded-lg border border-border p-3 hover:bg-muted"
                            >
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium">Analytics</h3>
                                    <p className="text-xs text-muted-foreground">View usage analytics</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold">System Status</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">API Status</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database Status</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">OpenAI API</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Anthropic API</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                                    Operational
                                </span>
                            </div>
                        </div>
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