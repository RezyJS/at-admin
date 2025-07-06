import { clsx, type ClassValue } from 'clsx';
import { NextResponse } from 'next/server';
import { twMerge } from 'tailwind-merge';
import { FetcherResult } from './fetcher';

export const apiURL = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = process.env.NEXT_PUBLIC_URL;

export const afterFetcher = (
  apiRequest: FetcherResult,
  body?: 'claims' | 'news' | 'admins' | 'block',
  isBlocked?: boolean
) => {
  const response = (function () {
    switch (body) {
      case 'claims':
        return NextResponse.json(apiRequest.body.claims);
      case 'news':
        return NextResponse.json(apiRequest.body.announcements);
      case 'admins':
        return NextResponse.json(apiRequest.body.admins);
      case 'block':
        return NextResponse.json({ isBlocked });
      default:
        return NextResponse.json(apiRequest.body);
    }
  })();

  if (apiRequest.refresh && apiRequest.access) {
    const { refresh, access } = apiRequest;

    response!.cookies.set('access_token', access, {
      httpOnly: true,
      maxAge: 15 * 60, // 15 minutes
      secure: true,
      sameSite: 'strict',
    });

    response!.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      maxAge: 90 * 24 * 60 * 60, // 30 days
      secure: true,
      sameSite: 'strict',
    });
  }

  return response;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
