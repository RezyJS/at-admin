import { NextResponse, NextRequest } from 'next/server';

const baseURL = process.env.NEXT_PUBLIC_URL;

export async function middleware(request: NextRequest) {
  const refresh_token = request.cookies.get('refresh_token');

  if (
    refresh_token &&
    refresh_token.value &&
    !request.nextUrl.pathname.startsWith('/admin_panel')
  ) {
    return NextResponse.redirect(`${baseURL}/admin_panel/claims`);
  }

  if (
    (!request.nextUrl.pathname.startsWith('/auth') && !refresh_token) ||
    (refresh_token && !refresh_token.value)
  ) {
    return NextResponse.redirect(`${baseURL}/auth`);
  }

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(`${baseURL}/auth`);
  }

  if (request.nextUrl.pathname === '/admin_panel') {
    return NextResponse.redirect(`${baseURL}/admin_panel/claims`);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
