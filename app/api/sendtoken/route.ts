import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const { token: formToken } = await request.json();

  const apiResponse = await axios.post(`${baseURL}/v1/auth/confirm-login`, {
    token: formToken
  });

  const { token, refresh_token, status, statusText } = apiResponse.data;

  console.info('token + refresh:');
  console.info(token);
  console.info(refresh_token);

  return NextResponse.json({ status, statusText });
}
