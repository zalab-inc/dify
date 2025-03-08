'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setIsLoading(false);
                return;
            }

            // Redirect to the home page on successful sign-in
            router.push('/');
        } catch (error) {
            setError('An error occurred during sign-in');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">Sign In</h1>
                    <p className="mt-2 text-muted-foreground">
                        Enter your credentials to access the AI Chatbot
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-input bg-background p-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-input bg-background p-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Demo Accounts:</p>
                    <p className="mt-1">
                        Admin: admin@example.com / admin123
                        <br />
                        User: user@example.com / user123
                        <br />
                        Analyst: analyst@example.com / analyst123
                    </p>
                </div>
            </div>
        </div>
    );
} 