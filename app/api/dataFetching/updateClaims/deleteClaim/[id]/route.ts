import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const url = `${apiURL}/admin/v1/claims/${id}`;

  const apiRequest = await fetcher({
    url,
    method: 'DELETE',
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return afterFetcher(apiRequest);
}
