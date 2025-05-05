'use client'

import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from 'swr'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

const fetcher = (url: string) => axios.get(url).then(res => res.data);

type Admin = {
  email: string,
  is_super_admin: boolean
}

const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: 'email',
    header: 'Почта',
    cell: ({ row }) => {
      return <p>{row.getValue('email')}</p>
    }
  },
  {
    accessorKey: 'is_super_admin',
    header: () => <p className="text-center">Супер-Админ</p>,
    cell: ({ row }) => {
      const is_super_admin = row.getValue('is_super_admin');
      return <p className="text-center">{is_super_admin ? 'Да' : 'Нет'}</p>
    }
  },
  {
    accessorKey: 'delete_button',
    header: '',
    cell: ({ row }) => {
      const email = row.getValue('email');
      return (
        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger>
              <div className="text-white font-semibold text-md bg-red-600 hover:bg-red-800 rounded-md p-2">
                Удалить
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Вы уверены?</DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-col">
                    Вы действительно хотите забрать права администратора у данного пользователя?
                    <div className="flex justify-end gap-5">
                      <Button className="bg-green-500 hover:bg-green-800"
                        onClick={() => {
                          axios.delete('/api/admins', { data: { email } }).then(() => location.reload()).catch(() => toast('Произошла ошибка', {
                            description: `Проверьте адрес почты или попробуйте позже.`
                          }));
                        }}
                      >Да</Button>
                      <DialogClose asChild>
                        <Button className="bg-red-600 hover:bg-red-800">Нет</Button>
                      </DialogClose>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
  }
]

export default function AdministratorsPage() {

  const { data, isLoading, error } = useSWR('/api/admins', fetcher);
  const [email, setEmail] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  if (error) {
    return <AdminLayout>
      <div className="flex h-full w-full justify-center items-center">
        Видимо, какие-то неполадки...
      </div>
    </AdminLayout>
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-full w-full justify-center items-center">
          <Loader2 className="animate-spin h-12 w-12" />
        </div>
      </AdminLayout >
    );
  }

  return (
    <AdminLayout className="flex flex-col p-2 gap-2 w-full h-full">
      <div className="h-full w-full flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row gap-5 items-baseline">
          <p className="text-3xl font-bold">Список Администраторов:</p>
          <div className="flex flex-col gap-2">
            <Dialog>
              <DialogTrigger>
                <div className="text-white font-semibold text-md bg-green-400 hover:bg-green-600 rounded-md p-2">
                  Добавить администратора
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Введите почту</DialogTitle>
                  <DialogDescription asChild>
                    <div className="flex flex-col gap-3">
                      <Input value={email} onChange={(e) => { setEmail(e.currentTarget.value) }} type='email' placeholder="example@mail.ru" />
                      <div className="flex gap-2 justify-end">
                        <Button
                          className="bg-green-500 hover:bg-green-800"
                          onClick={() => {
                            axios.post('/api/admins', { email }).then(() => location.reload()).catch(() => toast('Произошла ошибка', {
                              description: `Проверьте адрес почты или попробуйте позже.`
                            }))
                          }}
                        >Добавить</Button>
                        <DialogClose asChild>
                          <Button className="bg-red-600 hover:bg-red-800">Отмена</Button>
                        </DialogClose>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-3 px-4 font-semibold text-gray-700 text-left">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4 text-gray-600 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}