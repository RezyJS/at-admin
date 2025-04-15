'use client'

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { toast } from "sonner";
import { Info } from 'lucide-react';
import MyForm from "./MyForm";

const formSchema = z.object({
  email: z.string().email({ message: "В введённой почте есть ошибка." }),
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function EmailForm({ callback }: { callback: Function }) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    axios.post('/api/signin', values)
      .then((res) => {
        toast('Код отправлен на почту!', {
          icon: <Info />
        })
        console.info(res);
        callback(true);
      })
      .catch((res) => {
        toast('Ошибка!', {
          description: res.message,
          closeButton: true,
        })
      })
  }

  return (
    <MyForm
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      label="Электронная почта"
      placeholder="ivanov@mail.ru"
      description="Ваша почта для входа"
    >
      <Button variant={'default'} onClick={() => { form.handleSubmit(onSubmit) }}>Отправить</Button>
    </MyForm>
  );
}
