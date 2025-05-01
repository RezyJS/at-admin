/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import useSWRInfinite from "swr/infinite";
import axios from "axios";
import Status from "@/components/Status/Status";
import getShortText from "@/helpers/getShortText";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

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

const statusOptions = [
  { value: "pending", label: "В ожидании" },
  { value: "test", label: "в обработке" },
  { value: "accepted", label: "В работе" },
  { value: "completed", label: "Завершено" },
  { value: "declined", label: "Отклонено" },
];

const columns: ColumnDef<Claim>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="w-[5%]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => (
      <Status status={row.getValue("status")} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "title",
    header: "Название",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <a href={`/admin_panel/claims/${row.original.id}?id=${row.original.id}`} className="text-blue-500 hover:underline max-w-prose break-words hyphens-auto leading-relaxed">
          {title}
        </a>
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
    },
    filterFn: (row, id, value) => {
      if (!value) return true;

      const datetime = row.getValue(id) as string;
      const date = new Date(datetime);

      if (value.from && value.to) {
        return date >= value.from && date <= value.to;
      }
      if (value.from) {
        return date >= value.from;
      }
      if (value.to) {
        return date <= value.to;
      }
      return true;
    },
  }
];

const PAGE_SIZE = 10;

export default function ClaimsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Функция для формирования ключа запроса
  const getKey: any = (pageIndex: number, previousPageData: Claim[]) => {
    if (previousPageData && !previousPageData.length) return null; // Останавливаемся, если предыдущая страница пустая

    const afterId = pageIndex > 0 && data?.[pageIndex - 1]?.length
      ? data[pageIndex - 1][data[pageIndex - 1].length - 1].id // ID последней заявки на предыдущей странице
      : undefined;

    return `/api/dataFetching/getClaims${afterId ? `?afterId=${afterId}` : ""}`;
  };

  // Используем useSWRInfinite для загрузки данных
  const { data, size, setSize, error, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  // Все загруженные данные
  const allClaims = useMemo(() => (data ? data.flat() : []), [data]);

  // Данные для текущей страницы
  const currentClaims = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allClaims.slice(start, end);
  }, [allClaims, currentPage]);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isValidating && currentPage > 1;

  // Определяем, есть ли следующая страница
  const hasNextPage = useMemo(() => {
    const lastPage = data?.[data.length - 1];
    return lastPage && lastPage.length === PAGE_SIZE;
  }, [data]);

  // Настройка таблицы
  const table = useReactTable({
    columns,
    data: currentClaims,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  // Обработчик изменения страницы
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);

    // Если новая страница еще не загружена, увеличиваем размер списка
    if (newPage > size) {
      setSize(newPage);
    }
  };

  // Обработчик фильтрации по дате
  const handleDateFilter = (range: DateRange | undefined) => {
    setDateRange(range);
    table.getColumn("datetime")?.setFilterValue(range);
  };

  // Обработчик фильтрации по статусу
  const handleStatusFilter = (status: string) => {
    if (status === "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(status);
    }
  };

  // Рендеринг номеров страниц
  const renderPageNumbers = () => {
    if (!data || !data[0]) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = Math.ceil(allClaims.length / PAGE_SIZE);

    // Показываем только видимые страницы
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {i}
        </button>
      );
    }

    // Если есть предыдущие страницы, добавляем кнопку "..."
    if (startPage > 1) {
      pages.unshift(
        <span key="prev-ellipsis" className="px-2">...</span>
      );
    }

    // Если есть следующие страницы, добавляем кнопку "..."
    if (endPage < totalPages) {
      pages.push(
        <span key="next-ellipsis" className="px-2">...</span>
      );
    }

    return pages;
  };

  // Обработка ошибок
  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col text-3xl h-full w-full items-center justify-center">
          <p>Ошибка загрузки данных: {error.message}</p>
        </div>
      </AdminLayout>
    )
  }

  // Отображение загрузки
  if (isLoadingInitialData) {
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
        <div className="w-full space-y-4">
          {/* Фильтры */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="w-full max-w-[300px]">
              <Select
                onValueChange={(value) => handleStatusFilter(value ? value : '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.label} value={status.label}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full max-w-[300px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                          {format(dateRange.to, "dd.MM.yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd.MM.yyyy")
                      )
                    ) : (
                      <span>Фильтр по дате</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateFilter}
                    numberOfMonths={2}
                    weekStartsOn={1}
                  />
                  <div className="p-2 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange({
                          from: new Date(),
                          to: addDays(new Date(), 7),
                        });
                        handleDateFilter({
                          from: new Date(),
                          to: addDays(new Date(), 7),
                        });
                      }}
                    >
                      Эта неделя
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange({
                          from: new Date(),
                          to: addDays(new Date(), 30),
                        });
                        handleDateFilter({
                          from: new Date(),
                          to: addDays(new Date(), 30),
                        });
                      }}
                    >
                      Этот месяц
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange(undefined);
                        handleDateFilter(undefined);
                      }}
                    >
                      Сбросить
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Таблица */}
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table className="w-full">
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="py-3 px-4 font-semibold text-gray-700 text-left"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell
                        key={cell.id}
                        className="py-3 px-4 text-gray-600 text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          <div className="flex justify-between items-center px-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingMore}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            <div className="flex items-center space-x-2">
              {isLoadingMore ? (
                <Skeleton className="h-8 w-24 rounded-md" />
              ) : (
                renderPageNumbers()
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || isLoadingMore}
            >
              Вперед
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}