'use client';

import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { MyNewsTable } from "@/components/Table/Table";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";

export type Announcement = {
  id: number;
  title: string;
  description: string;
  datetime: string;
};

const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: 'id',
    header: () => <div className="w-5">ID</div>,
    cell: ({ row }) => <div className="w-5">{row.getValue('id')}</div>,
    size: 50, // Фиксированная ширина в пикселях
  },
  {
    accessorKey: 'title',
    header: 'Заголовок',
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="line-clamp-1 overflow-hidden text-ellipsis min-w-[150px] max-w-[300px]">
          <Markdown>
            {title}
          </Markdown>
        </div>
      );
    },
    size: 200, // Относительная ширина
  },
  {
    accessorKey: 'description',
    header: 'Описание',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className="line-clamp-3 overflow-hidden min-w-[200px] max-w-[400px]">
          <Markdown>
            {description}
          </Markdown>
        </div>
      );
    },
    size: 300, // Относительная ширина
  },
  {
    accessorKey: 'datetime',
    header: 'Дата',
    cell: ({ row }) => {
      const datetime = row.getValue('datetime') as string;
      const date = new Date(datetime);
      return <div className="w-40 whitespace-nowrap">{format(date, 'dd.MM.yyyy HH:mm')}</div>;
    },
    size: 150, // Фиксированная ширина
  },
];

const page_size = 15;

export default function AnnouncementsPage() {

  const [cursors, setCursors] = useState<Array<number>>([-1]);
  const [page, setPage] = useState(0);
  const [cursor, setCursor] = useState('-1');
  const [disabledForward, setDisabledForward] = useState(false);

  const { data, isLoading, error } = useSWR(
    `/api/dataFetching/getAnnouncements?page_size=${page_size}&${cursor !== '-1' ? `cursor=${cursor}` : ''}`,
    (url: string) => axios.get(url).then(res => res.data)
  );

  useEffect(() => {
    if (data && data.length < page_size) {
      setDisabledForward(true);
    } else {
      setDisabledForward(false);
    }
  }, [data])

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col text-3xl h-full w-full items-center justify-center">
          <p>Ошибка загрузки данных:<br />{error.message}</p>
        </div>
      </AdminLayout>
    )
  }

  // Отображение загрузки
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col h-full w-full items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex gap-5 w-full h-full justify-between items-center">
        <div className="w-full h-full flex flex-col justify-between space-y-4">
          <div className="w-full space-y-4 flex h-full flex-col justify-between">

            {/* Таблица */}
            <div className="overflow-x-auto rounded-lg border shadow-sm">
              {
                data.length !== 0 ?
                  <MyNewsTable table={table} /> :
                  <div className="flex w-full justify-center text-3xl p-10">
                    Дальше пусто :(
                  </div>
              }
            </div>

            <div className="flex w-full justify-center gap-5">
              <Button onClick={() => {
                setCursor('' + cursors[page - 1])
                setPage((prev) => {
                  return prev - 1
                })
                setDisabledForward(false);
              }}
                disabled={page === 0}
              >
                <ChevronsLeft />
              </Button>

              <Button onClick={() => {
                const newCursor = data[data.length - 1].id
                setCursors((prev) => prev.concat(newCursor));
                setCursor(newCursor);
                setPage((prev) => prev + 1)
              }}
                disabled={disabledForward}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}