import { apiURL } from '@/lib/utils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // TODO: add refresh for tokens
  if (!token) {
    return NextResponse.error();
  }

  const apiResponse = await axios.get(`${apiURL}/admin/v1/admins/privileges`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return NextResponse.json(apiResponse.data);
}
