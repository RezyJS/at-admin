"use client";

import AdminLayout from "@/components/layouts/AdminLayout/AdminLayout";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Status, { ClaimStatus } from "@/components/Status/Status";
import getShortText from "@/helpers/getShortText";
import { Loader2, PenBox } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { MyClaimsTable } from "@/components/Table/Table";
import axios from "axios";

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

// Ключи для сохранения состояния в sessionStorage
const SCROLL_POSITION_KEY = 'claims-scroll-position';
const LAST_VIEWED_CLAIM_KEY = 'last-viewed-claim-id';
const CLAIMS_DATA_KEY = 'claims-cached-data';
const CLAIMS_CURSOR_KEY = 'claims-cursor';
const CLAIMS_HAS_MORE_KEY = 'claims-has-more';

const page_size = 15;

// Безопасные утилитарные функции для работы с sessionStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveToSessionStorage = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.warn('Failed to save to sessionStorage:', error);
  }
};

const loadFromSessionStorage = (key: string) => {
  try {
    if (typeof window !== 'undefined') {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load from sessionStorage:', error);
    return null;
  }
};

export default function ClaimsPage() {
  const router = useRouter();

  // Флаг для отслеживания завершения гидрации
  const [isHydrated, setIsHydrated] = useState(false);

  // Инициализируем состояния с безопасными значениями по умолчанию
  // Это гарантирует одинаковое начальное состояние на сервере и клиенте
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [cursor, setCursor] = useState('-1');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Эффект для гидрации - выполняется только на клиенте после монтирования
  useEffect(() => {
    // Этот эффект выполняется только на клиенте, поэтому безопасно использовать sessionStorage
    const cachedClaims = loadFromSessionStorage(CLAIMS_DATA_KEY);
    const cachedCursor = loadFromSessionStorage(CLAIMS_CURSOR_KEY);
    const cachedHasMore = loadFromSessionStorage(CLAIMS_HAS_MORE_KEY);

    // Восстанавливаем состояние из кеша, если данные есть
    if (cachedClaims && cachedClaims.length > 0) {
      setAllClaims(cachedClaims);
    }

    if (cachedCursor !== null) {
      setCursor(cachedCursor);
    }

    if (cachedHasMore !== null) {
      setHasMore(cachedHasMore);
    }

    // Отмечаем, что гидрация завершена
    setIsHydrated(true);
  }, []); // Пустой массив зависимостей гарантирует выполнение только один раз

  // Определяем, нужно ли загружать данные
  // Теперь мы учитываем состояние гидрации
  const shouldFetch = hasMore && isHydrated && (allClaims.length === 0 || !isInitialLoad);

  const { data, isLoading, error } = useSWR(
    shouldFetch ? `/api/dataFetching/getClaims?page_size=${page_size}&${cursor !== '-1' ? `cursor=${cursor}` : ''}` : null,
    (url: string) => axios.get(url).then(res => res.data),
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
      setAllClaims(prev => {
        const existingIds = new Set(prev.map(claim => claim.id));
        const newClaims = data.filter((claim: Claim) => !existingIds.has(claim.id));
        const updatedClaims = [...prev, ...newClaims];

        // Сохраняем обновленные данные в sessionStorage только после гидрации
        if (isHydrated) {
          saveToSessionStorage(CLAIMS_DATA_KEY, updatedClaims);
        }

        return updatedClaims;
      });

      if (data.length < page_size) {
        setHasMore(false);
        if (isHydrated) {
          saveToSessionStorage(CLAIMS_HAS_MORE_KEY, false);
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

  // Сохраняем cursor и hasMore в sessionStorage при их изменении (только после гидрации)
  useEffect(() => {
    if (isHydrated) {
      saveToSessionStorage(CLAIMS_CURSOR_KEY, cursor);
    }
  }, [cursor, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToSessionStorage(CLAIMS_HAS_MORE_KEY, hasMore);
    }
  }, [hasMore, isHydrated]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !isHydrated) {
      if (!hasMore && isLoadingMore) setIsLoadingMore(false);
      return;
    }

    setIsLoadingMore(true);
    const lastClaim = allClaims[allClaims.length - 1];
    setCursor(lastClaim?.id.toString() || '-1');
  }, [hasMore, isLoadingMore, allClaims, isHydrated]);

  const observerRef = useCallback((node: HTMLDivElement) => {
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
  }, [hasMore, isLoadingMore, loadMore, isHydrated]);

  // Восстановление позиции скролла (только после гидрации)
  useEffect(() => {
    if (isHydrated && allClaims.length > 0) {
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
  }, [allClaims.length, isHydrated]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && isHydrated) {
      saveToSessionStorage(SCROLL_POSITION_KEY, scrollContainerRef.current.scrollTop.toString());
    }
  }, [isHydrated]);

  const handleRowClick = useCallback((claimId: number) => {
    saveToSessionStorage(LAST_VIEWED_CLAIM_KEY, claimId.toString());
    saveToSessionStorage(
      SCROLL_POSITION_KEY,
      scrollContainerRef.current?.scrollTop.toString() || "0"
    );
    router.push(`/admin_panel/claims/${claimId}`);
  }, [router]);

  // Функция для очистки кеша
  const clearCache = useCallback(() => {
    if (!isHydrated) return;

    sessionStorage.removeItem(CLAIMS_DATA_KEY);
    sessionStorage.removeItem(CLAIMS_CURSOR_KEY);
    sessionStorage.removeItem(CLAIMS_HAS_MORE_KEY);
    sessionStorage.removeItem(SCROLL_POSITION_KEY);
    setAllClaims([]);
    setCursor('-1');
    setHasMore(true);
    setIsInitialLoad(true);
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated && allClaims.length > 0) {
      const lastViewedClaimId = loadFromSessionStorage(LAST_VIEWED_CLAIM_KEY);
      if (lastViewedClaimId) {
        const element = document.getElementById(`claim-${lastViewedClaimId}`);
        element?.scrollIntoView({ behavior: 'auto', block: 'center' });
        sessionStorage.removeItem(LAST_VIEWED_CLAIM_KEY); // Очистить после восстановления
      }
    }
  }, [allClaims, isHydrated]);

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
        const id = row.getValue("id") as number;
        return (
          <PenBox
            className="w-auto h-auto text-black hover:bg-gray-300 p-2 rounded-md cursor-pointer"
            // В колонке "edit" обновить обработчик клика:
            onClick={(e) => {
              e.stopPropagation();
              if (isHydrated) {
                saveToSessionStorage(LAST_VIEWED_CLAIM_KEY, id.toString());
                saveToSessionStorage(SCROLL_POSITION_KEY, scrollContainerRef.current?.scrollTop.toString() || "0");
              }
              router.push(`/admin_panel/claims/${id}`);
            }} />
        );
      }
    }
  ];

  const table = useReactTable({
    data: allClaims,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col text-3xl h-full w-full items-center justify-center">
          <p>Ошибка загрузки данных:<br />{error.message}</p>
          <button
            onClick={clearCache}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Очистить кеш и попробовать снова
          </button>
        </div>
      </AdminLayout>
    )
  }

  // Показываем загрузку во время гидрации или если нет данных и идет загрузка
  if (!isHydrated || (isLoading && allClaims.length === 0)) {
    return (
      <AdminLayout>
        <div className="flex flex-col h-full w-full items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
          <p className="mt-4 text-lg text-gray-600">
            {!isHydrated ? 'Инициализация...' : 'Загрузка заявок...'}
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex gap-5 w-full h-full justify-between items-start">
        <div className="w-full h-full flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Список заявок</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Загружено: {allClaims.length} заявок
              </div>
              <button
                onClick={clearCache}
                className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                title="Обновить данные"
              >
                Обновить
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto rounded-lg border shadow-sm"
            style={{
              height: 'calc(100vh - 200px)',
              minHeight: '600px'
            }}
          >
            {allClaims.length > 0 ? (
              <div>
                <MyClaimsTable
                  table={table}
                  onRowClick={handleRowClick}
                />

                <div
                  ref={observerRef}
                  className="h-20 flex items-center justify-center"
                >
                  {isLoadingMore && hasMore && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm text-gray-500">Загружаем больше заявок...</span>
                    </div>
                  )}
                  {!hasMore && !isLoadingMore && allClaims.length > 0 && (
                    <div className="text-sm text-gray-500 py-4">
                      Все заявки загружены
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex w-full h-full items-center justify-center text-xl text-gray-500">
                Заявки не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}