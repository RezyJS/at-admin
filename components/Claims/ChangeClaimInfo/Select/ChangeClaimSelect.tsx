/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

export default function ChangeClaimSelect({ data, id }: { data: any, id: string }) {
  return (
    <Select
      defaultValue={data.status}
      onValueChange={(val) => {
        axios.post('/api/dataFetching/updateClaims/updateStatus', { status: val, id }).then(() => toast('Статус обновлён!'));
      }}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder="Статус" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Статусы</SelectLabel>
          <SelectItem value="pending">
            <div className='flex items-center justify-between w-[180px]'>
              <p>В обработке</p>
              <div className='h-2 w-2 rounded-2xl bg-gray-500'></div>
            </div>
          </SelectItem>
          <SelectItem value="accepted">
            <div className='flex items-center justify-between w-[180px]'>
              <p>В работе</p>
              <div className='h-2 w-2 rounded-2xl bg-blue-500'></div>
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className='flex items-center justify-between w-[180px]'>
              <p>Завершена</p>
              <div className='h-2 w-2 rounded-2xl bg-green-500'></div>
            </div>
          </SelectItem>
          <SelectItem value="declined">
            <div className='flex items-center justify-between w-[180px]'>
              <p>Отклонена</p>
              <div className='h-2 w-2 rounded-2xl bg-red-500'></div>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}