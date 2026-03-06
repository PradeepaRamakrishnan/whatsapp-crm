'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import slugify from 'slugify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllFiles } from '../services';
import type { FileData, FileStatus, FilesResponse } from '../types/file.types';
import { FileActions } from './file-actions';

dayjs.extend(utc);

export const columns: ColumnDef<FileData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className="font-medium capitalize">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <div className="capitalize">{row.getValue('source')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: FileStatus = row.getValue('status');
      const statusStyles: Record<FileStatus, string> = {
        uploaded: 'bg-sky-50 text-sky-700 border border-sky-200',
        queued: 'bg-slate-50 text-slate-600 border border-slate-200',
        processing: 'bg-violet-50 text-violet-700 border border-violet-200',
        pending_review: 'bg-amber-50 text-amber-700 border border-amber-200',
        reviewed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        archived: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
        failed: 'bg-rose-50 text-rose-700 border border-rose-200',
      };
      const statusLabels: Record<FileStatus, string> = {
        uploaded: 'Uploaded',
        queued: 'Queued',
        processing: 'Processing',
        pending_review: 'New',
        reviewed: 'Reviewed',
        archived: 'Archived',
        failed: 'Failed',
      };
      return (
        <Badge
          variant="outline"
          className={`font-medium ${statusStyles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
        >
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Uploaded At',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!date) return <div>-</div>;
      return (
        <div className="text-sm font-normal">
          {dayjs.utc(date as string).format('MMM DD, YYYY HH:mm a')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const file = row.original;
      return (
        <FileActions
          fileId={file.id}
          fileName={file.name}
          currentStatus={file.status}
          variant="dropdown"
        />
      );
    },
  },
];

// ─── FilesTable ────────────────────────────────────────────────────────────────

export function FilesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const updateParams = React.useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const { data: filesResponse } = useQuery<FilesResponse>({
    queryKey: ['files', { page, limit: pageSize }],
    queryFn: () => getAllFiles(page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const files = filesResponse?.data || [];
  const totalRecords = filesResponse?.meta.total ?? 0;
  const totalPages = filesResponse?.meta.totalPages || 0;

  const table = useReactTable({
    data: files,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: { pageIndex: page - 1, pageSize },
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex-1">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className="max-w-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="rowsPerPage" className="text-sm text-muted-foreground">
            Rows per page
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              const v = Number(val) || 10;
              updateParams({ pageSize: v, page: 1 });
            }}
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/files/${slugify(row.original.name, { lower: true })}/${row.original.id}`,
                    )
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} of{' '}
          {totalRecords} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
