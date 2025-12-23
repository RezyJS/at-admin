'use server';

import { cookies } from 'next/headers';

interface ISessionData {
  access?: string;
  refresh?: string;
}

const FIFTEEN_MINUTES = 60 * 15;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const createSession = async ({ access, refresh }: ISessionData) => {
  const cookieStore = await cookies();

  if (!access || !refresh) return null;

  cookieStore.set('accessToken', access, {
    httpOnly: true,
    secure: true,
    maxAge: FIFTEEN_MINUTES,
    sameSite: 'strict',
  });

  cookieStore.set('refreshToken', refresh, {
    httpOnly: true,
    secure: true,
    maxAge: THIRTY_DAYS,
    sameSite: 'strict',
  });
};

export const getSession = async () => {
  const cookieStore = await cookies();

  const refresh = cookieStore.get('refreshToken')?.value;
  const access = cookieStore.get('accessToken')?.value;

  return { access, refresh };
};

export const refreshSession = async ({ access, refresh }: ISessionData) => {
  await createSession({ access, refresh });
};

export const endSession = async () => {
  const cookieStore = await cookies();

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
};
