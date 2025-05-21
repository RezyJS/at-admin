import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let refresh_token, access_token;

  if (!request.cookies.get('refresh_token')) {
    const tokens = await request.json();
    refresh_token = tokens.refresh_token;
    access_token = tokens.access_token;
  } else {
    refresh_token = request.cookies.get('refresh_token')?.value;
    access_token = request.cookies.get('access_token')?.value;
  }

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
