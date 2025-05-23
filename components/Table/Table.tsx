/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { flexRender } from "@tanstack/react-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table";
import { Admin } from "@/app/admin_panel/administrators/page";
import type { Table as TypeTable } from "@tanstack/react-table";
import { ComponentType, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { useRouter } from "next/navigation";
import { Claim } from "../Status/Status";

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
          className="even:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(row.original.id);
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="py-3 px-4 text-gray-600 text-sm">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </MyTable>
  );
}

export function MyNewsTable({ table }: { table: any }) {
  const router = useRouter();
  return (
    <table className="min-w-full rounded-lg overflow-hidden text-sm">
      <thead className="bg-gray-100">
        {table.getHeaderGroups().map((headerGroup: { id: Key | null | undefined; headers: any[]; }) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header: { id: Key | null | undefined; isPlaceholder: any; column: { columnDef: { header: string | number | bigint | boolean | ComponentType<any> | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; }; getContext: () => any; }) => (
              <th
                key={header.id}
                className="px-4 py-2 text-left align-middle whitespace-normal min-h-[56px] leading-snug"
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row: {
          original: any; id: Key | null | undefined; getVisibleCells: () => any[];
        }, rowIndex: number) => (
          <tr
            key={row.id}
            className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 border`}
            onClick={() => router.push(`/admin_panel/announcements/${row.original.id}`)}
          >
            {row.getVisibleCells().map((cell: { id: Key | null | undefined; column: { columnDef: { cell: string | number | bigint | boolean | ComponentType<any> | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; }; getContext: () => any; }) => (
              <td
                key={cell.id}
                className="px-4 py-2 align-middle whitespace-normal min-h-[56px] leading-snug"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MyAdminTable({ table }: { table: TypeTable<Admin> }) {
  return (
    <MyTable table={table}>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="py-3 px-4 text-gray-600 text-sm">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </MyTable>
  );
}

function MyTable({ table, children }: { table: TypeTable<any>, children?: ReactNode }) {
  return (
    <div className="overflow-x-auto overflow-y-auto rounded-lg border shadow-sm relative h-full">
      <Table className="border-collapse w-full">
        <TableHeader className="bg-gray-50 sticky top-0 z-[5]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="[&>th]:sticky [&>th]:top-0 [&>th]:z-[6]">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="py-3 px-4 font-semibold text-gray-700 text-left bg-gray-50 shadow-sm border-b border-gray-200"
                  style={{
                    position: 'sticky',
                    top: 0
                  }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="[&>tr]:relative [&>tr]:z-0">
          {children}
        </TableBody>
      </Table>
    </div>
  );
}