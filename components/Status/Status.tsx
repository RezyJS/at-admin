import { Badge } from "@/components/ui/badge";

// Типы статусов
export enum ClaimStatus {
  PENDING = 'В обработке',
  ACCEPTED = 'В работе',
  COMPLETED = 'Завершена',
  DECLINED = 'Отклонена',
}

// Интерфейс заявки
export interface Claim {
  id: number;
  uid: number;
  title: string;
  description: string;
  category: string;
  status: string;
  photos: string[] | null;
  latitude: number;
  longitude: number;
  feedback: string;
  created_at: string;
};

// Компонент Status
const Status = ({ status }: { status: ClaimStatus }) => {
  const statusMap: Record<ClaimStatus, string> = {
    [ClaimStatus.PENDING]: "bg-gray-500",
    [ClaimStatus.ACCEPTED]: "bg-blue-500",
    [ClaimStatus.COMPLETED]: "bg-green-500",
    [ClaimStatus.DECLINED]: "bg-red-500",
  };

  const badgeClass = statusMap[status] || "bg-gray-500"; // Default color if status is unknown

  return (
    <Badge className={`text-white ${badgeClass} px-2 py-0.5 rounded`}>
      {status}
    </Badge>
  );
};

export default Status;