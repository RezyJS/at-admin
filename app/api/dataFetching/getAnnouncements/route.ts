import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const afterId = searchParams.get('afterId');

  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const url =
    afterId === undefined
      ? `${apiURL}/v1/announcements/chunk?cursor=${afterId}`
      : `${apiURL}/v1/announcements/chunk`;

  const apiRequest = await fetcher({
    url,
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest, 'news');
}
