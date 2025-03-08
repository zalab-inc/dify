import { UserRole } from '../api/auth/[...nextauth]/route';

// Define log levels
export enum LogLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
}

// Define log categories
export enum LogCategory {
    AUTH = 'authentication',
    USER_MANAGEMENT = 'user_management',
    CHAT = 'chat',
    SYSTEM = 'system',
    API = 'api',
}

// Define log entry interface
export interface LogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userEmail: string;
    userRole: UserRole;
    action: string;
    category: LogCategory;
    level: LogLevel;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

class LoggingService {
    private static instance: LoggingService;
    private logs: LogEntry[] = [];

    private constructor() {
        // Initialize logs from localStorage in a real application
        try {
            const savedLogs = localStorage.getItem('audit-logs');
            if (savedLogs) {
                this.logs = JSON.parse(savedLogs);
            }
        } catch (error) {
            console.error('Error loading logs:', error);
        }
    }

    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            LoggingService.instance = new LoggingService();
        }
        return LoggingService.instance;
    }

    public log(
        userId: string,
        userName: string,
        userEmail: string,
        userRole: UserRole,
        action: string,
        category: LogCategory,
        level: LogLevel = LogLevel.INFO,
        details?: any,
        ipAddress?: string,
        userAgent?: string
    ): void {
        const logEntry: LogEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            userId,
            userName,
            userEmail,
            userRole,
            action,
            category,
            level,
            details,
            ipAddress,
            userAgent,
        };

        this.logs.push(logEntry);
        this.saveLogs();

        // In a real application, you would also send this to a server or logging service
        console.log(`[${level.toUpperCase()}][${category}] ${action}`, details);
    }

    public getLogs(
        filters?: {
            userId?: string;
            category?: LogCategory;
            level?: LogLevel;
            startDate?: string;
            endDate?: string;
        },
        limit?: number,
        offset?: number
    ): LogEntry[] {
        let filteredLogs = [...this.logs];

        // Apply filters
        if (filters) {
            if (filters.userId) {
                filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
            }
            if (filters.category) {
                filteredLogs = filteredLogs.filter((log) => log.category === filters.category);
            }
            if (filters.level) {
                filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
            }
            if (filters.startDate) {
                const startDate = new Date(filters.startDate).getTime();
                filteredLogs = filteredLogs.filter(
                    (log) => new Date(log.timestamp).getTime() >= startDate
                );
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate).getTime();
                filteredLogs = filteredLogs.filter(
                    (log) => new Date(log.timestamp).getTime() <= endDate
                );
            }
        }

        // Sort by timestamp (newest first)
        filteredLogs.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Apply pagination
        if (offset !== undefined && limit !== undefined) {
            return filteredLogs.slice(offset, offset + limit);
        }

        return filteredLogs;
    }

    public clearLogs(): void {
        this.logs = [];
        this.saveLogs();
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private saveLogs(): void {
        // In a real application, you would save to a database
        // For this demo, we'll use localStorage
        try {
            // Keep only the last 1000 logs to prevent localStorage from getting too large
            const logsToSave = this.logs.slice(-1000);
            localStorage.setItem('audit-logs', JSON.stringify(logsToSave));
        } catch (error) {
            console.error('Error saving logs:', error);
        }
    }
}

export default LoggingService; 