import fetcher from '@/lib/fetcher';
import { getSession } from '@/lib/session';
import { afterFetcher, apiURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { access, refresh } = await getSession();

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins`,
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.error();
  }

  return await afterFetcher(apiRequest, 'admins');
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

  const { access, refresh } = await getSession();

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins/add`,
    method: 'POST',
    body: JSON.stringify({ email: body.email }),
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.json(
      { error: apiRequest.error },
      { status: apiRequest.status }
    );
  }

  return await afterFetcher(apiRequest);
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

  const { access, refresh } = await getSession();

  const apiRequest = await fetcher({
    url: `${apiURL}/admin/v1/admins/remove`,
    method: 'POST',
    body: JSON.stringify({ email: body.email }),
    refresh,
    access,
  });

  if (apiRequest.error) {
    return NextResponse.json(
      { error: apiRequest.error },
      { status: apiRequest.status }
    );
  }

  return await afterFetcher(apiRequest);
}
