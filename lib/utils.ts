import { clsx, type ClassValue } from 'clsx';
import { NextResponse } from 'next/server';
import { twMerge } from 'tailwind-merge';
import { FetcherResult } from './fetcher';

export const apiURL = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = process.env.NEXT_PUBLIC_URL;

// utils/mockAdmins.ts
export const generateMockAdmins = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    email: `admin${i + 1}@example.com`,
    is_super_admin: Math.random() > 0.5
  }));
};

export const afterFetcher = (
  apiRequest: FetcherResult,
  body?: 'claims' | 'news' | 'admins'
) => {
  const response = (function () {
    switch (body) {
      case 'claims':
        return NextResponse.json(apiRequest.body.claims);
      case 'news':
        return NextResponse.json(apiRequest.body.announcements);
      case 'admins':
        return NextResponse.json(apiRequest.body.admins);
      default:
        return NextResponse.json(apiRequest.body);
    }
  })();

  if (apiRequest.refresh && apiRequest.access) {
    const { refresh, access } = apiRequest;

    response!.cookies.set('access_token', access, {
      httpOnly: true,
      maxAge: 15 * 60, // 15 minutes
      secure: true, // Enable in production
      sameSite: 'strict'
    });

    response!.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      maxAge: 90 * 24 * 60 * 60, // 30 days
      secure: true, // Enable in production
      sameSite: 'strict'
    });
  }

  return response;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
