import fetcher from '@/lib/fetcher';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins`,
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  console.info(apiRequest.body);

  return afterFetcher(apiRequest, 'admins');
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body || !body.email) {
    return NextResponse.json({ error: 'Пустое тело запроса' }, { status: 400 });
  }

  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(body.email);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Некорректный email адрес' },
      { status: 400 }
    );
  }

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins`,
    method: 'POST',
    body: JSON.stringify({ email: body.email }),
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.json(
      { error: apiRequest.error },
      { status: apiRequest.status }
    );
  }

  return afterFetcher(apiRequest);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  if (!body || !body.email) {
    return NextResponse.json({ error: 'Пустое тело запроса' }, { status: 400 });
  }

  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(body.email);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Некорректный email адрес' },
      { status: 400 }
    );
  }

  const refresh = request.cookies.get('refresh_token')?.value;
  const access = request.cookies.get('access_token')?.value;

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins`,
    method: 'DELETE',
    body: JSON.stringify({ email: body.email }),
    refresh,
    access
  });

  if (apiRequest.error) {
    return NextResponse.json(
      { error: apiRequest.error },
      { status: apiRequest.status }
    );
  }

  return afterFetcher(apiRequest);
}
