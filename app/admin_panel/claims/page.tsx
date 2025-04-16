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
    accessorKey: 'name',
    header: "Название"
  }, {
    accessorKey: 'description',
    header: "Описание"
  }, {
    accessorKey: 'date',
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
      <div className="flex flex-col gap-5 w-full h-full justify-center items-center">
        <ClaimsTable columns={columns} data={claims} />
      </div>
    </AdminLayout>
  );
}