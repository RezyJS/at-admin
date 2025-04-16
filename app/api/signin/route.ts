import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { apiURL } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const apiResponse = await axios.post(`${apiURL}/v1/auth/login`, { email });
  const { status, statusText } = apiResponse.data;

  return NextResponse.json({ status, statusText });
}
