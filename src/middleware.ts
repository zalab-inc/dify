import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from './app/api/auth/[...nextauth]/route';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/error'];

// Define routes that require specific roles
const roleBasedRoutes = [
    {
        path: '/admin',
        roles: [UserRole.ADMIN],
    },
    {
        path: '/analytics',
        roles: [UserRole.ADMIN, UserRole.ANALYST],
    },
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is public
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Get the token from the session
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // If no token and not on a public route, redirect to sign-in
    if (!token) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Check role-based access for protected routes
    for (const route of roleBasedRoutes) {
        if (pathname.startsWith(route.path)) {
            const userRole = token.role as UserRole;
            if (!route.roles.includes(userRole)) {
                // Redirect to access denied page if the user doesn't have the required role
                return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url));
            }
        }
    }

    // Allow access to the requested route
    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (Next Auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
    ],
}; 