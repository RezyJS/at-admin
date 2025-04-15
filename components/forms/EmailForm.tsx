'use client'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { toast } from "sonner";
import { Info } from 'lucide-react';

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" p-6 bg-white border-2 border-black rounded-2xl">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-8">
              <FormLabel className="text-4xl text-black">Электронная почта</FormLabel>
              <div className="flex flex-col gap-2">
                <FormControl>
                  <Input className="h-12 placeholder:text-lg text-black text-lg border-white placeholder:text-[#9d9d9d]" placeholder="test@gmail.com" type="email" {...field} />
                </FormControl>
                <FormDescription className="text-black text-lg">Ваша почта для входа</FormDescription>
              </div>
              <FormMessage className="text-lg" />
              <Button variant={'default'} onClick={() => { form.handleSubmit(onSubmit) }}>Отправить</Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
