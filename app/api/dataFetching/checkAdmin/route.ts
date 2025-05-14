import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { refresh_token, access_token } = await request.json();

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins/privileges`,
    refresh: refresh_token,
    access: access_token
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
