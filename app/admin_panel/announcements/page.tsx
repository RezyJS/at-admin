/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import useSWRInfinite from 'swr/infinite';
import styles from './NewsPage.module.css';
import axios from 'axios';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import NewsSkeleton from '@/components/NewsSkeleton';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp, Frown } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';

const AnnouncementCard = lazy(() => import('@/components/AnnouncementCard'));

// Фетчер оборачивает ответ в массив, если нужно
const fetcher = (url: string) =>
  axios.get(url).then((res) => {
    return res.data;
  });

export default function AnnouncementsPage() {
  const [hasMore, setHasMore] = useState(true);
  const lastIdRef = useRef<string | number | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isFetching = useRef(false);
  const prevCountRef = useRef<number>(0);

  // getKey: первый запрос без afterId, последующие — с id последнего элемента
  const getKey = (pageIndex: number, previousPageData: any[]) => {
    if (!hasMore) return null;

    if (pageIndex === 0) {
      return '/api/dataFetching/getAnnouncements';
    }

    if (!previousPageData) {
      return null;
    }

    const lastItem = previousPageData[previousPageData.length - 1];
    const nextId = lastItem?.id;

    if (!nextId) return null;

    if (lastIdRef.current === nextId) {
      setHasMore(false);
      return null;
    }

    lastIdRef.current = nextId;
    return `/api/dataFetching/getAnnouncements?afterId=${nextId}`;
  };

  const { data, error, setSize } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    persistSize: true, // сохраняем предыдущую страницу при подгрузке
  });

  // Кнопка "Наверх"
  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Бесконечная подгрузка при скролле
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching.current) {
          isFetching.current = true;

          const prevLastId = lastIdRef.current;

          setSize((prevSize) => prevSize + 1)
            .then(() => {
              const currentData = data?.flat().filter(Boolean) || [];
              const lastItem = currentData[currentData.length - 1];

              if (!lastItem) {
                console.warn('No items in data after setSize');
                return;
              }

              const newId = lastItem.id;
              const newLength = currentData.length;

              if (newId === prevLastId || newLength === prevCountRef.current) {
                setHasMore(false);
              } else {
                prevCountRef.current = newLength;
              }
            })
            .catch((err) => {
              console.error('Error during setSize:', err);
            })
            .finally(() => {
              isFetching.current = false;
            });
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMore, data, setSize]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-[50vh] gap-[10px]">
          <Frown className="text-blue-600 h-12 w-12" />
          <div className="text-center">
            <p className="font-semibold text-lg">Произошла ошибка загрузки.</p>
            <p className="font-semibold text-lg">Попробуйте обновить страницу.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const announcements = data?.length
    ? [...new Map(data.flat().filter(Boolean).map((item) => [item.id, item])).values()]
    : [];

  return (
    <AdminLayout className="flex flex-col p-2 gap-2 w-full h-auto">
      <div className={styles.newsContainer}>
        <Suspense
          fallback={
            <div className="flex flex-col gap-[20px]">
              {Array.from({ length: 3 }).map((_, index) => (
                <NewsSkeleton key={index} />
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-[20px]">
            {announcements.map((announcement: any) => (
              <AnnouncementCard key={`announcement-${announcement.id}`} announcement={announcement} />
            ))}
          </div>
        </Suspense>

        {/* Индикатор загрузки */}
        {hasMore && (
          <div ref={loaderRef} className="w-full flex justify-center my-4">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        )}

        {/* Кнопка "Наверх" */}
        {showScrollButton && (
          <Button
            variant="default"
            className="fixed bottom-4 right-4 p-4 rounded-xl shadow-lg w-12 h-12"
            onClick={scrollToTop}
            aria-label="Вернуться наверх"
          >
            <ArrowUp size={28} />
          </Button>
        )}
      </div>
    </AdminLayout>
  );
}