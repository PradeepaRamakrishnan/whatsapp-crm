/** biome-ignore-all lint/a11y/useButtonType: table action buttons */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: stable refs excluded intentionally */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: table rows handle click navigation */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: table rows handle click navigation */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Trash2,
  Zap,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect, useMemo, useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { deleteCampaign, getAllCampaigns } from '../services';
import type { CampaignData, CampaignStatus, CampaignsResponse } from '../types';

dayjs.extend(utc);

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  CampaignStatus,
  { label: string; icon: React.ElementType; className: string; dotClass: string }
> = {
  pending: {
    label: 'Setting Up',
    icon: Clock,
    className:
      'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
    dotClass: 'bg-amber-400 animate-pulse',
  },
  active: {
    label: 'Ready to Run',
    icon: PlayCircle,
    className:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  running: {
    label: 'Running',
    icon: Zap,
    className:
      'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400',
    dotClass: 'bg-blue-500 animate-pulse',
  },
  paused: {
    label: 'Paused',
    icon: PauseCircle,
    className:
      'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400',
    dotClass: 'bg-orange-400',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className:
      'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
    dotClass: 'bg-slate-400',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className:
      'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400',
    dotClass: 'bg-red-500',
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    className:
      'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
    dotClass: 'bg-slate-300',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Calendar,
    className:
      'text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400',
    dotClass: 'bg-violet-500',
  },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

// ─── Row actions ─────────────────────────────────────────────────────────────

function CampaignActions({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete campaign');
      console.error(error);
    },
  });

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
              setIsDropdownOpen(false);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">&quot;{name}&quot;</span>? This action cannot be
              undone and will permanently delete the campaign and its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                mutate();
              }}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CampaignsTable() {
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

  const updateParams = useCallback(
    (updates: { page?: number; pageSize?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set('search', updates.search);
          params.set('page', '1');
        } else {
          params.delete('search');
        }
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      if (globalFilter === urlSearch) return;
      updateParams({ search: globalFilter });
    }, 400);
    return () => clearTimeout(id);
  }, [globalFilter, urlSearch, updateParams]);

  const { data: campaignsResponse, isLoading } = useQuery<CampaignsResponse>({
    queryKey: ['campaigns', { page, limit: pageSize, search: urlSearch }],
    queryFn: () => getAllCampaigns(page, pageSize, urlSearch || undefined),
    placeholderData: (previousData) => previousData,
  });

  const columnHelper = createColumnHelper<CampaignData>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Campaign',
        cell: ({ row }) => (
          <span className="cursor-pointer font-medium transition-colors hover:text-blue-600 hover:underline">
            {row.original.name}
          </span>
        ),
        size: 240,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        size: 150,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
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
            <CampaignActions id={row.original.id} name={row.original.name} />
          </div>
        ),
        size: 80,
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: campaignsResponse?.data || [],
    state: { pagination, sorting },
    enableSorting: true,
    enableSortingRemoval: false,
    manualPagination: true,
    manualFiltering: true,
    pageCount: campaignsResponse?.meta?.totalPages || 0,
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
            placeholder="Search campaigns..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
                        `/campaigns/${slugify(row.original.name, { lower: true })}/${row.original.id}`,
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
                    No campaigns found.
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
            {campaignsResponse?.data?.length ? pagination.pageIndex * pagination.pageSize + 1 : 0}{' '}
            to{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              campaignsResponse?.meta?.total || 0,
            )}{' '}
            of {campaignsResponse?.meta?.total || 0} results
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
