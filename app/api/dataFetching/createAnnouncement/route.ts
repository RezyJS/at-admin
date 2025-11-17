import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const { title, description } = await request.json();

  if (!title || !description) {
    return NextResponse.error();
  }

  const url = `${apiURL}/admin/v1/announcements`;

  const apiRequest = await fetcher({
    url,
    method: 'POST',
    body: JSON.stringify({ title, description }),
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
