'use client'

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { toast } from "sonner";
import { Info, Loader2 } from 'lucide-react';
import MyForm from "./MyForm";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "В введённой почте есть ошибка." }),
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function EmailForm({ callback, setEmail }: { callback: Function, setEmail: Function }) {

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    axios.post('/api/signin', values)
      .then(() => {
        setEmail(values.email)
        toast('Код отправлен на почту!', {
          icon: <Info />
        })
        callback(true);
      })
      .catch((res) => {
        toast('Ошибка!', {
          description: res.message,
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
      name={'email'}
      label="Электронная почта"
      placeholder="ivanov@mail.ru"
      description="Ваша почта для входа"
    >
      {
        isLoading ?
          <div className="flex w-full justify-center"><Loader2 className='animate-spin' /></div> :
          <Button variant={'default'} onClick={() => { form.handleSubmit(onSubmit); }}>Отправить</Button>
      }
    </MyForm>
  );
}
