/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";

export default function MyForm(
  { form,
    onSubmit,
    label,
    placeholder,
    description,
    children
  }: {
    form: UseFormReturn<any>,
    onSubmit: any,
    label: string,
    placeholder: string,
    description: string,
    children: ReactNode
  }) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className=" p-6 bg-white border-2 border-black rounded-2xl">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-8">
              <FormLabel className="text-4xl text-black">{label}</FormLabel>
              <div className="flex flex-col gap-2">
                <FormControl>
                  <Input className="h-12 placeholder:text-lg text-black text-lg border-white placeholder:text-[#9d9d9d]" placeholder={placeholder} {...field} />
                </FormControl>
                <FormDescription className="text-black text-lg">{description}</FormDescription>
              </div>
              <FormMessage className="text-lg" />
              {children}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}