import fetcher from '@/lib/fetcher';
import { API_CHECK_ADMIN_URL } from '@/lib/urls';
import { afterFetcher } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const accessToken = request.cookies.get('accessToken')?.value;

  if (refreshToken === undefined) {
    return NextResponse.json(
      { error: 'Код сессии не обнаружен!' },
      { status: 401 }
    );
  }

  const response = await fetcher({
    url: API_CHECK_ADMIN_URL,
    refresh: refreshToken,
    access: accessToken,
  });

  if (response.error) {
    return NextResponse.json(
      { error: 'Ошибка проверки привилегий' },
      { status: response.status }
    );
  }

  return await afterFetcher(response);
}
