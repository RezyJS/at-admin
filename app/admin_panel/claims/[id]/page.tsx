/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { use, useEffect, useState } from 'react';
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
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  XCircle,
  PenBox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/Claims/ChangeClaimInfo/StatusBadge/StatusBadge';
import MarkdownText from '@/components/Markdown/Markdown';
import dynamic from 'next/dynamic';
import { baseURL } from '@/lib/utils';

// Динамическая загрузка компонента карты
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className='h-64 w-full bg-gray-100 rounded-md flex items-center justify-center'>
      Загрузка карты...
    </div>
  ),
});

const ClaimData = ({ data, mutate }: { data: any; mutate: () => void }) => {
  const [isFeedback, setIsFeedback] = useState(false);
  const [openImageIndex, setOpenImageIndex] = useState<number | null>(null);
  const router = useRouter();

  // Блокировка прокрутки при открытой галерее
  useEffect(() => {
    if (openImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [openImageIndex]);

  const handleDeleteClaim = () => {
    axios
      .delete(`/api/dataFetching/updateClaims/deleteClaim/${data.id}`)
      .then(() => {
        toast.success('Заявка удалена', {
          description: 'Заявка была успешно удалена',
        });
        router.push('/admin_panel/claims');
      })
      .catch(() =>
        toast.error('Ошибка!', {
          description: 'Не удалось удалить заявку. Попробуйте позже.',
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
                {data.title || 'Без названия'}
              </CardTitle>
              <div className='flex items-start gap-4 text-sm text-gray-600'>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      Создано:{' '}
                      {format(new Date(data.created_at), 'dd.MM.yyyy в HH:mm')}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      Обновлено:{' '}
                      {format(new Date(data.updated_at), 'dd.MM.yyyy в HH:mm')}
                    </span>
                  </div>
                  <div className='flex gap-1'>
                    <User className='w-4 h-4' />
                    <p>
                      Email пользователя:{' '}
                      <span
                        className='underline cursor-pointer'
                        onClick={() =>
                          router.push(
                            `${baseURL}/admin_panel/user/${data.email}`
                          )
                        }
                      >
                        {data.email}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <StatusBadge
              status={data.status}
              id={data.id}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-start gap-2'>
            <FileText className='w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h3 className='font-semibold text-gray-900 mb-2'>Описание</h3>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {data.description || 'Описание отсутствует'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='border-0 shadow-sm h-full'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-blue-600' />
              Местоположение
            </CardTitle>
          </CardHeader>
          <CardContent className='h-64'>
            {data.latitude && data.longitude ? (
              <DynamicMap
                latitude={parseFloat(data.latitude)}
                longitude={parseFloat(data.longitude)}
              />
            ) : (
              <div className='h-full flex items-center justify-center text-gray-500'>
                Координаты не указаны
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <FileText className='w-5 h-5 text-green-600' />
              Категория
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant='outline'
              className='text-md px-4 py-2 font-bold rounded-md'
            >
              {data.category || 'Не указана'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {data.photos && data.photos.length > 0 && (
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <ImageIcon className='w-5 h-5 text-purple-600' />
              Прикрепленные фотографии ({data.photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4 mt-2'>
              {data.photos.map((url: string, index: number) => {
                return (
                  <button
                    key={index}
                    onClick={() => setOpenImageIndex(index)}
                    className='flex-shrink-0 rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-shadow'
                  >
                    <img
                      src={url}
                      alt={`Прикрепленное фото ${index + 1}`}
                      className='h-60 w-auto object-cover'
                    />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {openImageIndex !== null && (
        <div className='fixed h-[100dvh] inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4'>
          <button
            className='absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20'
            onClick={() => setOpenImageIndex(null)}
          >
            <X className='w-8 h-8' />
          </button>

          <button
            className='absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/20 disabled:opacity-50 disabled:pointer-events-none'
            onClick={(e) => {
              e.stopPropagation();
              setOpenImageIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : prev
              );
            }}
            disabled={openImageIndex === 0}
          >
            <ChevronLeft className='w-8 h-8' />
          </button>

          <button
            className='absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/20 disabled:opacity-50 disabled:pointer-events-none'
            onClick={(e) => {
              e.stopPropagation();
              setOpenImageIndex((prev) =>
                prev !== null && prev < data.photos.length - 1 ? prev + 1 : prev
              );
            }}
            disabled={openImageIndex === data.photos.length - 1}
          >
            <ChevronRight className='w-8 h-8' />
          </button>

          <div className='max-w-4xl w-full max-h-[90vh] flex items-center justify-center'>
            <img
              src={data.photos[openImageIndex]}
              alt={`Просмотр фото ${openImageIndex + 1}`}
              className='max-w-full max-h-[90vh] object-contain'
            />
          </div>
        </div>
      )}

      <Card className='border-0 shadow-sm bg-blue-50'>
        <CardHeader className='pb-3 flex flex-col sm:flex-row justify-between gap-3'>
          <CardTitle className='text-lg font-semibold flex items-center gap-2 text-blue-800'>
            <AlertCircle className='w-5 h-5' />
            Обратная связь
          </CardTitle>
          {isFeedback ? (
            <Button
              variant={'outline'}
              className='bg-transparent border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-red-50'
              onClick={() => {
                setIsFeedback(false);
              }}
            >
              <X className='w-6 h-6' />
              Отмена
            </Button>
          ) : (
            <Button
              variant={'outline'}
              className='bg-transparent border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-blue-50'
              onClick={() => {
                setIsFeedback(true);
              }}
            >
              <PenBox className='w-6 h-6' />
              Редактировать
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isFeedback ? (
            <ChangeClaimTextArea
              id={data.id}
              mutate={mutate}
              text={data.feedback}
              setIsFeedback={setIsFeedback}
            />
          ) : (
            <div className='prose max-w-none text-blue-800 border-2 p-2 border-blue-500 rounded-md break-words'>
              {data.feedback ? (
                <MarkdownText>{data.feedback}</MarkdownText>
              ) : (
                <span className='text-gray-500 italic w-full justify-center flex'>
                  пусто
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex justify-center'>
        <Button
          variant='destructive'
          className='w-max'
          onClick={handleDeleteClaim}
        >
          <XCircle className='w-4 h-4 mr-2' />
          Удалить заявку
        </Button>
      </div>
    </div>
  );
};

const ClaimSkeleton = () => (
  <div className='space-y-6'>
    <Card className='border-0 shadow-sm'>
      <CardHeader>
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-8 w-3/4' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-48' />
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

    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent className='h-64'>
          <Skeleton className='h-full w-full' />
        </CardContent>
      </Card>

      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <Skeleton className='h-6 w-24' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-6 w-20' />
        </CardContent>
      </Card>
    </div>
  </div>
);

const ChangeClaimTextArea = ({
  id,
  mutate,
  text,
  setIsFeedback,
}: {
  id: string;
  mutate: () => void;
  text: string;
  setIsFeedback: (value: boolean) => void;
}) => {
  const [feedback, setFeedback] = useState(text);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!text) setFeedback('');
      await axios.post(`/api/dataFetching/updateClaims/updateFeedback`, {
        feedback,
        id,
      });
      toast.success('Успешно сохранено');
      setIsFeedback(false);
      mutate();
    } catch (error) {
      toast.error('Ошибка сохранения', { description: `${error}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col md:flex-row gap-6'>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className='w-1/2 h-[700px] p-3 text-blue-800 border-2 border-blue-500 rounded-md break-words whitespace-pre-wrap'
          placeholder='Введите ответ администратора...'
        />
        <div className='w-1/2 h-[700px] border overflow-scroll border-gray-500 rounded-md p-3'>
          <div className='max-w-none'>
            <MarkdownText>{feedback}</MarkdownText>
          </div>
        </div>
      </div>
      <Button
        className='w-max self-center bg-blue-500 hover:bg-blue-800'
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Сохранение...' : 'Сохранить ответ'}
      </Button>
    </div>
  );
};

const Wrapper = ({
  router,
  children,
  params,
}: {
  router: AppRouterInstance;
  children: React.ReactNode;
  params: Promise<{ id: string }>;
  isLoading: boolean;
  data: any;
  mutate: () => void;
}) => {
  const { id } = use(params);
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Заявка #{id}</h1>
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

      <div className='space-y-6'>{children}</div>
    </div>
  );
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const getClaimData = (id: string): string => {
  return `/api/dataFetching/getClaims/${id}`;
};

const Claims = ({ params }: { params: Promise<{ id: string }> }) => {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(getClaimData(id), fetcher);

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
        <div className='flex justify-center items-center min-h-[50vh]'>
          <Card className='border-0 shadow-sm max-w-md w-full'>
            <CardContent className='text-center py-8'>
              <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
              <h2 className='text-xl font-bold mb-2'>Ошибка загрузки</h2>
              <p className='text-gray-600 mb-6'>
                Не удалось загрузить данные заявки
              </p>
              <Button
                onClick={() => router.push('/admin_panel/claims')}
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
          <ClaimSkeleton />
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
        <ClaimData
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

export default Claims;
