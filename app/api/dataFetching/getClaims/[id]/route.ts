import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.url.slice(request.url.lastIndexOf('/'));

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/claims/${id}`,
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
