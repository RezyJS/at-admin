import { clsx, type ClassValue } from 'clsx';
import { NextResponse } from 'next/server';
import { twMerge } from 'tailwind-merge';
import { FetcherResult } from './fetcher';

export const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const afterFetcher = (
  apiRequest: FetcherResult,
  body: 'claims' | 'news'
) => {
  const response =
    body === 'claims'
      ? NextResponse.json(apiRequest.body.claims)
      : NextResponse.json(apiRequest.body.announcements);

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
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: true, // Enable in production
      sameSite: 'strict'
    });
  }

  return response;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
