import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { uid, cursor, page_size = 15 } = await request.json();

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  console.info('uid', uid, 'page_size', page_size);
  console.info(
    'url',
    `${apiURL}/admin/v1/users/${uid}/claims?page_size=${page_size}`
  );

  // const url = cursor
  // ? `${apiURL}/admin/v1/users/${uid}/claims?cursor=${cursor}&page_size=${page_size}`
  // : `${apiURL}/admin/v1/users/${uid}/claims?page_size=${page_size}`;

  const url = `${apiURL}/admin/v1/users/${uid}/claims?page_size=${page_size}`;

  const apiRequest = await fetcher({
    url,
    refresh,
    access,
  });

  if (apiRequest.error) {
    console.info(apiRequest);
    return NextResponse.error();
  }

  return afterFetcher(apiRequest, 'claims');
}
