/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import useSWR from 'swr';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  ArrowUp,
  X,
  Calendar,
  FileText,
  AlertCircle,
  Newspaper,
  XCircle,
  Clock,
  User,
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Markdown from '@/components/Markdown/Markdown';

const NewsData = ({ data }: { data: any; mutate: () => void }) => {
  const router = useRouter();

  const handleDeleteNews = () => {
    axios
      .post(`/api/dataFetching/deleteAnnouncement`, { uid: data.id })
      .then(() => {
        toast.success('Новость удалена', {
          description: 'Новость была успешно удалена',
        });
        router.push('/admin_panel/announcements');
      })
      .catch(() =>
        toast.error('Ошибка!', {
          description: 'Не удалось удалить новость. Попробуйте позже.',
        })
      );
  };

  return (
    <div className='space-y-6'>
      <Card className='border-0 shadow-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle className='text-2xl font-bold text-gray-900 mb-2 leading-tight'>
                <Markdown>{data.title || 'Без названия'}</Markdown>
              </CardTitle>
              <div className='space-y-1'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      Опубликовано:{' '}
                      {format(new Date(data.created_at), 'dd.MM.yyyy в HH:mm')}
                    </span>
                  </div>
                </div>
                {data.updated_at && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-4 h-4' />
                      <span>
                        Обновлено:{' '}
                        {format(
                          new Date(data.updated_at),
                          'dd.MM.yyyy в HH:mm'
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Badge
              variant='default'
              className='bg-blue-100 text-blue-800'
            >
              <Newspaper className='w-4 h-4 mr-1' />
              Новость
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex gap-3'>
            <FileText className='w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-gray-700 mb-2'>
                Содержание
              </h3>
              <div className='text-gray-600 prose prose-sm max-w-none'>
                <Markdown>
                  {data.description || 'Описание отсутствует'}
                </Markdown>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.author && (
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <User className='w-5 h-5 text-blue-600' />
              Информация об авторе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <div className='flex gap-2'>
                <span className='font-medium text-gray-600'>Автор:</span>
                <span className='text-gray-800'>
                  {data.author || 'Не указан'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='flex gap-3'>
        <Button
          variant='destructive'
          className='flex items-center gap-2'
          onClick={handleDeleteNews}
        >
          <XCircle className='w-4 h-4' />
          Удалить новость
        </Button>
      </div>
    </div>
  );
};

const NewsSkeleton = () => (
  <div className='space-y-6'>
    <Card className='border-0 shadow-sm'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <Skeleton className='h-8 w-3/4' />
            <div className='space-y-2 mt-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-4 w-40' />
            </div>
          </div>
          <Skeleton className='h-6 w-20' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </CardContent>
    </Card>
  </div>
);

const Wrapper = ({
  router,
  children,
  params,
}: {
  router: AppRouterInstance;
  children: React.ReactNode;
  params: Promise<{ uid: string }>;
  isLoading: boolean;
  data: any;
  mutate: () => void;
}) => {
  const { uid } = React.use(params);
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Новость #{uid.slice(0, 8)}
          </h1>
          <Button
            onClick={() => {
              router.back();
            }}
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <X className='w-4 h-4' />
            Закрыть
          </Button>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='max-w-4xl'>{children}</div>
      </div>
    </div>
  );
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const getAnnouncementData = (uid: string): string => {
  return `/api/dataFetching/getAnnouncements/${uid}`;
};

const News = ({ params }: { params: Promise<{ uid: string }> }) => {
  const { uid } = React.use(params);
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(
    getAnnouncementData(uid),
    fetcher
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
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

  if (error) {
    return (
      <AdminLayout>
        <div className='min-h-screen flex items-center justify-center p-4'>
          <Card className='border-0 shadow-sm max-w-md w-full'>
            <CardContent className='text-center py-8'>
              <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Ошибка загрузки
              </h2>
              <p className='text-gray-600 mb-4'>
                Не удалось загрузить данные новости
              </p>
              <Button
                onClick={() => router.push('/admin_panel/announcements')}
                variant='outline'
              >
                Вернуться к списку
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <Wrapper
          isLoading={isLoading}
          data={data}
          params={params}
          router={router}
          mutate={mutate}
        >
          <NewsSkeleton />
        </Wrapper>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Wrapper
        isLoading={isLoading}
        data={data}
        params={params}
        router={router}
        mutate={mutate}
      >
        <NewsData
          data={data}
          mutate={mutate}
        />
        {showScrollButton && (
          <Button
            variant='default'
            className='fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50 w-12 h-12'
            onClick={scrollToTop}
          >
            <ArrowUp className='w-5 h-5' />
          </Button>
        )}
      </Wrapper>
    </AdminLayout>
  );
};

export default News;
