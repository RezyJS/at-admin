import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function ChangeClaimTextArea({ id }: { id: string }) {
  const [feedback, setFeedback] = useState('');
  return (
    <div className='flex flex-col gap-3'>
      <Textarea className='w-[360px] min-h-[40px] h-[40px] max-h-[200px]'
        value={feedback}
        onChange={(e) => {
          setFeedback(e.currentTarget.value);
        }} />
      <Button
        onClick={() => {
          axios.post('/api/dataFetching/updateClaims/updateFeedback', { feedback, id }).then(() => toast('Сообщение отправлено!'));
        }}
      >Отправить</Button>
    </div>
  );
}