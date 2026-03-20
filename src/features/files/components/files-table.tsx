/** biome-ignore-all lint/a11y/useButtonType: table action buttons */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: stable refs excluded intentionally */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: table rows handle click navigation */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: table rows handle click navigation */
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useMemo, useState } from 'react';
import slugify from 'slugify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
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
import { fetchFiles as getAllFiles } from '../services/client';
import type { FileData, FileStatus, FilesResponse } from '../types/file.types';
import { FileActions } from './file-actions';

dayjs.extend(utc);

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FileStatus, { label: string; dot: string; badge: string }> = {
  uploaded: {
    label: 'Uploaded',
    dot: 'bg-sky-500',
    badge:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/40',
  },
  queued: {
    label: 'Queued',
    dot: 'bg-slate-400',
    badge:
      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/40',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-violet-500 animate-pulse',
    badge:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/40',
  },
  pending_review: {
    label: 'Pending Review',
    dot: 'bg-amber-500',
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
  },
  reviewed: {
    label: 'Reviewed',
    dot: 'bg-emerald-500',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40',
  },
  archived: {
    label: 'Archived',
    dot: 'bg-zinc-400',
    badge:
      'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/40',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-rose-500',
    badge:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40',
  },
};

function StatusBadge({ status }: { status: FileStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.uploaded;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FilesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlSearch = searchParams.get('search') || '';

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState('all');

  const updateParams = useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const { data: filesResponse, isLoading } = useQuery<FilesResponse>({
    queryKey: ['files', { page, limit: pageSize }],
    queryFn: () => getAllFiles(page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const allFiles = filesResponse?.data || [];

  const filtered = useMemo(() => {
    let rows = allFiles;
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      rows = rows.filter(
        (f) => f.name.toLowerCase().includes(q) || f.source.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((f) => f.status === statusFilter);
    }
    return rows;
  }, [allFiles, globalFilter, statusFilter]);

  const columnHelper = createColumnHelper<FileData>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="cursor-pointer font-medium capitalize transition-colors hover:text-blue-600 hover:underline">
              {row.original.name}
            </span>
            {row.original.source && (
              <span className="text-xs capitalize text-muted-foreground">
                {row.original.source}
              </span>
            )}
          </div>
        ),
        size: 240,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        size: 150,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Uploaded',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {dayjs.utc(getValue()).format('MMM DD, YYYY')}
          </span>
        ),
        size: 130,
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Updated',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {dayjs.utc(getValue()).format('MMM DD, YYYY')}
          </span>
        ),
        size: 130,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <FileActions
              fileId={row.original.id}
              fileName={row.original.name}
              currentStatus={row.original.status}
              variant="dropdown"
            />
          </div>
        ),
        size: 80,
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: filtered,
    state: { pagination, sorting },
    enableSorting: true,
    enableSortingRemoval: false,
    manualPagination: true,
    manualFiltering: true,
    pageCount: filesResponse?.meta?.totalPages || 0,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(next);
      updateParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-full sm:w-60"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder="Search by name or source..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-[155px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {(Object.keys(STATUS_CONFIG) as FileStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label className="text-sm text-muted-foreground">Rows per page</Label>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(val) => {
              const size = Number(val) || 10;
              updateParams({ pageSize: size, page: 1 });
            }}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
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
                    onClick={() =>
                      router.push(
                        `/recipients/${slugify(row.original.name, { lower: true })}/${row.original.id}`,
                      )
                    }
                    className="cursor-pointer hover:bg-muted/50"
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
                    No files found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoading && (
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing{' '}
            {filesResponse?.data?.length ? pagination.pageIndex * pagination.pageSize + 1 : 0} to{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              filesResponse?.meta?.total || 0,
            )}{' '}
            of {filesResponse?.meta?.total || 0} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
