// app/page.tsx
'use client'; // Директива для Next.js, указывающая, что это клиентский компонент

import React, { useState, useEffect, useRef } from 'react';
import Markdown from '@/components/Markdown/Markdown';
import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { baseURL } from '@/lib/utils';

// Начальное значение для редактора
const initialMarkdown = `#### **Добро пожаловать!**

Это **Markdown** редактор новостей

\\*\\* Текст \\*\\* === **Текст**

\\* Текст \\* === *Текст*

\\~Текст\\~ === ~Текст~

\\\` Текст \\\` для однострочного \`кода\`

\\\`\\\`\\\` Текст \\\`\\\`\\\` для  
\`\`\`
Многострочного
кода и моноширинного
текста
\`\`\`

\\# (1-6 раз) - заголовки от большего к меньшему

Например

### Заголовок 3 порядка
`;

export default function HomePage() {
  // 1. Состояние для хранения текста из редактора
  const [title, setTitle] = useState<string>('Заголовок');
  const [description, setDescription] = useState<string>(initialMarkdown);
  const router = useRouter();

  // 2. Refs для доступа к DOM-элементам панелей
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Ref для предотвращения "войны прокруток"
  const isSyncing = useRef<boolean>(false);

  // 3. Эффект для синхронизации прокрутки
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) return;

    const handleScroll = (source: 'editor' | 'preview') => {
      // Если прокрутка вызвана программно, игнорируем ее
      if (isSyncing.current) {
        isSyncing.current = false;
        return;
      }

      // Устанавливаем флаг, что сейчас будет программная прокрутка
      isSyncing.current = true;

      const sourceEl = source === 'editor' ? editor : preview;
      const targetEl = source === 'editor' ? preview : editor;

      // Вычисляем процент прокрутки
      const scrollPercentage =
        sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);

      // Применяем прокрутку к целевому элементу
      targetEl.scrollTop =
        scrollPercentage * (targetEl.scrollHeight - targetEl.clientHeight);
    };

    const handleEditorScroll = () => handleScroll('editor');
    const handlePreviewScroll = () => handleScroll('preview');

    // Добавляем слушатели событий
    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    // 4. Очистка при размонтировании компонента
    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, []); // Пустой массив зависимостей, чтобы эффект выполнился один раз

  // Функция для рендеринга Markdown в HTML

  return (
    <AdminLayout>
      {/* 
        back button
        */}
      <div className='flex flex-col gap-5'>
        <div className='flex gap-5 items-center'>
          <strong>Заголовок:</strong>
          <Input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <Button
            onClick={() => {
              axios
                .post('/api/dataFetching/createAnnouncement', {
                  title,
                  description,
                })
                .then((res) => {
                  router.push(
                    `${baseURL}/admin_panel/announcements/${res.data.id}`
                  );
                });
            }}
          >
            Создать новость
          </Button>
          <Button
            variant={'outline'}
            className='text-red-500 border-red-500 hover:bg-red-500 hover:text-white'
            onClick={() => router.back()}
          >
            Назад
          </Button>
        </div>
        <div className='flex w-full h-full gap-5 flex-1'>
          <div className='flex flex-col w-1/2 h-[80dvh] gap-2'>
            <strong>Текст новости:</strong>
            <Textarea
              ref={editorRef}
              value={description}
              className='flex-1'
              style={{ resize: 'none' }}
              onChange={(e) => {
                console.info(e.target.value);
                setDescription(e.target.value);
              }}
            />
          </div>
          <div className='flex flex-col gap-2 w-1/2 overflow-scroll h-[80dvh]'>
            <strong>Конечный результат:</strong>
            <div className='p-5 border-[1px] rounded-md h-full'>
              <Markdown>{description}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
