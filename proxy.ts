import { NextResponse, NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const refresh_token = request.cookies.get('refresh_token');
  const url = request.nextUrl.clone();

  if (
    refresh_token &&
    refresh_token.value &&
    !request.nextUrl.pathname.startsWith('/admin_panel')
  ) {
    url.pathname = '/admin_panel/claims';
    return NextResponse.rewrite(url);
  } 

  if (
    (!request.nextUrl.pathname.startsWith('/auth') && !refresh_token) ||
    (refresh_token && !refresh_token.value)
  ) {
    url.pathname = '/auth';
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname === '/') {
    url.pathname = '/auth';
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname === '/admin_panel') {
    url.pathname = '/admin_panel/claims';
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
