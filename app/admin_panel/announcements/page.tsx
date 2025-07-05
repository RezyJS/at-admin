'use client';

import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { MyNewsTable } from '@/components/Table/Table';
import axios from 'axios';
import Markdown from '@/components/Markdown/Markdown';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { baseURL } from '@/lib/utils';

export type Announcement = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

// Ключи для сохранения состояния в sessionStorage
const SCROLL_POSITION_KEY = 'announcements-scroll-position';
const LAST_VIEWED_ANNOUNCEMENT_KEY = 'last-viewed-announcement-id';
const ANNOUNCEMENTS_DATA_KEY = 'announcements-cached-data';
const ANNOUNCEMENTS_CURSOR_KEY = 'announcements-cursor';
const ANNOUNCEMENTS_HAS_MORE_KEY = 'announcements-has-more';

const page_size = 15;

// Безопасные утилитарные функции для работы с sessionStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveToSessionStorage = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  } catch {}
};

const loadFromSessionStorage = (key: string) => {
  try {
    if (typeof window !== 'undefined') {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch {
    return null;
  }
};

export default function AnnouncementsPage() {
  // Флаг для отслеживания завершения гидрации
  const [isHydrated, setIsHydrated] = useState(false);

  const router = useRouter();

  // Инициализируем состояния с безопасными значениями по умолчанию
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [cursor, setCursor] = useState('-1');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Эффект для гидрации - выполняется только на клиенте после монтирования
  useEffect(() => {
    const cachedAnnouncements = loadFromSessionStorage(ANNOUNCEMENTS_DATA_KEY);
    const cachedCursor = loadFromSessionStorage(ANNOUNCEMENTS_CURSOR_KEY);
    const cachedHasMore = loadFromSessionStorage(ANNOUNCEMENTS_HAS_MORE_KEY);

    // Восстанавливаем состояние из кеша, если данные есть
    if (cachedAnnouncements && cachedAnnouncements.length > 0) {
      setAllAnnouncements(cachedAnnouncements);
    }

    if (cachedCursor !== null) {
      setCursor(cachedCursor);
    }

    if (cachedHasMore !== null) {
      setHasMore(cachedHasMore);
    }

    // Отмечаем, что гидрация завершена
    setIsHydrated(true);
  }, []);

  // Определяем, нужно ли загружать данные
  const shouldFetch =
    hasMore && isHydrated && (allAnnouncements.length === 0 || !isInitialLoad);

  const { data, isLoading, error } = useSWR(
    shouldFetch
      ? `/api/dataFetching/getAnnouncements?page_size=${page_size}&${
          cursor !== '-1' ? `cursor=${cursor}` : ''
        }`
      : null,
    (url: string) => axios.get(url).then((res) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: () => setIsLoadingMore(false),
      onSuccess: () => setIsLoadingMore(false),
    }
  );

  // Эффект для обработки загруженных данных
  useEffect(() => {
    if (data && data.length > 0) {
      setAllAnnouncements((prev) => {
        const existingIds = new Set(
          prev.map((announcement) => announcement.id)
        );
        const newAnnouncements = data.filter(
          (announcement: Announcement) => !existingIds.has(announcement.id)
        );
        const updatedAnnouncements = [...prev, ...newAnnouncements];

        // Сохраняем обновленные данные в sessionStorage только после гидрации
        if (isHydrated) {
          saveToSessionStorage(ANNOUNCEMENTS_DATA_KEY, updatedAnnouncements);
        }

        return updatedAnnouncements;
      });

      if (data.length < page_size) {
        setHasMore(false);
        if (isHydrated) {
          saveToSessionStorage(ANNOUNCEMENTS_HAS_MORE_KEY, false);
        }
      }

      setIsLoadingMore(false);
    }

    if (isInitialLoad) {
      setIsInitialLoad(false);
    }

    if (data?.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [data, isHydrated, isInitialLoad]);

  // Сохраняем cursor и hasMore в sessionStorage при их изменении
  useEffect(() => {
    if (isHydrated) {
      saveToSessionStorage(ANNOUNCEMENTS_CURSOR_KEY, cursor);
    }
  }, [cursor, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToSessionStorage(ANNOUNCEMENTS_HAS_MORE_KEY, hasMore);
    }
  }, [hasMore, isHydrated]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !isHydrated) {
      if (!hasMore && isLoadingMore) setIsLoadingMore(false);
      return;
    }

    setIsLoadingMore(true);
    const lastAnnouncement = allAnnouncements[allAnnouncements.length - 1];
    setCursor(lastAnnouncement?.id.toString() || '-1');
  }, [hasMore, isLoadingMore, allAnnouncements, isHydrated]);

  const observerRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingMore || !hasMore || !isHydrated) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observer.observe(node);

      return () => {
        if (node) observer.unobserve(node);
        observer.disconnect();
      };
    },
    [hasMore, isLoadingMore, loadMore, isHydrated]
  );

  // Восстановление позиции скролла
  useEffect(() => {
    if (isHydrated && allAnnouncements.length > 0) {
      const savedScrollPosition = loadFromSessionStorage(SCROLL_POSITION_KEY);

      if (savedScrollPosition && scrollContainerRef.current) {
        const scrollTop = parseInt(savedScrollPosition);

        const restoreScrollPosition = (attempts = 0) => {
          if (!scrollContainerRef.current || attempts > 10) return;

          scrollContainerRef.current.scrollTop = scrollTop;

          if (Math.abs(scrollContainerRef.current.scrollTop - scrollTop) > 10) {
            setTimeout(() => restoreScrollPosition(attempts + 1), 100);
          }
        };

        requestAnimationFrame(() => restoreScrollPosition());
      }
    }
  }, [allAnnouncements.length, isHydrated]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && isHydrated) {
      saveToSessionStorage(
        SCROLL_POSITION_KEY,
        scrollContainerRef.current.scrollTop.toString()
      );
    }
  }, [isHydrated]);
  // Функция для очистки кеша
  const clearCache = useCallback(() => {
    if (!isHydrated) return;

    sessionStorage.removeItem(ANNOUNCEMENTS_DATA_KEY);
    sessionStorage.removeItem(ANNOUNCEMENTS_CURSOR_KEY);
    sessionStorage.removeItem(ANNOUNCEMENTS_HAS_MORE_KEY);
    sessionStorage.removeItem(SCROLL_POSITION_KEY);
    setAllAnnouncements([]);
    setCursor('-1');
    setHasMore(true);
    setIsInitialLoad(true);
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated && allAnnouncements.length > 0) {
      const lastViewedAnnouncementId = loadFromSessionStorage(
        LAST_VIEWED_ANNOUNCEMENT_KEY
      );
      if (lastViewedAnnouncementId) {
        const element = document.getElementById(
          `announcement-${lastViewedAnnouncementId}`
        );
        element?.scrollIntoView({ behavior: 'auto', block: 'center' });
        sessionStorage.removeItem(LAST_VIEWED_ANNOUNCEMENT_KEY);
      }
    }
  }, [allAnnouncements, isHydrated]);

  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: 'id',
      header: () => <div className='text-center'>ID</div>,
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
      size: 50,
    },
    {
      accessorKey: 'title',
      header: 'Заголовок',
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div className='prose prose-sm max-w-none [&>*]:m-0 [&>*]:line-clamp-3'>
            <Markdown>{title}</Markdown>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'description',
      header: 'Описание',
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return (
          <div className='prose prose-sm max-w-none [&>*]:m-0 [&>*]:line-clamp-3'>
            <Markdown>{description}</Markdown>
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: 'created_at',
      header: () => <div className='text-center'>Дата</div>,
      cell: ({ row }) => {
        const created_at = row.getValue('created_at') as string;
        const date = new Date(created_at);
        return <div>{format(date, 'dd.MM.yyyy HH:mm')}</div>;
      },
      size: 150,
    },
  ];

  const table = useReactTable({
    data: allAnnouncements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <AdminLayout>
        <div className='flex flex-col items-center justify-center h-full'>
          <p className='text-red-500'>
            Ошибка загрузки данных:
            <br />
            {error.message}
          </p>
          <button
            onClick={clearCache}
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Очистить кеш и попробовать снова
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Показываем загрузку во время гидрации или если нет данных и идет загрузка
  if (!isHydrated || (isLoading && allAnnouncements.length === 0)) {
    return (
      <AdminLayout>
        <div className='flex flex-col items-center justify-center h-full'>
          <Loader2 className='h-16 w-16 animate-spin' />
          <p className='mt-4'>
            {!isHydrated ? 'Инициализация...' : 'Загрузка объявлений...'}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='px-6 flex w-full justify-between'>
        <h1 className='text-2xl font-semibold'>Список объявлений</h1>
        <div className='flex gap-5'>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-600'>
              Загружено: {allAnnouncements.length} объявлений
            </div>
            <button
              onClick={clearCache}
              className='text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
              title='Обновить данные'
            >
              Обновить
            </button>
          </div>

          <Button
            onClick={() =>
              router.push(`${baseURL}/admin_panel/announcements/create`)
            }
          >
            Добавить новость
          </Button>
        </div>
      </div>

      <div className='p-6'>
        <div className='bg-white rounded-lg shadow'>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className='overflow-auto max-h-[calc(100vh-200px)]'
          >
            {allAnnouncements.length > 0 ? (
              <>
                <MyNewsTable table={table} />

                <div
                  ref={observerRef}
                  className='p-4'
                >
                  {isLoadingMore && hasMore && (
                    <div className='flex items-center justify-center gap-2'>
                      <Loader2 className='h-6 w-6 animate-spin' />
                      <span>Загружаем больше объявлений...</span>
                    </div>
                  )}
                  {!hasMore &&
                    !isLoadingMore &&
                    allAnnouncements.length > 0 && (
                      <div className='text-center text-gray-500'>
                        Все объявления загружены
                      </div>
                    )}
                </div>
              </>
            ) : (
              <div className='p-8 text-center text-gray-500'>
                Объявления не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
