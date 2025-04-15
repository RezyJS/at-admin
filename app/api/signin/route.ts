import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const apiResponse = await axios.post(`${baseURL}/v1/auth/login`, { email });
  const { status, statusText } = apiResponse.data;

  return NextResponse.json({ status, statusText });
}
