'use client'

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MyForm from "./MyForm";

const formSchema = z.object({
  token: z.string({ message: "Код неверный" }),
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function CheckCodeForm({ callback }: { callback: Function }) {

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    axios.post('/api/sendtoken', values)
      .then((res) => {
        toast('Успешно!', {
          icon: <CheckCircle2 />
        })
        console.info(res);
        router.replace('/admin_panel')
      })
      .catch(() => {
        toast('Ошибка!', {
          description: 'Неправильный код',
          closeButton: true,
        })
      })
  }

  return (
    <MyForm
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      label="Код подтверждения"
      placeholder="123abc..."
      description="Код с вашей почты"
    >
      <div className="flex flex-col gap-2">
        <Button variant={'destructive'} onClick={() => { callback(false) }}>Назад</Button>
        <Button className="bg-green-400 hover:bg-green-500" onClick={() => { form.handleSubmit(onSubmit) }}>Отправить</Button>
      </div>
    </MyForm>
  );
}
