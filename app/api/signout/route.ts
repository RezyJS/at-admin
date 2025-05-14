import { NextRequest, NextResponse } from 'next/server';
import { apiURL } from '@/lib/utils';
import fetcher from '@/lib/fetcher';

export async function POST(request: NextRequest) {
  const refresh_token = request.cookies.get('refresh_token');
  const access_token = request.cookies.get('access_token');

  await fetcher({
    url: `${apiURL}/v1/auth/logout`,
    method: 'POST',
    body: JSON.stringify({ token: refresh_token }),
    refresh: refresh_token?.value,
    access: access_token?.value
  });

  const response = new NextResponse();
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('isa');

  return response;
}
