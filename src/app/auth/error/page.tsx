'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    let errorMessage = 'An error occurred during authentication';

    // Map error codes to user-friendly messages
    switch (error) {
        case 'CredentialsSignin':
            errorMessage = 'Invalid email or password';
            break;
        case 'SessionRequired':
            errorMessage = 'You must be signed in to access this page';
            break;
        case 'AccessDenied':
            errorMessage = 'You do not have permission to access this resource';
            break;
        case 'Default':
        default:
            errorMessage = 'An unexpected error occurred';
            break;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-8 w-8 text-red-600 dark:text-red-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Authentication Error</h1>
                    <p className="mt-2 text-muted-foreground">{errorMessage}</p>
                </div>

                <div className="flex justify-center">
                    <Link
                        href="/auth/signin"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Return to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
} 