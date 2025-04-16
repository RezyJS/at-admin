'use client'

import ClaimsTable from "@/components/ClaimsTable/ClaimsTable";
import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { ColumnDef } from "@tanstack/react-table";
import useSWRInfinite from "swr/infinite";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

type Claim = {
  id: number,
  // TODO: Add different statuses strings instead of string type
  status: string,
  name: string,
  description: string,
  date: Date
}

const columns: ColumnDef<Claim>[] = [
  {
    accessorKey: 'id',
    header: "ID",
  }, {
    accessorKey: 'status',
    header: "Статус"
  }, {
    accessorKey: 'title',
    header: "Название",
    cell: (cell) => {
      const name = cell.cell.getValue() as string;
      let _name = name;
      if (name.length > 30) {
        _name = name.slice(0, 30) + '...'
      }
      return (
        <div
          className="h-8 text-md flex items-center text-blue-500 hover:underline hover:cursor-pointer"
          onClick={() => alert(name)}
        >
          {_name}
        </div>
      )
    }
  }, {
    accessorKey: 'description',
    header: "Описание"
  }, {
    accessorKey: 'datetime',
    header: "Дата"
  },
]

export default function ClaimsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // Reached the end
    return `/api/dataFetching/getClaims${pageIndex ? `?afterId=${previousPageData[previousPageData.length - 1].id}` : ''}`;
  };

  const { data } = useSWRInfinite(getKey, fetcher);
  const claims = data ? data.flat() : [];

  return (
    <AdminLayout>
      <div className="flex gap-5 w-full h-full justify-between items-center">
        <ClaimsTable columns={columns} data={claims} />
        <div className="flex w-[50%] text-center text-balance font-medium text-2xl h-full justify-center items-center flex-1 border-1 border-gray-200 rounded-md">
          Нажмите на название заявки<br />для отображения информации
        </div>
      </div>
    </AdminLayout>
  );
}