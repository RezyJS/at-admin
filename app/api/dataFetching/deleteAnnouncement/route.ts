import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const { uid } = await request.json();

  if (!uid) {
    return NextResponse.error();
  }

  const url = `${apiURL}/admin/v1/announcements/${uid}`;

  const apiRequest = await fetcher({
    url,
    method: 'DELETE',
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
