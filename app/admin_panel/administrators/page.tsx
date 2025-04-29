/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const AdminItem = ({ title, value }: { title: string, value: string }) => {
  return (
    <div className="flex flex-col">
      <p className="font-semibold text-xl">{title}:</p>
      <p className="text-lg">{value}</p>
    </div>
  )
}

export default function AdministratorsPage() {

  const { data, isLoading, error } = useSWR('/api/admins', fetcher);
  const [email, setEmail] = useState('');

  useEffect(() => {
    console.info(data);
  }, [data])

  if (error) {
    return <div className="flex h-full w-full justify-center items-center">
      Unlucky :(
    </div>
  }

  return (
    <AdminLayout className="flex flex-col p-2 gap-2 w-full h-auto">
      <div className="h-full w-full flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row gap-5 items-baseline">
          <p className="text-3xl font-bold">Список Администраторов:</p>
          <div className="flex flex-col gap-2">
            <Input
              required
              type="email"
              placeholder="ivanov@domen.test"
              onInput={(e) => setEmail(e.currentTarget.value)}
            />
            <Button
              className="bg-green-400 hover:bg-green-600 text-lg font-semibold"
              onClick={() => {
                axios.post('/api/admins', { email }).then(() => location.reload()).catch(() => toast('Произошла ошибка', {
                  description: `Проверьте адрес почты или попробуйте позже.`
                }))
              }}
            >
              Добавить администратора
            </Button>
          </div>
        </div>
        {isLoading ?
          <div className="flex h-full w-full justify-center items-center">
            <Loader2 className="animate-spin h-12 w-12" />
          </div>
          : <div className="w-full grid gap-2 sm:grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[...data].map(({ uid, first_name, second_name, email, isSuperAdmin }: any, id: number) => (
              <div key={id} className="h-max rounded-lg border-black border-2 p-5 flex flex-col gap-3">
                <p><span className="font-semibold">UID:</span> {uid}</p>
                <AdminItem title="Фамилия Имя" value={`${second_name} ${first_name}`} />
                <AdminItem title="Почта" value={email} />
                <p><span className="font-semibold">Супер Админ:</span> {isSuperAdmin ? "Да" : "Нет"}</p>
                <div className="flex justify-center">
                  <Button
                    variant={'destructive'}
                    className="text-lg font-semibold w-max"
                    onClick={() => {
                      axios.delete('/api/admins', { data: { email } }).then(() => location.reload()).catch(() => toast('Произошла ошибка', {
                        description: `Проверьте адрес почты или попробуйте позже.`
                      }));
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </div>))}
          </div>
        }
      </div>
    </AdminLayout>
  );
}