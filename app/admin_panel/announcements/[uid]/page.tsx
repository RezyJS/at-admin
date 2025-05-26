/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, Frown, X } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import useSWR from 'swr';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';

const NewsData = ({ data }: { data: any }) => (
  <div className='px-[20px] min-w-[320px] text-left text-pretty w-[75vw] mx-auto'>
    <div className="text-pretty text-2xl font-bold">
      <Markdown>{data.title}</Markdown>
    </div>
    <p className='text-pretty text-neutral-500 relative after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-neutral-200 pb-2'>Опубликовано: {('' + new Date(data.created_at).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })).slice(0, 10)}</p>
    <div className='text-pretty pt-2 text-lg text-left font-medium'>
      <Markdown>{data.description}</Markdown>
    </div>
  </div>
);

const NewsSkeleton = () => (
  <div className="flex flex-col gap-5 px-[20px] min-w-[320px] text-left text-pretty w-[75vw] mx-auto">
    <div className='flex flex-col gap-2 relative after:content-[""] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-[2px] after:bg-neutral-200'>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-[210px]" />
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);

const Wrapper = ({ router, children }: { router: AppRouterInstance, children: React.ReactNode }) => (
  <AdminLayout>
    <div className="w-full flex flex-col py-6">
      <div className='px-4 flex justify-end'>
        <Button onClick={() => router.back()} className='w-12 h-12 bg-red-500 hover:bg-red-700'>
          <X />
        </Button>
      </div>
      {children}
    </div>
  </AdminLayout>
);

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const getAnnouncementData = (uid: string): string => {
  return `/api/dataFetching/getAnnouncements/${uid}`;
}

const News = ({ params }: { params: Promise<{ uid: string }> }) => {

  const { uid } = React.use(params);
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { data, isLoading, error } = useSWR(getAnnouncementData(uid), fetcher);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (isLoading && !error) {
    return (

      <Wrapper router={router}>
        <NewsSkeleton />
      </Wrapper>
    );
  }

  if (isLoading || error) {
    return (

      <Wrapper router={router}>
        <div className='flex flex-col justify-center items-center h-[50vh] gap-[10px]'>
          <Frown className='text-blue-600 h-12 w-12' />
          <div className='text-center'>
            <p className='font-semibold text-lg'>Произошла ошибка загрузки.</p>
            <p className='font-semibold text-lg'>Попробуйте обновить страницу.</p>
          </div>
        </div>
      </Wrapper>

    )
  }

  return (

    <Wrapper router={router}>
      <NewsData data={data} />
      {showScrollButton && (
        <Button
          variant='default'
          className="fixed bottom-4 right-4 p-4 rounded-xl shadow-lg w-12 h-12"
          onClick={scrollToTop}
        >
          <ArrowUp size={28} />
        </Button>
      )}
    </Wrapper>

  )

};

export default News;