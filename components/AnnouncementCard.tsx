import React from 'react';
import { useRouter } from 'next/navigation';
import Markdown from 'react-markdown';

interface Announcement {
  id: string;
  title: string;
  description: string;
  datetime: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/admin_panel/announcements/${announcement.id}`);
  };


  return (
    <div
      onClick={handleCardClick}
      className="p-[20px] gap-[10px] rounded-xl w-[75vw] min-w-[320px] flex flex-col justify-between transition-transform duration-300 ease-in-out bg-white transform hover:scale-105 hover:shadow-lg cursor-pointer">
      <div className='font-bold text-xl text-pretty line-clamp-1'>
        <Markdown>
          {announcement.title}
        </Markdown>
      </div>
      <div className='font-medium text-base text-pretty line-clamp-3'>
        <Markdown >
          {announcement.description}
        </Markdown>
      </div>
      <p className='font-normal text-base text-neutral-500 text-pretty'>Опубликовано: {announcement.datetime.slice(0, 11)}</p>
    </div>
  );
};

export default AnnouncementCard;