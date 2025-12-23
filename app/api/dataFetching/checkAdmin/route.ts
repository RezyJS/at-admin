import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let refresh_token, access_token;

  console.info('started checking');

  if (!request.cookies.get('refreshToken')) {
    console.info('no cookies');
    const tokens = await request.json();
    refresh_token = tokens.refresh_token;
    access_token = tokens.access_token;
  } else {
    refresh_token = request.cookies.get('refreshToken')?.value;
    access_token = request.cookies.get('accessToken')?.value;
  }

  console.info('started request');
  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins/privileges`,
    refresh: refresh_token,
    access: access_token,
  });

  if (apiRequest.error) {
    console.info('got error');
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest);
}
