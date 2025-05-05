/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import getShortText from '@/helpers/getShortText';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

type Announcement = {
  id: number;
  title: string;
  description: string;
  datetime: string;
};

// Колонки таблицы
const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="w-[5%]">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: 'Заголовок',
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <p>
          {getShortText(title)}
        </p>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Описание',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return <div>{getShortText(description)}</div>;
    },
  },
  {
    accessorKey: 'datetime',
    header: 'Дата',
    cell: ({ row }) => {
      const datetime = row.getValue('datetime') as string;
      const date = new Date(datetime);
      return <div>{format(date, 'dd.MM.yyyy HH:mm')}</div>;
    },
    filterFn: (row, id, value: DateRange | undefined) => {
      if (!value?.from && !value?.to) return true;
      const datetimeStr = row.getValue(id) as string;
      const datetime = new Date(datetimeStr);
      if (value.from && value.to) {
        return datetime >= value.from && datetime <= value.to;
      }
      if (value.from) {
        return datetime >= value.from;
      }
      if (value.to) {
        return datetime <= value.to;
      }
      return true;
    },
  },
];

const PAGE_SIZE = 10;

export default function AnnouncementsPage() {

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<any>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Формирование ключа запроса
  const getKey = (pageIndex: number, previousPageData: any[]): any => {
    if (previousPageData && !previousPageData.length) return null;

    const afterId = pageIndex > 0 && data?.[pageIndex - 1]?.length
      ? data[pageIndex - 1][data[pageIndex - 1].length - 1]?.id
      : null;

    return `/api/dataFetching/getAnnouncements${afterId ? `?afterId=${afterId}` : ''}`;
  };

  // SWR Infinite Fetch
  const { data, size, setSize, error, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const allData = useMemo(() => (data ? data.flat().filter(Boolean) : []), [data]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allData.slice(start, end);
  }, [allData, currentPage]);

  const hasNextPage = useMemo(() => {
    const lastPage = data?.[data.length - 1];
    return lastPage && lastPage.length === PAGE_SIZE;
  }, [data]);

  const table = useReactTable({
    data: currentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(allData.length / PAGE_SIZE)) return;
    setCurrentPage(newPage);
    if (newPage > size) {
      setSize(newPage);
    }
  };

  const handleDateFilter = (range: DateRange | undefined) => {
    setDateRange(range);
    table.getColumn('datetime')?.setFilterValue(range);
  };

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(allData.length / PAGE_SIZE);
    const maxVisiblePages = 5;
    const pages = [];

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

    if (startPage > 1) {
      pages.unshift(<span key="prev-ellipsis" className="px-2">...</span>);
    }

    if (endPage < totalPages) {
      pages.push(<span key="next-ellipsis" className="px-2">...</span>);
    }

    return pages;
  };

  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isValidating && currentPage > 1;

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col text-3xl h-full w-full items-center justify-center">
          <p>Ошибка загрузки данных: {error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoadingInitialData) {
    return (
      <AdminLayout>
        <div className="flex flex-col h-full w-full items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex gap-5 w-full h-full justify-between items-center">
        <div className="w-full flex flex-col h-full justify-between space-y-4">
          <div className='space-y-4'>
            {/* Фильтры */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="w-full max-w-[300px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'dd.MM.yyyy')} -{' '}
                            {format(dateRange.to, 'dd.MM.yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'dd.MM.yyyy')
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
                          const today = new Date();
                          const nextWeek = addDays(today, 7);
                          setDateRange({ from: today, to: nextWeek });
                          handleDateFilter({ from: today, to: nextWeek });
                        }}
                      >
                        Эта неделя
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const nextMonth = addDays(today, 30);
                          setDateRange({ from: today, to: nextMonth });
                          handleDateFilter({ from: today, to: nextMonth });
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
                      onClick={() => router.push(`/admin_panel/announcements/${row.original.id}`)}
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