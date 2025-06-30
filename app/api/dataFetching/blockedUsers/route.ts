import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/users/blocked`,
    refresh,
    access,
  });

  console.info('blocked');

  if (apiRequest.error) {
    console.info(apiRequest.status);
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
