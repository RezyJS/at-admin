/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

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
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { format } from 'date-fns';
import ChangeClaimSelect from '@/components/Claims/ChangeClaimInfo/Select/ChangeClaimSelect';
import ClaimPhotosCarousel from '@/components/Claims/ClaimsPhotosCarousel/Carousel';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          label: 'В обработке',
          variant: 'secondary' as const,
          className: 'bg-gray-200 text-gray-800 border-gray-200'
        };
      case 'accepted':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'В работе',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Завершена',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'declined':
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: 'Отклонена',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: status,
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center gap-2 px-3 py-1 text-sm font-medium`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const ClaimData = ({ data }: { data: any }) => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {data.title || 'Без названия'}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Создано: {format(new Date(data.datetime), 'dd.MM.yyyy в HH:mm')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>ID пользователя: {data.uid}</span>
                </div>
              </div>
            </div>
            <StatusBadge status={data.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.description || 'Описание отсутствует'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.feedback && (
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-800">
              <AlertCircle className="w-5 h-5" />
              Обратная связь
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 whitespace-pre-wrap">{data.feedback}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Местоположение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Широта:</span>
                <span className="ml-2 font-mono">{data.latitude || 'Не указано'}</span>
              </div>
              <div>
                <span className="text-gray-600">Долгота:</span>
                <span className="ml-2 font-mono">{data.longitude || 'Не указано'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Категория
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm">
              {data.category || 'Не указана'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {data.photos && data.photos.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Прикрепленные фотографии ({data.photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <ClaimPhotosCarousel url={data.photos} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ClaimSkeleton = () => (
  <div className="space-y-6">
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-20" />
        </CardContent>
      </Card>
    </div>
  </div>
);

const ClaimChanger = ({ id, data, handleDeleteClaim, mutate }: {
  id: string,
  data: any,
  handleDeleteClaim: () => void,
  mutate: () => void
}) => {
  return (
    <Card className="border-0 shadow-sm h-fit sticky top-6 max-w-[320px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Управление заявкой</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Статус заявки</label>
          <ChangeClaimSelect data={data} id={id} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Ответ администратора</label>
          <ChangeClaimTextArea id={id} mutate={mutate} />
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteClaim}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Удалить заявку
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ChangeClaimTextArea = ({ id, mutate }: { id: string; mutate: () => void }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`/api/dataFetching/updateClaims/updateFeedback`, { feedback, id });
      toast.success('Успешно сохранено');
      mutate(); // Вызываем мутацию для обновления данных
    } catch (error) {
      toast.error('Ошибка сохранения', { description: `${error}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full h-32 p-3 border rounded-lg break-words whitespace-pre-wrap"
        placeholder="Введите ответ администратора..."
      />
      <Button
        className='w-full'
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
  isLoading,
  data,
  mutate
}: {
  router: AppRouterInstance,
  children: React.ReactNode,
  params: Promise<{ id: string }>,
  isLoading: boolean,
  data: any,
  mutate: () => void
}) => {
  const { id } = React.use(params);

  const handleDeleteClaim = () => {
    axios.delete(`/api/dataFetching/updateClaims/deleteClaim/${id}`)
      .then(() => {
        toast.success('Заявка удалена', { description: 'Заявка была успешно удалена' });
        router.push('/admin_panel/claims');
      })
      .catch(() => toast.error('Ошибка!', { description: 'Не удалось удалить заявку. Попробуйте позже.' }));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Заявка #{id}
        </h1>
        <Button
          onClick={() => {
            router.back();
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Закрыть
        </Button>
      </div>

      <div className="flex gap-8 p-6 max-w-[1800px] mx-auto">
        <div className="flex-1 min-w-0">
          {children}
        </div>

        <div className="w-80 flex-shrink-0 min-w-[300px]">
          {isLoading ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ) : (
            <ClaimChanger
              id={id}
              data={data}
              handleDeleteClaim={handleDeleteClaim}
              mutate={mutate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const getClaimData = (id: string): string => {
  return `/api/dataFetching/getClaims/${id}`;
};

const Claims = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="border-0 shadow-sm max-w-md w-full">
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
              <p className="text-gray-600 mb-4">Не удалось загрузить данные заявки</p>
              <Button onClick={() => router.push('/admin_panel/claims')} variant="outline">
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
        <Wrapper isLoading={isLoading} data={data} params={params} router={router} mutate={mutate}>
          <ClaimSkeleton />
        </Wrapper>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Wrapper isLoading={isLoading} data={data} params={params} router={router} mutate={mutate}>
        <ClaimData data={data} />
        {showScrollButton && (
          <Button
            variant="default"
            className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50 w-12 h-12"
            onClick={scrollToTop}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}
      </Wrapper>
    </AdminLayout>
  );
};

export default Claims;