/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { flexRender } from '@tanstack/react-table';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '../ui/table';
import { Admin } from '@/app/admin_panel/administrators/page';
import type { Table as TypeTable } from '@tanstack/react-table';
import { Key, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Claim } from '../Status/Status';

type BlockedUser = {
  id: number;
  uid: number;
  email: string;
  blocked_at: string;
};

export function MyBlockedUsersTable({
  table,
  onRowClick,
}: {
  table: TypeTable<BlockedUser>;
  onRowClick: (claimId: number) => void;
}) {
  return (
    <MyTable table={table}>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className='even:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer'
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(row.original.id);
          }}
        >
          {row.getVisibleCells().map((cell) => {
            return (
              <TableCell
                key={cell.id}
                className='w-max px-4'
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </MyTable>
  );
}

export function MyClaimsTable({
  table,
  onRowClick,
}: {
  table: TypeTable<Claim>;
  onRowClick: (claimId: number) => void;
}) {
  return (
    <MyTable table={table}>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className='even:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer'
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(row.original.id);
          }}
        >
          {row.getVisibleCells().map((cell) => {
            const isIdColumn = cell.column.id === 'id';
            const isDateColumn = cell.column.id === 'created_at';
            const centerClass = isIdColumn || isDateColumn ? 'text-center' : '';

            return (
              <TableCell
                key={cell.id}
                className={`py-3 px-4 text-gray-600 text-sm ${centerClass}`}
                style={{ height: '72px' }}
              >
                <div className='line-clamp-3'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </MyTable>
  );
}

export function MyNewsTable({
  table,
  onRowClick,
}: {
  table: any;
  onRowClick?: (announcementId: number) => void;
}) {
  const router = useRouter();

  return (
    <div className='w-full overflow-x-auto'>
      <table className='w-full table-fixed'>
        <thead className='bg-gray-50 sticky top-0 z-[5]'>
          {table
            .getHeaderGroups()
            .map(
              (headerGroup: { id: Key | null | undefined; headers: any[] }) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => {
                    const isIdColumn = header.column.id === 'id';
                    const isDateColumn = header.column.id === 'created_at';

                    // Определяем ширину колонок
                    let widthClass = '';
                    if (isIdColumn) widthClass = 'w-8';
                    else if (header.column.id === 'title') widthClass = 'w-1/4';
                    else if (header.column.id === 'description')
                      widthClass = 'w-1/2';
                    else if (isDateColumn) widthClass = 'w-32';

                    return (
                      <th
                        key={header.id}
                        className={`py-3 px-4 font-semibold text-gray-700 text-left bg-gray-50 shadow-sm border-b border-gray-200 ${widthClass}`}
                        style={{
                          position: 'sticky',
                          top: 0,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              )
            )}
        </thead>
        <tbody>
          {table
            .getRowModel()
            .rows.map(
              (row: {
                original: any;
                id: Key | null | undefined;
                getVisibleCells: () => any[];
              }) => (
                <tr
                  key={row.id}
                  className='even:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border-b'
                  onClick={() =>
                    onRowClick
                      ? onRowClick(row.original.id)
                      : router.push(
                          `/admin_panel/announcements/${row.original.id}`
                        )
                  }
                  style={{ height: '72px' }}
                >
                  {row.getVisibleCells().map((cell: any) => {
                    const isIdColumn = cell.column.id === 'id';
                    const isDateColumn = cell.column.id === 'created_at';
                    const centerClass =
                      isIdColumn || isDateColumn ? 'text-center' : '';

                    return (
                      <td
                        key={cell.id}
                        className={`py-2 px-4 text-gray-600 text-sm ${centerClass}`}
                        style={{ height: '72px', verticalAlign: 'top' }}
                      >
                        <div
                          className='h-full overflow-hidden'
                          style={{ maxHeight: '64px' }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
}

export function MyAdminTable({ table }: { table: TypeTable<Admin> }) {
  return (
    <MyTable table={table}>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className='even:bg-gray-50 hover:bg-gray-100 transition-colors'
          style={{ height: '72px' }}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className='py-3 px-4 text-gray-600 text-sm'
              style={{ height: '72px' }}
            >
              <div className='line-clamp-3'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </MyTable>
  );
}

function MyTable({
  table,
  children,
}: {
  table: TypeTable<any>;
  children?: ReactNode;
}) {
  return (
    <div className='w-full overflow-x-auto'>
      <Table>
        <TableHeader className='bg-gray-50 sticky top-0 z-[5]'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className='[&>th]:sticky [&>th]:top-0 [&>th]:z-[6]'
            >
              {headerGroup.headers.map((header) => {
                const isIdColumn = header.column.id === 'id';
                const isDateColumn = header.column.id === 'created_at';
                const centerClass =
                  isIdColumn || isDateColumn ? 'text-center' : '';

                return (
                  <TableHead
                    key={header.id}
                    className={`py-3 px-4 font-semibold text-gray-700 text-left bg-gray-50 shadow-sm border-b border-gray-200 ${centerClass}`}
                    style={{
                      position: 'sticky',
                      top: 0,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className='[&>tr]:relative [&>tr]:z-0'>{children}</TableBody>
      </Table>
    </div>
  );
}
