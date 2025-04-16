import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { apiURL } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { token: formToken } = await request.json();

  const apiResponse = await axios.post(`${apiURL}/v1/auth/confirm-login`, {
    token: formToken
  });

  const { token, refresh_token } = apiResponse.data;

  const response = new NextResponse();

  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60,
    secure: true,
    sameSite: 'strict'
  });

  response.cookies.set('access_token', token, {
    httpOnly: true,
    maxAge: 15 * 60,
    secure: true,
    sameSite: 'strict'
  });

  return response;
}
