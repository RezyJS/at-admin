import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const { email } = await request.json();

  const userSearch = await fetcher({
    url: `${apiURL}/admin/v1/users/search`,
    method: 'POST',
    body: JSON.stringify({ email }),
    access,
    refresh,
  });

  if (userSearch.error) {
    return NextResponse.error();
  }

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/${userSearch.body.uid}/check-block`,
    method: 'GET',
    access,
    refresh,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
