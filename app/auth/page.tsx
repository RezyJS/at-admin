'use client';

import EmailForm from '@/components/forms/EmailForm';
import CheckCodeForm from '@/components/forms/CheckCodeForm';
import { useState } from 'react';

export default function AuthPage() {
  const [isCode, setIsCode] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  return (
    <div className='bg-white w-screen h-screen flex flex-col justify-center items-center'>
      <p className='pb-2 text-black font-bold text-5xl'>Тверь в порядке</p>
      <p className='pb-8 text-black font-bold text-3xl'>Администрирование</p>
      {isCode ? (
        <CheckCodeForm
          email={email}
          callback={setIsCode}
        />
      ) : (
        <EmailForm
          setEmail={setEmail}
          callback={setIsCode}
        />
      )}
    </div>
  );
}
