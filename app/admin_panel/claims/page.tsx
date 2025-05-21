"use client";

import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Status, { ClaimStatus } from "@/components/Status/Status";
import getShortText from "@/helpers/getShortText";
import { ChevronsLeft, ChevronsRight, Loader2, PenBox } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { MyClaimsTable } from "@/components/Table/Table";
import axios from "axios";
import { Button } from "@/components/ui/button";

type Claim = {
  id: number;
  uid: number;
  title: string;
  description: string;
  category: string;
  status: string;
  photos: string[] | null;
  latitude: number;
  longitude: number;
  feedback: string;
  datetime: string;
};

const statusParser = {
  "pending": ClaimStatus.PENDING,
  "accepted": ClaimStatus.ACCEPTED,
  "completed": ClaimStatus.COMPLETED,
  "declined": ClaimStatus.DECLINED,
}

const columns: ColumnDef<Claim>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="w-[5%]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status: 'pending' | 'accepted' | 'completed' | 'declined' = row.getValue('status');
      return <Status status={statusParser[status || ClaimStatus.PENDING]} />
    }
  },
  {
    accessorKey: "title",
    header: "Название",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <p className="max-w-prose break-words hyphens-auto leading-relaxed">
          {title}
        </p>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Описание",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div>{getShortText(description)}</div>;
    },
  },
  {
    accessorKey: "datetime",
    header: "Дата",
    cell: ({ row }) => {
      const datetime = row.getValue("datetime") as string;
      const date = new Date(datetime);
      return <div>{format(date, 'dd.MM.yyyy HH:mm')}</div>;
    }
  },
  {
    accessorKey: "edit",
    header: "",
    cell: ({ row }) => {
      const id = row.getValue("id");
      return (
        <PenBox className="w-auto h-auto text-black hover:bg-gray-300 p-2 rounded-md" onClick={(e) => { e.stopPropagation(); location.assign(`claims/${id}?id=108`) }} />
      );
    }
  }
];

const page_size = 10;

export default function ClaimsPage() {

  const [cursors, setCursors] = useState<Array<number>>([-1]);
  const [page, setPage] = useState(0);
  const [cursor, setCursor] = useState('-1');
  const [disabledForward, setDisabledForward] = useState(false);

  const { data, isLoading, error } = useSWR(
    `/api/dataFetching/getClaims?page_size=${page_size}&${cursor !== '-1' ? `cursor=${cursor}` : ''}`,
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
                  <MyClaimsTable table={table} /> :
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