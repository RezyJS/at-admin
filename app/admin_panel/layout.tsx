import AdminLayout from '@/components/layouts/AdminLayout/AdminLayout';
import { PropsWithChildren } from 'react';

export default function AdminTreeLayout({ children }: PropsWithChildren) {
  return <AdminLayout>{children}</AdminLayout>;
}
