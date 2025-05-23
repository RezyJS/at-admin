'use client'

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { mutate } from 'swr';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChangeClaimSelect = ({ data, id }: { data: any; id: string }) => {
  const [status, setStatus] = useState(data.status);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.post(`/api/dataFetching/updateClaims/updateStatus`, { status: newStatus, id });
      setStatus(newStatus);
      toast.success('Статус обновлён');
      mutate(`/api/dataFetching/getClaims/${id}`);
    } catch (error) {
      toast.error('Ошибка обновления статуса', { description: `${error}` });
    }
  };

  return (
    <Select value={status} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <SelectValue placeholder="Статус" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            В обработке
          </div>
        </SelectItem>
        <SelectItem value="accepted">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            В работе
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            Завершена
          </div>
        </SelectItem>
        <SelectItem value="declined">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            Отклонена
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ChangeClaimSelect;