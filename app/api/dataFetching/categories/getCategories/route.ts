import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const apiRequest = await fetcher({
    url: `${apiURL}/v1/categories`,
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest);
}
