import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

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
    url: `${apiURL}/admin/v1/users/${userSearch.body.uid}/check-block`,
    method: 'GET',
    access,
    refresh,
  });

  if (apiRequest.error && apiRequest.status !== 404) {
    return NextResponse.error();
  }

  const isBlocked = (() => {
    switch (apiRequest.status) {
      case 200:
        return true;
      case 404:
      default:
        return false;
    }
  })();

  return await afterFetcher(apiRequest, 'block', isBlocked);
}
