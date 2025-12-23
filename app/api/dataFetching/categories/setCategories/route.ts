import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refreshToken')?.value;
  const access = request.cookies.get('accessToken')?.value;

  const { categories } = await request.json();
  const body = JSON.stringify({ categories });

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/categories/`,
    method: 'PUT',
    body,
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest);
}
