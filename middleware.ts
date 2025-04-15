import { NextResponse, NextRequest } from 'next/server';

const baseURL = process.env.NEXT_PUBLIC_URL;

export async function middleware(request: NextRequest) {
  console.info(`url: ${request.nextUrl.pathname}`);

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(`${baseURL}/auth`);
  }
}

export const config = {
  matcher: ['/']
};
