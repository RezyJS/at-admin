import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { apiURL, baseURL } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  const apiResponse = await axios.post(`${apiURL}/v1/auth/confirm-login`, {
    email,
    code: +code,
  });

  const { access_token, refresh_token } = apiResponse.data;

  const { is_admin } = await axios
    .post(`${baseURL}/api/dataFetching/checkAdmin`, {
      refresh_token,
      access_token,
    })
    .then((res) => res.data.privileges);

  if (is_admin === false)
    return NextResponse.json({ error: 'Вы не админ!' }, { status: 403 });

  const response = new NextResponse();

  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    maxAge: 90 * 24 * 60 * 60,
    secure: true,
    sameSite: 'strict',
  });

  response.cookies.set('access_token', access_token, {
    httpOnly: true,
    maxAge: 15 * 60,
    secure: true,
    sameSite: 'strict',
  });

  return response;
}
