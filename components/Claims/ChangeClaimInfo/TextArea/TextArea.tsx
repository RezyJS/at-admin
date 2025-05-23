import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function ChangeClaimTextArea({ id }: { id: string }) {
  const [feedback, setFeedback] = useState('');
  return (
    <div className='w-fit flex flex-col gap-3 items-center'>
      <Textarea className='w-[400px] min-h-[40px] h-[200px] max-h-[400px]'
        value={feedback}
        onChange={(e) => {
          setFeedback(e.currentTarget.value);
        }} />
      <Button
        className="w-full"
        onClick={() => {
          axios.post('/api/dataFetching/updateClaims/updateFeedback', { feedback, id }).then(() => toast('Сообщение отправлено!'));
        }}
      >Отправить</Button>
    </div>
  );
}