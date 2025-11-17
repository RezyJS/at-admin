/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { MyAdminTable } from '@/components/Table/Table';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export type Admin = {
  email: string;
  is_super_admin: boolean;
};

const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: 'email',
    header: 'Почта',
    cell: ({ row }) => {
      return (
        <p className='font-medium text-gray-700'>{row.getValue('email')}</p>
      );
    },
  },
  {
    accessorKey: 'is_super_admin',
    header: () => <p className='text-center'>Статус</p>,
    cell: ({ row }) => {
      const is_super_admin = row.getValue('is_super_admin');
      return (
        <div className='flex justify-center'>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              is_super_admin
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {is_super_admin ? 'Супер-Админ' : 'Администратор'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'delete_button',
    header: '',
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return (
        <div className='flex justify-center'>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='text-red-600 hover:bg-red-50'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Удалить
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle className='text-lg'>
                  Подтверждение удаления
                </DialogTitle>
                <DialogDescription
                  className='py-4'
                  asChild
                >
                  <div>
                    Вы собираетесь удалить администратора:
                    <div className='mt-2 font-medium text-gray-900'>
                      {email}
                    </div>
                  </div>
                </DialogDescription>
                <div className='flex justify-end gap-3 mt-4'>
                  <DialogClose asChild>
                    <Button variant='outline'>Отмена</Button>
                  </DialogClose>
                  <Button
                    variant='destructive'
                    onClick={() => {
                      axios
                        .delete('/api/admins', { data: { email } })
                        .then(() => location.reload())
                        .catch(() =>
                          toast.error('Ошибка удаления', {
                            description:
                              'Проверьте адрес почты или попробуйте позже.',
                          })
                        );
                    }}
                  >
                    Подтвердить
                  </Button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

const CreateAdminDialog = ({
  email,
  setEmail,
}: {
  email: string;
  setEmail: Function;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <UserPlus className='h-4 w-4' />
          Добавить администратора
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg'>
            Добавление администратора
          </DialogTitle>
          <DialogDescription className='py-4'>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              placeholder='Введите email адрес'
              className='w-full'
            />
          </DialogDescription>
          <div className='flex justify-end gap-3 mt-4'>
            <DialogClose asChild>
              <Button variant='outline'>Отмена</Button>
            </DialogClose>
            <Button
              onClick={() => {
                axios
                  .post('/api/admins', { email })
                  .then(() => location.reload())
                  .catch(() =>
                    toast.error('Ошибка добавления', {
                      description:
                        'Проверьте корректность email или попробуйте позже.',
                    })
                  );
              }}
            >
              Добавить
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default function AdministratorsPage() {
  const { data, isLoading, error } = useSWR('/api/admins', fetcher);
  const [email, setEmail] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (error) {
    return (
      <div className='flex h-full w-full justify-center items-center text-red-600'>
        Ошибка загрузки данных
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex h-full w-full justify-center items-center'>
        <Loader2 className='animate-spin h-12 w-12 text-blue-600' />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Управление администраторами
        </h1>
        <CreateAdminDialog
          email={email}
          setEmail={setEmail}
        />
      </div>

      <div className='rounded-xl border bg-white shadow-sm'>
        <MyAdminTable table={table} />
      </div>
    </div>
  );
}
