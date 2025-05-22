'use client'

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

const baseURL = process.env.NEXT_PUBLIC_URL;
const fetcher = (url: string) => axios.post(url).then(res => res.data);

export default function AdminLayout({ children, className }: { children?: ReactNode, className?: string }) {
  const { data, isLoading } = useSWR('/api/dataFetching/checkAdmin', fetcher)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (data.privileges.is_super_admin) {
        setIsSuperAdmin(true);
      }
    }
  }, [data, isLoading])

  const router = useRouter();

  const handleChangePage = (url: string) => {
    router.push(`${baseURL}/admin_panel/${url}`)
  }

  const handleSignOut = () => {
    axios.post('/api/signout');
    router.push(`${baseURL}/auth`)
  }

  return (
    <div className={className ? className : `flex flex-col p-2 gap-2 w-full h-full`}>
      <div className="rounded-md h-full w-full flex flex-col gap-5">
        <div className="flex w-full h-max justify-between rounded-md items-center p-3 bg-black">
          <div className="flex gap-3">
            <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('claims')}>Заявки</Button>
            <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('announcements')}>Объявления</Button>
            {
              isLoading ?
                <Loader2 className="text-white w-auto h-auto animate-spin" /> :
                isSuperAdmin ?
                  <>
                    <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('administrators')}>Администраторы</Button>
                    <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('categories')}>Категории</Button>
                  </> :
                  <></>
            }
          </div>
          <Button variant={'destructive'} className="rounded-sm" onClick={handleSignOut}>Выйти</Button>
        </div>
        <div className="flex-1 w-full p-5">{children}</div>
      </div>
    </div>
  );
}