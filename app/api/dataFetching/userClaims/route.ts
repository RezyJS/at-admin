import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { id, cursor, page_size = 15 } = await request.json();

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const url = cursor
    ? `${apiURL}/admin/v1/users/${id}/claims?cursor=${cursor}&page_size=${page_size}`
    : `${apiURL}/admin/v1/users/${id}/claims?page_size=${page_size}`;

  console.info(id, cursor, page_size);

  const apiRequest = await fetcher({
    url,
    refresh,
    access,
  });

  if (apiRequest.error) {
    console.info(apiRequest.status);
    return NextResponse.error();
  }

  console.info('answer', apiRequest.body);

  return afterFetcher(apiRequest, 'claims');
}
