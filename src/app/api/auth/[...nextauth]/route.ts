import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

// Define user roles
export enum UserRole {
    USER = "user",
    ADMIN = "admin",
    ANALYST = "analyst",
}

// Sample users database - in a real application, this would be stored in a database
const users = [
    {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123", // In a real app, this would be hashed
        role: UserRole.ADMIN,
    },
    {
        id: "2",
        name: "Regular User",
        email: "user@example.com",
        password: "user123", // In a real app, this would be hashed
        role: UserRole.USER,
    },
    {
        id: "3",
        name: "Analyst User",
        email: "analyst@example.com",
        password: "analyst123", // In a real app, this would be hashed
        role: UserRole.ANALYST,
    },
];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Find user in the database
                const user = users.find((user) => user.email === credentials.email);

                // Check if user exists and password matches
                if (user && user.password === credentials.password) {
                    // Return user object without the password
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Add role to the token if user is defined
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Add role to the session
            if (session.user) {
                session.user.role = token.role as UserRole;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 