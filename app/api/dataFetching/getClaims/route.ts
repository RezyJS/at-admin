import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const afterId = searchParams.get('afterId');

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const url = afterId
    ? `${apiURL}/admin/v1/claims/chunk?afterId=${afterId}`
    : `${apiURL}/admin/v1/claims/chunk`;

  const apiRequest = await fetcher({
    url,
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.json(
      { error: apiRequest.error },
      { status: apiRequest.status }
    );
  }

  return afterFetcher(apiRequest, 'claims');
}
