'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoggingService, { LogEntry, LogCategory, LogLevel } from '../../services/LoggingService';

export default function AuditLogs() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filters, setFilters] = useState({
        userId: '',
        category: '' as LogCategory | '',
        level: '' as LogLevel | '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        // Load logs on component mount
        const loggingService = LoggingService.getInstance();
        const filteredLogs = loggingService.getLogs(
            {
                userId: filters.userId || undefined,
                category: (filters.category as LogCategory) || undefined,
                level: (filters.level as LogLevel) || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            },
            undefined,
            undefined
        );
        setLogs(filteredLogs);
    }, [filters]);

    // Handle filter changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            userId: '',
            category: '',
            level: '',
            startDate: '',
            endDate: '',
        });
        setCurrentPage(1);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(logs.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    // Get level badge class
    const getLevelBadgeClass = (level: LogLevel) => {
        switch (level) {
            case LogLevel.ERROR:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case LogLevel.WARNING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case LogLevel.INFO:
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <div className="space-x-2">
                        <Link
                            href="/admin"
                            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Back to Admin
                        </Link>
                        <Link
                            href="/"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Back to Chat
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6 rounded-lg border border-border bg-card p-4">
                    <h2 className="mb-4 text-lg font-medium">Filters</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="mb-1 block text-sm font-medium">User ID</label>
                            <input
                                type="text"
                                name="userId"
                                value={filters.userId}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                                placeholder="Filter by user ID"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">All Categories</option>
                                {Object.values(LogCategory).map((category) => (
                                    <option key={category} value={category}>
                                        {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Level</label>
                            <select
                                name="level"
                                value={filters.level}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">All Levels</option>
                                {Object.values(LogLevel).map((level) => (
                                    <option key={level} value={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, logs.length)} of {logs.length} logs
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm">Items per page:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-md border border-input bg-background p-1 text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Timestamp</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Level</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {currentLogs.length > 0 ? (
                                currentLogs.map((log) => (
                                    <tr key={log.id} className="bg-card hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm">{formatTimestamp(log.timestamp)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-medium">{log.userName}</div>
                                            <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{log.action}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeClass(
                                                    log.level
                                                )}`}
                                            >
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {log.details ? (
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    onClick={() => alert(JSON.stringify(log.details, null, 2))}
                                                >
                                                    View Details
                                                </button>
                                            ) : (
                                                <span className="text-muted-foreground">No details</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No logs found matching the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <nav className="flex items-center space-x-1">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="rounded-md border border-border p-2 text-sm disabled:opacity-50"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Show 5 pages at most, centered around current page
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`rounded-md px-3 py-2 text-sm ${currentPage === pageNum
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-border hover:bg-muted'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-md border border-border p-2 text-sm disabled:opacity-50"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </nav>
                    </div>
                )}
            </main>
        </div>
    );
} 