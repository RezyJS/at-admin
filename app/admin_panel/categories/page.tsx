'use client'

import CategoriesConstructor from "@/components/Categories/CategoriesConstructor";
import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function AdministratorsPage() {
  const [categories, setCategories] = useState();
  const [showConstructor, switchShow] = useState(false);

  const { data, isLoading } = useSWR('/api/dataFetching/categories/getCategories', fetcher);

  useEffect(() => {
    if (!isLoading && data) {
      setCategories(data?.categories)
      switchShow(true)
    }
  }, [isLoading, data])

  return (
    <AdminLayout className="flex flex-col p-2 gap-2 w-full h-full">
      <div className="h-full w-full flex flex-col gap-5 items-start">
        {
          showConstructor ?
            <CategoriesConstructor _categories={categories!} /> :
            <div className="flex w-full h-full justify-center items-center">
              <Loader2 className="animate-spin w-15 h-15" />
            </div>
        }
      </div>
    </AdminLayout>
  );
}