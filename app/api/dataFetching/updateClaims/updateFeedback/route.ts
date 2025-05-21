import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { feedback, id } = await request.json();

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const url = `${apiURL}/admin/v1/claims/${id}/feedback`;

  const apiRequest = await fetcher({
    url,
    body: JSON.stringify({ feedback }),
    method: 'POST',
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
