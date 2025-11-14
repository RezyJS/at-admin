'use client';

import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2, Router } from 'lucide-react';
import axios from 'axios';
import useSWR from 'swr';
import { MyBlockedUsersTable } from '@/components/Table/Table';
import { useRouter } from 'next/navigation';

type BlockedUser = {
  id: number;
  uid: number;
  email: string;
  blocked_at: string;
};

export default function BlockedUsersPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<{
    blocked_users: BlockedUser[];
  }>(
    '/api/dataFetching/blockedUsers',
    (url: string) => axios.get(url).then((res) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const handleUnblock = async (userId: number, event: any) => {
    event.stopPropagation();

    if (!confirm('Вы уверены, что хотите разблокировать этого пользователя?'))
      return;

    try {
      await axios.post(`/api/admin/unblock-user`, { uid: userId });
      mutate();
    } catch (err) {
      console.error('Ошибка при разблокировке:', err);
      alert('Не удалось разблокировать пользователя');
    }
  };

  const columns: ColumnDef<BlockedUser>[] = [
    {
      accessorKey: 'id',
      header: () => <div className='max-w-max text-start'>ID</div>,
      cell: ({ row }) => (
        <div className='max-w-max text-start'>{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'uid',
      header: 'UID',
      cell: ({ row }) => <div className='w-[15%]'>{row.getValue('uid')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className='w-[35%]'>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'blocked_at',
      header: 'Дата блокировки',
      cell: ({ row }) => {
        const blocked_at = new Date(row.getValue('blocked_at') as string);
        return <div>{format(blocked_at, 'dd.MM.yyyy HH:mm')}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <button
          onClick={(event) => handleUnblock(row.original.uid, event)}
          className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
        >
          Разблокировать
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.blocked_users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='flex flex-col h-full w-full items-center justify-center'>
          <Loader2 className='h-16 w-16 animate-spin' />
          <p className='mt-4 text-lg text-gray-600'>Загрузка данных...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className='flex flex-col text-3xl h-full w-full items-center justify-center'>
          <p>
            Ошибка загрузки данных:
            <br />
            {error.message}
          </p>
          <button
            onClick={() => mutate()}
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Попробовать снова
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='flex gap-5 w-full h-full justify-between items-start'>
        <div className='w-full h-full flex flex-col space-y-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Заблокированные пользователи</h1>
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-500'>
                Найдено: {data?.blocked_users?.length || 0} пользователей
              </div>
              <button
                onClick={() => mutate()}
                className='text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
                title='Обновить данные'
              >
                Обновить
              </button>
            </div>
          </div>

          <div className='overflow-y-auto rounded-lg border shadow-sm'>
            {data?.blocked_users && data.blocked_users.length > 0 ? (
              <MyBlockedUsersTable
                table={table}
                onRowClick={(email) => {
                  router.push(`/admin_panel/user/${email}`);
                }}
              />
            ) : (
              <div className='flex w-full h-64 items-center justify-center text-xl text-gray-500'>
                Заблокированные пользователи не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
