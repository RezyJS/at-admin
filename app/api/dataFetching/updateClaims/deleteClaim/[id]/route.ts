import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const url = `${apiURL}/admin/v1/claims/${id}`;

  const apiRequest = await fetcher({
    url,
    method: 'DELETE',
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest);
}
