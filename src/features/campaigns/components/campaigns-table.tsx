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
import { Archive } from 'lucide-react';
import Link from 'next/link';
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
import { getAllCampaigns } from '../services';
import type { CampaignData, CampaignStatus, CampaignsResponse } from '../types';

dayjs.extend(utc);

const getStatusColor = (status: CampaignStatus) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'running':
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'paused':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    case 'failed':
      return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    case 'completed':
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
  }
};

const statusLabels: Record<CampaignStatus, string> = {
  active: 'Active',
  running: 'Running',
  paused: 'Paused',
  failed: 'Failed',
  completed: 'Completed',
};

export const columns: ColumnDef<CampaignData>[] = [
  {
    accessorKey: 'name',
    header: 'Campaign Name',
    cell: ({ row }) => (
      <Link
        href={`/campaigns/${slugify(row.original.name, { lower: true })}/${row.original.id}`}
        className="font-medium hover:text-blue-600 hover:underline cursor-pointer transition-colors"
      >
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-50 truncate">
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: CampaignStatus = row.getValue('status');
      return (
        <Badge variant="outline" className={`font-medium ${getStatusColor(status)}`}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastRunAt',
    header: 'Last Run',
    cell: ({ row }) => {
      const date = row.getValue('lastRunAt');
      if (!date) return <div className="text-sm text-muted-foreground">-</div>;
      return (
        <div className="text-sm text-muted-foreground">
          {dayjs.utc(date as string).format('MMM DD, YYYY HH:mm a')}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!date) return <div>-</div>;
      return (
        <div className="text-sm text-muted-foreground">
          {dayjs.utc(date as string).format('MMM DD, YYYY')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Archive"
          onClick={(e) => e.stopPropagation()}
        >
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function CampaignsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const updateParams = React.useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) {
        params.set('page', String(updates.page));
      }
      if (updates.pageSize !== undefined) {
        params.set('pageSize', String(updates.pageSize));
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const { data: campaignsResponse } = useQuery<CampaignsResponse>({
    queryKey: ['campaigns', { page, limit: pageSize }],
    queryFn: () => getAllCampaigns(page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const campaigns = campaignsResponse?.data || [];
  const totalRecords = campaignsResponse?.meta.total || 0;
  const totalPages = campaignsResponse?.meta.totalPages || 0;

  const table = useReactTable({
    data: campaigns,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex-1">
          <Input
            placeholder="Filter campaigns..."
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
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
                      `/campaigns/${slugify(row.original.name, { lower: true })}/${row.original.id}`,
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
          Showing {totalRecords > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, totalRecords)} of {totalRecords} results
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
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
