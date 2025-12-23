import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const pageSize = searchParams.get('page_size');

  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const url = cursor
    ? `${apiURL}/admin/v1/claims/chunk?cursor=${cursor}&page_size=${pageSize}`
    : `${apiURL}/admin/v1/claims/chunk?page_size=${pageSize}`;

  const apiRequest = await fetcher({
    url,
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest, 'claims');
}
