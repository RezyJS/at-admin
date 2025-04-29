/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import useSWRInfinite from 'swr/infinite';
import styles from './NewsPage.module.css';
import axios from 'axios';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import NewsSkeleton from '@/components/NewsSkeleton';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp, Frown } from 'lucide-react'; // Import ArrowUp icon
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';

const AnnouncementCard = lazy(() => import('@/components/AnnouncementCard'));

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AnnouncementsPage() {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // Reached the end
    return `/api/dataFetching/getAnnouncements${pageIndex ? `?afterId=${previousPageData[previousPageData.length - 1].uid}` : ''}`;
  };

  const { data, error, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isFetching = useRef(false); // To prevent multiple fetches

  // Check if there are more announcements to load
  const announcements = data ? data.flat() : [];
  const lastPage = data ? data[data.length - 1] : [];
  const hasMore = lastPage && lastPage.length > 0; // If the last page is not empty, there are more announcements

  // Handle scroll event to show/hide the "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Infinite scroll logic
  useEffect(() => {
    const currentLoaderRef = loaderRef.current; // Store the current ref value in a variable

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isValidating && !isFetching.current) {
          console.log('Fetching more data...'); // Debugging
          isFetching.current = true; // Set fetching flag to true
          setSize((prevSize) => prevSize + 1)
            .then(() => {
              console.log('Fetch completed.'); // Debugging
            })
            .catch(() => {
              console.log('Fetch failed.'); // Debugging
            })
            .finally(() => {
              isFetching.current = false; // Reset fetching flag after fetch is done
            });
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the loader is visible
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
  }, [hasMore, isValidating, setSize]);

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (error) {
    return (
      <AdminLayout>
        <div className='flex flex-col justify-center items-center h-[50vh] gap-[10px]'>
          <Frown className='text-blue-600 h-12 w-12' />
          <div className='text-center'>
            <p className='font-semibold text-lg'>Произошла ошибка загрузки.</p>
            <p className='font-semibold text-lg'>Попробуйте обновить страницу.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
              <AnnouncementCard key={announcement.uid} announcement={announcement} />
            ))}
          </div>
        </Suspense>

        {/* Loader for infinite scroll */}
        {hasMore && (
          <div ref={loaderRef} className="w-full flex justify-center my-4">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        )}

        {/* Back to Top Button */}
        {showScrollButton && (
          <Button
            variant='default'
            className="fixed bottom-4 right-4 p-4 rounded-xl shadow-lg w-12 h-12" // Increased padding and size
            onClick={scrollToTop}
          >
            <ArrowUp size={28} /> {/* Increased icon size */}
          </Button>
        )}
      </div>
    </AdminLayout>
  );
}