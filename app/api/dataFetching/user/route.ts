import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const { email } = await request.json();

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/users/search`,
    method: 'POST',
    body: JSON.stringify({ email }),
    refresh,
    access,
  });

  if (apiRequest.error) {
    console.info(apiRequest.status);
    return NextResponse.error();
  }

  console.info(apiRequest.body);

  return afterFetcher(apiRequest);
}
