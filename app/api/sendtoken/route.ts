import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { apiURL } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  const apiResponse = await axios.post(`${apiURL}/v1/auth/confirm-login`, {
    email,
    code: +code
  });

  const { access_token, refresh_token } = apiResponse.data;

  const response = new NextResponse();

  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    maxAge: 90 * 24 * 60 * 60,
    secure: true,
    sameSite: 'strict'
  });

  response.cookies.set('access_token', access_token, {
    httpOnly: true,
    maxAge: 15 * 60,
    secure: true,
    sameSite: 'strict'
  });

  return response;
}
