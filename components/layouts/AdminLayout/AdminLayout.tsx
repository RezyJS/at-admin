'use client'

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const baseURL = process.env.NEXT_PUBLIC_URL;

export default function AdminLayout({ children, className }: { children?: ReactNode, className?: string }) {

  const router = useRouter();

  const handleChangePage = (url: string) => {
    router.push(`${baseURL}/admin_panel/${url}`)
  }

  const handleSignOut = () => {
    axios.post('/api/signout');
    router.replace(`${baseURL}/auth`)
  }

  return (
    <div className={className ? className : `flex flex-col p-2 gap-2 w-full h-full`}>
      <div className="flex w-full h-max justify-between rounded-md items-center p-3 bg-black">
        <div className="flex gap-3">
          <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('claims')}>Заявки</Button>
          <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('announcements')}>Объявления</Button>
          <Button variant={'secondary'} className="rounded-sm" onClick={() => handleChangePage('administrators')}>Администраторы</Button>
        </div>
        <Button variant={'destructive'} className="rounded-sm" onClick={handleSignOut}>Выйти</Button>
      </div>
      <div className="rounded-md border-2 border-black p-3 h-full w-full">{children}</div>
    </div>
  );
}