'use client';

import { Button } from '@/components/ui/button';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2, Lock, PenBox, Unlock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { MyClaimsTable } from '@/components/Table/Table';
import Status, { Claim, ClaimStatus } from '@/components/Status/Status';
import getShortText from '@/helpers/getShortText';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import { toast } from 'sonner';

const statusParser = {
  pending: ClaimStatus.PENDING,
  accepted: ClaimStatus.ACCEPTED,
  completed: ClaimStatus.COMPLETED,
  declined: ClaimStatus.DECLINED,
};

const getCacheKey = (email: string, baseKey: string) => `${email}-${baseKey}`;

const SCROLL_POSITION_KEY = (email: string) =>
  getCacheKey(email, 'user-claims-scroll-position');
const LAST_VIEWED_CLAIM_KEY = (email: string) =>
  getCacheKey(email, 'last-viewed-claim-id');
const CLAIMS_DATA_KEY = (email: string) =>
  getCacheKey(email, 'user-claims-cached-data');
const CLAIMS_CURSOR_KEY = (email: string) =>
  getCacheKey(email, 'user-claims-cursor');
const CLAIMS_HAS_MORE_KEY = (email: string) =>
  getCacheKey(email, 'user-claims-has-more');

const page_size = 15;

const saveToSessionStorage = (key: string, data: unknown) => {
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

const userFetcher = (url: string, email: string) =>
  axios.post(url, { email }).then((res) => res.data);

const claimsFetcher = (
  url: string,
  uid: string,
  cursor: string,
  page_size: number
) => axios.post(url, { uid, cursor, page_size }).then((res) => res.data);

const blockedFetcher = (url: string, email: string) =>
  axios.post(url, { email }).then((res) => res.data);

export default function UserPage() {
  const router = useRouter();
  const email = decodeURIComponent(useParams().email as string);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: isBlocked, isLoading: blockLoading } = useSWR(
    ['/api/dataFetching/isUserBlocked', email],
    ([url, email]) => blockedFetcher(url, email)
  );

  useEffect(() => {
    if (isBlocked) {
      setIsUserBlocked(isBlocked.isBlocked);
    }
  }, [isBlocked]);

  const [isHydrated, setIsHydrated] = useState(false);
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [cursor, setCursor] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUserBlocked, setIsUserBlocked] = useState<boolean>(false);

  // Очистка кэша при смене пользователя
  useEffect(() => {
    if (!isHydrated) return;

    setAllClaims([]);
    setCursor('');
    setHasMore(true);
    setIsInitialLoad(true);
    setIsLoadingMore(false);
  }, [email, isHydrated]);

  // Загрузка данных из кэша при монтировании
  useEffect(() => {
    if (!email) return;

    const cachedClaims = loadFromSessionStorage(CLAIMS_DATA_KEY(email));
    const cachedCursor = loadFromSessionStorage(CLAIMS_CURSOR_KEY(email));
    const cachedHasMore = loadFromSessionStorage(CLAIMS_HAS_MORE_KEY(email));

    if (cachedClaims && cachedClaims.length > 0) {
      setAllClaims(cachedClaims);
    }

    if (cachedCursor !== null) {
      setCursor(cachedCursor);
    }

    if (cachedHasMore !== null) {
      setHasMore(cachedHasMore);
    }

    setIsHydrated(true);
  }, [email]);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useSWR([`/api/dataFetching/user`, email], ([url, email]) =>
    userFetcher(url, email)
  );

  const shouldFetch =
    hasMore && isHydrated && (allClaims.length === 0 || !isInitialLoad);

  const { data: claimsData, isLoading: claimsLoading } = useSWR(
    user?.uid && shouldFetch
      ? [`/api/dataFetching/userClaims/`, user.uid, cursor, page_size]
      : null,
    ([url, uid, cursor, perPage]) => claimsFetcher(url, uid, cursor, perPage),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: () => setIsLoadingMore(false),
      onSuccess: () => setIsLoadingMore(false),
    }
  );

  // Обработка загруженных данных
  useEffect(() => {
    if (claimsData && claimsData.length > 0) {
      setAllClaims((prev) => {
        const existingIds = new Set(prev.map((claim) => claim.id));
        const newClaims = claimsData.filter(
          (claim: Claim) => !existingIds.has(claim.id)
        );
        const updatedClaims = [...prev, ...newClaims];

        if (isHydrated && email) {
          saveToSessionStorage(CLAIMS_DATA_KEY(email), updatedClaims);
        }

        return updatedClaims;
      });

      if (claimsData.length < page_size) {
        setHasMore(false);
        if (isHydrated && email) {
          saveToSessionStorage(CLAIMS_HAS_MORE_KEY(email), false);
        }
      }

      setIsLoadingMore(false);
    }

    if (isInitialLoad) {
      setIsInitialLoad(false);
    }

    if (claimsData?.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [claimsData, isHydrated, isInitialLoad, email]);

  useEffect(() => {
    if (isHydrated && email) {
      saveToSessionStorage(CLAIMS_CURSOR_KEY(email), cursor);
    }
  }, [cursor, isHydrated, email]);

  useEffect(() => {
    if (isHydrated && email) {
      saveToSessionStorage(CLAIMS_HAS_MORE_KEY(email), hasMore);
    }
  }, [hasMore, isHydrated, email]);

  // Восстановление позиции прокрутки
  useEffect(() => {
    if (isHydrated && allClaims.length > 0 && email) {
      const savedScrollPosition = loadFromSessionStorage(
        SCROLL_POSITION_KEY(email)
      );

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
  }, [allClaims.length, isHydrated, email]);

  const handleRowClick = useCallback(
    (claimId: number) => {
      if (!email) return;

      saveToSessionStorage(LAST_VIEWED_CLAIM_KEY(email), claimId.toString());
      saveToSessionStorage(
        SCROLL_POSITION_KEY(email),
        scrollContainerRef.current?.scrollTop.toString() || '0'
      );
      router.push(`/admin_panel/claims/${claimId}`);
    },
    [router, email]
  );

  const clearCache = useCallback(() => {
    if (!isHydrated || !email) return;

    sessionStorage.removeItem(CLAIMS_DATA_KEY(email));
    sessionStorage.removeItem(CLAIMS_CURSOR_KEY(email));
    sessionStorage.removeItem(CLAIMS_HAS_MORE_KEY(email));
    sessionStorage.removeItem(SCROLL_POSITION_KEY(email));
    setAllClaims([]);
    setCursor('');
    setHasMore(true);
    setIsInitialLoad(true);
  }, [isHydrated, email]);

  // Восстановление позиции просмотренной заявки
  useEffect(() => {
    if (isHydrated && allClaims.length > 0 && email) {
      const lastViewedClaimId = loadFromSessionStorage(
        LAST_VIEWED_CLAIM_KEY(email)
      );
      if (lastViewedClaimId) {
        const element = document.getElementById(`claim-${lastViewedClaimId}`);
        element?.scrollIntoView({ behavior: 'auto', block: 'center' });
        sessionStorage.removeItem(LAST_VIEWED_CLAIM_KEY(email));
      }
    }
  }, [allClaims, isHydrated, email]);

  const toggleBlock = async () => {
    if (!user) return;

    if (!isUserBlocked) {
      try {
        await axios.post(`/api/admin/block-user`, {
          uid: user.uid,
          reason: 'TODO',
        });
        // После успешного изменения статуса обновляем данные пользователя
        setIsUserBlocked(true);
      } catch {
        toast('Ошибка блокировки');
      }
    } else {
      try {
        await axios.post(`/api/admin/unblock-user`, {
          uid: user.uid,
        });
        // После успешного изменения статуса обновляем данные пользователя
        setIsUserBlocked(false);
      } catch {
        toast('Ошибка разблокировки');
      }
    }
  };

  const columns: ColumnDef<Claim>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => {
        const status: 'pending' | 'accepted' | 'completed' | 'declined' =
          row.getValue('status');
        return <Status status={statusParser[status || ClaimStatus.PENDING]} />;
      },
    },
    {
      accessorKey: 'title',
      header: 'Название',
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return <p>{title}</p>;
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
      accessorKey: 'created_at',
      header: 'Дата',
      cell: ({ row }) => {
        const created_at = new Date(row.getValue('created_at') as string);
        return <div>{format(created_at, 'dd.MM.yyyy HH:mm')}</div>;
      },
    },
    {
      accessorKey: 'edit',
      header: '',
      cell: ({ row }) => {
        const id = row.getValue('id') as number;
        return (
          <PenBox
            className='w-auto h-auto text-black hover:bg-gray-300 p-2 rounded-md cursor-pointer'
            onClick={(e) => {
              e.stopPropagation();
              if (isHydrated && email) {
                saveToSessionStorage(
                  LAST_VIEWED_CLAIM_KEY(email),
                  id.toString()
                );
                saveToSessionStorage(
                  SCROLL_POSITION_KEY(email),
                  scrollContainerRef.current?.scrollTop.toString() || '0'
                );
              }
              router.push(`/admin_panel/claims/${id}`);
            }}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: allClaims,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (userLoading || blockLoading || (!isHydrated && allClaims.length === 0)) {
    return <Loader2 className='h-12 w-12 animate-spin text-gray-400' />;
  }

  if (userError) {
    return <p>Ошибка загрузки пользователя.</p>;
  }

  if (!user) {
    return <p>Пользователь не найден.</p>;
  }

  return (
    <div className='space-y-8'>
      {/* Информация о пользователе */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-2xl font-bold mb-4'>Страница пользователя</h1>
            <div className='space-y-2'>
              <p>
                <strong>UID:</strong> {user.uid}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Зарегистрирован:</strong>{' '}
                {format(new Date(user.registered_at), 'dd.MM.yyyy HH:mm')}
              </p>
              <p>
                <strong>Состояние:</strong>{' '}
                <span
                  className={isUserBlocked ? 'text-red-500' : 'text-green-500'}
                >
                  {isUserBlocked ? 'Заблокирован' : 'Активный'}
                </span>
              </p>
            </div>
          </div>
          <Button
            onClick={toggleBlock}
            variant={isUserBlocked ? 'outline' : 'destructive'}
            className='flex items-center gap-2'
          >
            {isUserBlocked ? (
              <Unlock className='h-4 w-4' />
            ) : (
              <Lock className='h-4 w-4' />
            )}
            {isUserBlocked ? 'Снять блокировку' : 'Заблокировать'}
          </Button>
        </div>
      </div>

      {/* Заявки пользователя */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold'>Заявки пользователя</h2>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-500'>
              Загружено: {allClaims.length} заявок
            </div>
            <Button
              onClick={clearCache}
              variant='outline'
              size='sm'
              className='text-sm'
            >
              Обновить
            </Button>
          </div>
        </div>

        {claimsLoading && allClaims.length === 0 ? (
          <div className='flex justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
          </div>
        ) : allClaims.length > 0 ? (
          <div>
            <MyClaimsTable
              table={table}
              onRowClick={handleRowClick}
            />

            <div className='mt-4 text-center'>
              {isLoadingMore && hasMore && (
                <div className='flex items-center justify-center gap-2 text-gray-500'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span>Загружаем больше заявок...</span>
                </div>
              )}
              {!hasMore && !isLoadingMore && allClaims.length > 0 && (
                <div className='text-gray-500'>Все заявки загружены</div>
              )}
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            Заявки не найдены
          </div>
        )}
      </div>
    </div>
  );
}
