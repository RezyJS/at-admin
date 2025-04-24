import { Badge } from "@/components/ui/badge";

// Типы статусов
export enum ClaimStatus {
  CREATED = "создана",
  IN_REVIEW = "в рассмотрении",
  IN_PROGRESS = "в работе",
  COMPLETED = "завершена",
  REJECTED = "отклонена",
}

// Интерфейс заявки
export interface Claim {
  id: number;
  category: string;
  title: string;
  description: string;
  status: string;
  photos: string[] | null;
  feedback: string;
  datetime: string;
  latitude: string;
  longitude: string;
  user: number;
}

// Компонент Status
const Status = ({ status }: { status: ClaimStatus }) => {
  const statusMap: Record<ClaimStatus, string> = {
    [ClaimStatus.CREATED]: "bg-gray-500",
    [ClaimStatus.IN_REVIEW]: "bg-blue-500",
    [ClaimStatus.IN_PROGRESS]: "bg-cyan-500",
    [ClaimStatus.COMPLETED]: "bg-green-500",
    [ClaimStatus.REJECTED]: "bg-red-500",
  };

  const badgeClass = statusMap[status] || "bg-gray-500"; // Default color if status is unknown

  return (
    <Badge className={`text-white ${badgeClass} px-2 py-0.5 rounded`}>
      {status}
    </Badge>
  );
};

export default Status;