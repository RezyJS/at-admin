import { endSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
  await endSession();
  return NextResponse.json(
    { message: 'Успешный выход из аккаунта' },
    { status: 200 }
  );
}
