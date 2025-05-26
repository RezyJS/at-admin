'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import axios from 'axios'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const StatusBadge = ({ status, id }: { status: string; id: string }) => {
  const [currentStatus, setCurrentStatus] = useState(status)

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-gray-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'В обработке',
          className: 'bg-gray-200 text-gray-800 border-gray-200',
        }
      case 'accepted':
        return {
          color: 'bg-blue-100',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'В работе',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        }
      case 'completed':
        return {
          color: 'bg-green-100',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Завершена',
          className: 'bg-green-100 text-green-800 border-green-200',
        }
      case 'declined':
        return {
          color: 'bg-red-100',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Отклонена',
          className: 'bg-red-100 text-red-800 border-red-200',
        }
      default:
        return {
          color: 'bg-gray-100',
          icon: <AlertCircle className="w-4 h-4" />,
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.post(`/api/dataFetching/updateClaims/updateStatus`, {
        status: newStatus,
        id,
      })
      setCurrentStatus(newStatus)
      toast.success('Статус обновлён')
      mutate(`/api/dataFetching/getClaims/${id}`)
    } catch (error) {
      toast.error('Ошибка обновления статуса', { description: `${error}` })
    }
  }

  const config = getStatusConfig(currentStatus)

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className={`py-4 border-1 border-gray-400 rounded-md focus:ring-0 ${config.color}`}>
        <div className={`${config.className} flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-sm cursor-pointer`}>
          {config.icon}
          <span>{config.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            В обработке
          </div>
        </SelectItem>
        <SelectItem value="accepted">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            В работе
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Завершена
          </div>
        </SelectItem>
        <SelectItem value="declined">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Отклонена
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default StatusBadge