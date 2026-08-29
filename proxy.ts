import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute) {
    const session = request.cookies.get('admin_session');
    
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /admin to /admin/dashboard ? Or just render dashboard at /admin
  // We'll just render it at /admin

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
