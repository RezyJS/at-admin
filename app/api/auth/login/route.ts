import fetcher from '@/lib/fetcher';
import { createSession } from '@/lib/session';
import { API_CHECK_ADMIN_URL, API_LOGIN_URL } from '@/lib/urls';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  const response = await axios.post(API_LOGIN_URL, {
    email,
    code: Number(code),
  });

  if (response.status !== 200) return NextResponse.error();

  const { access_token: access, refresh_token: refresh } = response.data;

  const isAdmin = await fetcher({ url: API_CHECK_ADMIN_URL, refresh, access });

  if (isAdmin.error) {
    return NextResponse.json(
      { error: 'Вы не администратор!' },
      { status: 403 }
    );
  }

  await createSession({ access, refresh });

  return NextResponse.json({ message: 'Успех!' }, { status: 200 });
}
