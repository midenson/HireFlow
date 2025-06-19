import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/dashboard', '/', '/interview'];

export function middleware (request: NextRequest) {
    const currentUser = request.cookies.get('user')?.value;
    const { pathname } = request.nextUrl;

    if (!currentUser && protectedRoutes.includes(pathname)) {
        const authUrl = new URL('/auth', request.url);
        return NextResponse.redirect(authUrl);
    }

    return NextResponse.next()
}