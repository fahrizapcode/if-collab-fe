import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    const protectedRoutes = ['/dashboard', '/admin'];
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected && !token) {
        console.log(`[Middleware] Redirecting to / from ${pathname} (No token found)`);
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    if (token) {
        console.log(`[Middleware] Token found for ${pathname}`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
