'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, ReactNode } from 'react';
import { baseURL } from '@/lib/utils';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url);

export default function AdminLayout({
  children,
  className,
}: {
  className?: string;
} & PropsWithChildren) {
  const { data, isLoading } = useSWR('/api/admins/checkPrivileges', fetcher);

  const router = useRouter();

  const handleChangePage = (url: string) => {
    router.push(`${baseURL}/admin_panel/${url}`);
  };

  const handleSignOut = () => {
    axios.get('/api/auth/logout').finally(() => router.push('/auth'));
  };

  return (
    <div
      className={
        className ? className : `flex flex-col p-2 gap-2 w-full h-full`
      }
    >
      <div className='rounded-md h-full w-full flex flex-col gap-5'>
        <div className='flex w-full h-max justify-between rounded-md items-center p-3 bg-black'>
          <div className='flex gap-3'>
            <Button
              variant={'secondary'}
              className='rounded-sm'
              onClick={() => handleChangePage('claims')}
            >
              Заявки
            </Button>
            <Button
              variant={'secondary'}
              className='rounded-sm'
              onClick={() => handleChangePage('announcements')}
            >
              Объявления
            </Button>
            {isLoading && (
              <>
                <Skeleton className='w-32 h-9' />
                <Skeleton className='w-32 h-9' />
                <Skeleton className='w-32 h-9' />
              </>
            )}
            {!isLoading && data?.data.privileges.is_super_admin && (
              <Button
                variant={'secondary'}
                className='rounded-sm'
                onClick={() => handleChangePage('administrators')}
              >
                Администраторы
              </Button>
            )}
            {!isLoading && data?.data.privileges.is_admin && (
              <>
                <Button
                  variant={'secondary'}
                  className='rounded-sm'
                  onClick={() => handleChangePage('categories')}
                >
                  Категории
                </Button>
                <Button
                  variant={'secondary'}
                  className='rounded-sm'
                  onClick={() => handleChangePage('blocked-users')}
                >
                  Заблокированные пользователи
                </Button>
              </>
            )}
          </div>
          <Button
            variant={'destructive'}
            className='rounded-sm'
            onClick={handleSignOut}
          >
            Выйти
          </Button>
        </div>
        <div className='flex-1 w-full p-5'>{children}</div>
      </div>
    </div>
  );
}
