'use client'

import { flexRender } from "@tanstack/react-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table";
import { Admin } from "@/app/admin_panel/administrators/page";
import type { Table as TypeTable } from "@tanstack/react-table";
import { Announcement } from "@/app/admin_panel/announcements/page";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Claim } from "../Status/Status";

export function MyClaimsTable({ table }: { table: TypeTable<Claim> }) {

  const router = useRouter();

  return (
    <MyTable table={table}>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => router.push(`/admin_panel/claims/${row.original.id}?id=${row.original.id}`)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="py-3 px-4 text-gray-600 text-sm">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </MyTable>
  );
}

export function MyNewsTable({ table }: { table: TypeTable<Announcement> }) {

  const router = useRouter();

  return (
    <MyTable table={table}>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => router.push(`/admin_panel/announcements/${row.original.id}`)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="py-3 px-4 text-gray-600 text-sm">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </MyTable>
  );
}

export function MyAdminTable({ table }: { table: TypeTable<Admin> }) {
  return (
    <MyTable table={table}>
      <TableBody>
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
      </TableBody>
    </MyTable>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MyTable({ table, children }: { table: TypeTable<any>, children?: ReactNode }) {
  return (
    <div className="overflow-x-auto overflow-y-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-3 px-4 font-semibold text-gray-700 text-left">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {children}
      </Table>
    </div>
  );
}