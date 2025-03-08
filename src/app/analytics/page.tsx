'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ModelUsage {
    model: string;
    count: number;
    percentage: number;
}

interface DailyUsage {
    date: string;
    conversations: number;
    messages: number;
}

interface FeedbackStats {
    helpful: number;
    notHelpful: number;
    helpfulPercentage: number;
}

export default function Analytics() {
    const { data: session } = useSession();
    const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
    const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
    const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
        helpful: 0,
        notHelpful: 0,
        helpfulPercentage: 0,
    });

    // In a real application, this data would come from an API
    useEffect(() => {
        // Mock data for demonstration purposes
        const mockModelUsage: ModelUsage[] = [
            { model: 'gpt-3.5-turbo', count: 2145, percentage: 57 },
            { model: 'gpt-4', count: 892, percentage: 24 },
            { model: 'claude-3-opus-20240229', count: 423, percentage: 11 },
            { model: 'claude-3-sonnet-20240229', count: 322, percentage: 8 },
        ];

        const mockDailyUsage: DailyUsage[] = [
            { date: '2023-03-01', conversations: 42, messages: 378 },
            { date: '2023-03-02', conversations: 38, messages: 342 },
            { date: '2023-03-03', conversations: 45, messages: 405 },
            { date: '2023-03-04', conversations: 52, messages: 468 },
            { date: '2023-03-05', conversations: 48, messages: 432 },
            { date: '2023-03-06', conversations: 56, messages: 504 },
            { date: '2023-03-07', conversations: 62, messages: 558 },
        ];

        const mockFeedbackStats: FeedbackStats = {
            helpful: 1245,
            notHelpful: 187,
            helpfulPercentage: 87,
        };

        setModelUsage(mockModelUsage);
        setDailyUsage(mockDailyUsage);
        setFeedbackStats(mockFeedbackStats);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                    <Link
                        href="/"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Back to Chat
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Total Messages</h2>
                        <p className="text-3xl font-bold">3,782</p>
                        <p className="mt-1 text-xs text-muted-foreground">+12% from last month</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">User Satisfaction</h2>
                        <p className="text-3xl font-bold">{feedbackStats.helpfulPercentage}%</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Based on {feedbackStats.helpful + feedbackStats.notHelpful} feedback responses
                        </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Active Users</h2>
                        <p className="text-3xl font-bold">42</p>
                        <p className="mt-1 text-xs text-muted-foreground">+8% from last week</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold">Model Usage</h2>
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Model</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Usage Count</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Percentage</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Visualization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {modelUsage.map((model) => (
                                    <tr key={model.model} className="bg-card hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm font-medium">{model.model}</td>
                                        <td className="px-4 py-3 text-sm">{model.count.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm">{model.percentage}%</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="h-4 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-4 rounded-full bg-primary"
                                                    style={{ width: `${model.percentage}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold">Daily Usage</h2>
                    <div className="overflow-hidden rounded-lg border border-border bg-card p-4">
                        <div className="h-64 w-full">
                            {/* In a real application, this would be a chart component */}
                            <div className="flex h-full items-end justify-between">
                                {dailyUsage.map((day) => (
                                    <div key={day.date} className="flex flex-col items-center">
                                        <div className="relative w-12">
                                            <div
                                                className="absolute bottom-0 w-6 rounded-t bg-primary"
                                                style={{ height: `${(day.conversations / 70) * 100}%` }}
                                            ></div>
                                            <div
                                                className="absolute bottom-0 ml-6 w-6 rounded-t bg-blue-500"
                                                style={{ height: `${(day.messages / 600) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="mt-2 text-xs">
                                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center space-x-6">
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-primary"></div>
                                <span className="text-xs">Conversations</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs">Messages</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold">User Feedback</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-medium">Feedback Summary</h3>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Helpful Responses</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {feedbackStats.helpful.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Not Helpful Responses</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {feedbackStats.notHelpful.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="h-4 w-full rounded-full bg-muted">
                                <div
                                    className="h-4 rounded-full bg-green-500"
                                    style={{ width: `${feedbackStats.helpfulPercentage}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 flex justify-between text-xs">
                                <span>{feedbackStats.helpfulPercentage}% Helpful</span>
                                <span>{100 - feedbackStats.helpfulPercentage}% Not Helpful</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-medium">Common Issues</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center justify-between">
                                    <span className="text-sm">Incorrect information</span>
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        42%
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-sm">Incomplete answers</span>
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        28%
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-sm">Unclear responses</span>
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        18%
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-sm">Irrelevant information</span>
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        12%
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 