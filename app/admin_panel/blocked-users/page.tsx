'use client';

import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function BlockedUsersPage() {
  const { data, isLoading, error } = useSWR(
    '/api/dataFetching/blockedUsers',
    fetcher
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader2 className='h-20 w-20 animate-spin' />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div>Error loading user data: {error.message}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>{JSON.stringify(data)}</div>
    </AdminLayout>
  );
}
