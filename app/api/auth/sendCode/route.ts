import { API_AUTH_URL } from '@/lib/urls';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const response = await axios.post(API_AUTH_URL, { email });

  const { status, statusText } = response.data;

  return NextResponse.json({ status, statusText });
}
