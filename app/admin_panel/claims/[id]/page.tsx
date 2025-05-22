/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import useSWR from 'swr';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2, X } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { format } from 'date-fns';
import ChangeClaimSelect from '@/components/Claims/ChangeClaimInfo/Select/ChangeClaimSelect';
import ChangeClaimTextArea from '@/components/Claims/ChangeClaimInfo/TextArea/TextArea';
import CarouselDApiDemo from '@/components/Claims/ClaimsPhotosCarousel/Carousel';
import { baseURL } from '@/lib/utils';
import { toast } from 'sonner';

const ClaimData = ({ data }: { data: any }) => (
  <div className='flex flex-col gap-8 w-full justify-start'>
    <div className='px-[20px] text-left text-pretty w-full flex-col flex mx-auto'>
      <h1 className="text-pretty text-2xl font-bold" style={{ wordWrap: 'break-word' }}>{data.title}</h1>
      <p className='text-pretty text-neutral-500 relative after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-neutral-200 pb-2'>Опубликовано: {format(new Date(data.datetime), 'dd.MM.yyyy')}</p>
      <p className='text-pretty pt-2 text-lg text-left font-medium'>{data.description}</p>
    </div>
    <div className='w-full'>
      {
        data.photos.length > 0 ?
          <CarouselDApiDemo url={data.photos} /> :
          <></>
      }
    </div>
  </div>
);

const ClaimSkeleton = () => (
  <div className="flex flex-col gap-5 px-[20px] min-w-[320px] text-left text-pretty w-[75vw] mx-auto">
    <div className='flex flex-col gap-2 relative after:content-[""] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-[2px] after:bg-neutral-200'>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-[210px]" />
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);

const ClaimChanger = ({ id, data, handleDeleteClaim }: { id: string, data: any, handleDeleteClaim: () => void }) => {
  return (
    <div className='flex flex-col w-full h-full justify-between'>
      <div className='flex flex-col gap-4'>
        <div>
          <p>Статус:</p>
          <ChangeClaimSelect data={data} id={id} />
        </div>
        <div className='flex flex-col'>
          <p>Ответ:</p>
          <ChangeClaimTextArea id={id} />
        </div>
      </div>
      <div className='flex w-full justify-end items-start'>
        <Button
          variant={'destructive'}
          className='w-full'
          onClick={handleDeleteClaim}>
          Удалить
        </Button>
      </div>
    </div>
  );
}

const Wrapper = ({
  router,
  children,
  params,
  isLoading,
  data
}: {
  router: AppRouterInstance,
  children: React.ReactNode,
  params: Promise<{ id: string }>,
  isLoading: boolean,
  data: any
}
) => {
  const { id } = React.use(params);

  const handleDeleteClaim = () => {
    axios.delete(`/api/dataFetching/updateClaims/deleteClaim/${id}`)
      .then(() => router.push('/admin_panel/claims'))
      .catch(() => toast('Ошибка!', { description: 'Попробуйте позже' }))
  }

  return (
    <div className='w-full h-full flex flex-col justify-start'>
      <div className='flex justify-end'>
        <Button onClick={() => router.push(`${baseURL}/admin_panel/claims`)} className='w-12 h-12 bg-red-500 hover:bg-red-700'>
          <X />
        </Button>
      </div>
      <div className='flex justify-between pt-10 px-8 w-full h-full'>
        <div className='w-full justify-start'>
          {children}
        </div>
        <div className='h-full'>
          {
            isLoading ?
              <div className='w-full flex justify-center'>
                <Loader2 className='animate-spin w-12 h-12' />
              </div> :
              <ClaimChanger id={id} data={data} handleDeleteClaim={handleDeleteClaim} />
          }
        </div>
      </div>
    </div >
  );
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const getClaimData = (id: string): string => {
  return `/api/dataFetching/getClaims/${id}`;
}

const Claims = ({ params }: { params: Promise<{ id: string }> }) => {

  const { id } = React.use(params);
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { data, isLoading, error } = useSWR(getClaimData(id), fetcher);

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

  if (isLoading || error) {
    return (
      <AdminLayout>
        <Wrapper isLoading={isLoading} data={data} params={params} router={router}>
          <ClaimSkeleton />
        </Wrapper>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Wrapper isLoading={isLoading} data={data} params={params} router={router}>
        <ClaimData data={data} />
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
    </AdminLayout>
  )

};

export default Claims;