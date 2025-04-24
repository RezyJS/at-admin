/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Badge } from "../ui/badge";

enum ClaimStatus {
  CREATED = "создана",
  IN_REVIEW = "в рассмотрении",
  IN_PROGRESS = "в работе",
  COMPLETED = "завершена",
  REJECTED = "отклонена",
}

const Status = ({ status }: { status: ClaimStatus }) => {
  const statusMap = {
    [ClaimStatus.CREATED]: 'default',
    [ClaimStatus.IN_REVIEW]: 'blue',
    [ClaimStatus.IN_PROGRESS]: 'cyan',
    [ClaimStatus.COMPLETED]: 'success',
    [ClaimStatus.REJECTED]: 'error',
  };

  const badgeStatus = statusMap[status] || 'default';

  return (
    // @ts-ignore
    <Badge status={badgeStatus} color={badgeStatus} text={status} />
  );
}

export default Status;