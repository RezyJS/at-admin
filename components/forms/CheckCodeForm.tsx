'use client'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" p-6 bg-white border-2 border-black rounded-2xl">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-8">
              <FormLabel className="text-4xl text-black">Код с почты</FormLabel>
              <div className="flex flex-col gap-2">
                <FormControl>
                  <Input className="h-12 placeholder:text-lg text-black text-lg border-white placeholder:text-[#9d9d9d]" placeholder="123abc..." {...field} />
                </FormControl>
                <FormDescription className="text-black text-lg">Ваш код входа</FormDescription>
              </div>
              <FormMessage className="text-lg" />
              <div className="flex flex-col gap-2">
                <Button variant={'destructive'} onClick={() => { callback(false) }}>Назад</Button>
                <Button className="bg-green-400 hover:bg-green-500" onClick={() => { form.handleSubmit(onSubmit) }}>Отправить</Button>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
