'use client'

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MyForm from "./MyForm";
import { useState } from "react";

const formSchema = z.object({
  token: z.string({ message: "Код неверный" }),
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function CheckCodeForm({ callback }: { callback: Function }) {

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    axios.post('/api/sendtoken', values)
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

  return (
    <MyForm
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      name={'token'}
      label="Код подтверждения"
      placeholder="123abc..."
      description="Код с вашей почты"
    >
      {
        isLoading ?
          <div className="flex w-full justify-center"><Loader2 className='animate-spin' /></div> :
          <div className="flex flex-col gap-2">
            <Button variant={'destructive'} onClick={() => { callback(false) }}>Назад</Button>
            <Button className="bg-green-400 hover:bg-green-500" onClick={() => { form.handleSubmit(onSubmit) }}>Отправить</Button>
          </div>
      }
    </MyForm>
  );
}
