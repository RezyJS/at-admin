import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  if (cookies.get('refreshToken')?.value !== undefined) {
  }
}
