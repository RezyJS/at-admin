import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const { uid, reason } = await request.json();

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/users/${uid}/block`,
    method: 'POST',
    body: JSON.stringify({ reason }),
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
