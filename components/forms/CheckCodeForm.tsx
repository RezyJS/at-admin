'use client'

import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "../ui/button";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function CheckCodeForm({ callback, email }: { callback: Function, email: string | null }) {

  const [, setIsLoading] = useState(false);
  const [code, setCode] = useState<string>();

  const router = useRouter();

  function handleSubmit() {
    setIsLoading(true);
    if (email && code) {
      axios.post('/api/sendtoken', { email, code })
        .then(() => {
          router.replace('/admin_panel/claims')
          toast('Успешно!', {
            icon: <CheckCircle2 />
          })
        })
        .catch(() => {
          toast('Ошибка!', {
            description: 'Неправильный код',
            closeButton: true,
          })
        })
        .finally(() => {
          setIsLoading(false);
        })
    }
  }

  return (
    <div className=" p-6 bg-white border-2 border-black rounded-2xl flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p>Код с почты</p>
        <InputOTP
          pattern={REGEXP_ONLY_DIGITS}
          maxLength={6}
          value={code}
          onChange={(value) => setCode(value)}
        >
          <InputOTPGroup className="flex gap-2">
            <div className="flex">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </div>
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSubmit} className="text-lg font-semibold bg-green-400 hover:bg-green-600">Отправить</Button>
        <Button onClick={() => callback(false)} variant={'destructive'} className="text-lg font-semibold hover:bg-red-800">Вернуться</Button>
      </div>
    </div>
  );
}
