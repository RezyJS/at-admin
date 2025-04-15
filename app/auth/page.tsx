'use client'

import EmailForm from "@/components/forms/EmailForm";
import CheckCodeForm from "@/components/forms/CheckCodeForm";
import { useState } from "react";

export default function AuthPage() {
  const [isCode, setIsCode] = useState(false);

  return (
    <div className="bg-white w-full h-full flex flex-col justify-center items-center">
      <p className="pb-2 text-black font-bold text-5xl">Тверь в порядке</p>
      <p className="pb-8 text-black font-bold text-3xl">Администрирование</p>
      {
        isCode ?
          <CheckCodeForm callback={setIsCode} /> :
          <EmailForm callback={setIsCode} />
      }
    </div>
  );
}