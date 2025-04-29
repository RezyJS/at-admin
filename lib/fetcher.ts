import { headers } from 'next/headers';

export interface FetcherArguments {
  url: string;
  access?: string;
  refresh?: string;
  body?: BodyInit;
  headers?: object;
  method?: string;
}

export interface FetcherResult {
  error: boolean;
  status: number;
  body: {
    claims?: object;
    announcements?: object;
    admins?: object;
  };
  refresh?: string;
  access?: string;
}

const fetcher = async (args: FetcherArguments): Promise<FetcherResult> => {
  const refresh = async (refresh: string) => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`, {
      body: JSON.stringify({ token: refresh }),
      method: 'POST'
    })
      .then((res) => res.json())
      .then((res) => {
        const { token: newAccess, refresh_token: newRefresh } = res;
        return { error: false, status: 200, body: { newAccess, newRefresh } };
      })
      .catch((err) => {
        return {
          error: true,
          status: err.status,
          body: { newAccess: '', newRefresh: '' }
        };
      });
  };

  const attempt = async (method: string, headers: HeadersInit) => {
    const request = await fetch(args.url, {
      method,
      body: args.body,
      headers
    });

    if (request.ok) {
      try {
        const answer = request.body ? await request.json() : {};
        return { error: false, status: request.status, body: answer };
      } catch {
        return { error: false, status: request.status, body: {} };
      }
    }

    return { error: true, status: request.status, body: {} };
  };

  if (!args.access) {
    if (!args.refresh) {
      return { error: true, status: 405, body: {} };
    }

    const tokens = await refresh(args.refresh);

    if (tokens.error || tokens.body.newAccess === '') {
      return { error: true, status: tokens.status, body: {} };
    }

    const { newAccess, newRefresh } = tokens.body;

    const retry = await attempt(args.method ? args.method : 'GET', {
      ...headers,
      Authorization: `Bearer ${newAccess}`
    });
    if (retry.error) {
      return { error: true, status: retry.status, body: {} };
    }

    const result = retry.body;
    return {
      error: false,
      status: retry.status,
      body: result,
      access: newAccess,
      refresh: newRefresh
    };
  }

  const initial = await attempt(args.method ? args.method : 'GET', {
    ...headers,
    Authorization: `Bearer ${args.access}`
  });

  if (initial.error === false) {
    return { error: false, status: initial.status, body: initial.body };
  }

  if (initial.status === 401) {
    if (!args.refresh) {
      return { error: true, status: 405, body: {} };
    }
    const refreshRequest = await refresh(args.refresh);
    const { newAccess, newRefresh } = refreshRequest.body;

    const retry = await attempt(args.method ? args.method : 'GET', {
      ...headers,
      Authorization: `Bearer ${newAccess}`
    });
    if (retry.error) {
      return { error: true, status: retry.status, body: {} };
    }

    const result = retry.body;
    return {
      error: false,
      status: retry.status,
      body: result,
      access: newAccess,
      refresh: newRefresh
    };
  }

  return { error: true, status: initial.status, body: {} };
};

export default fetcher;
