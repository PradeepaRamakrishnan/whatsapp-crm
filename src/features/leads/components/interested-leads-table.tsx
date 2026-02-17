/** biome-ignore-all lint/a11y/useButtonType: <> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
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
import { Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { deleteLead, getAllLeads, getCampaignById } from '../services';
import type { Lead, LeadsResponse } from '../types';

function LeadActions({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete lead');
      console.error(error);
    },
  });

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
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
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete lead for{' '}
              <span className="font-semibold">&quot;{name}&quot;</span>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
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

export function InterestedLeadsTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlSearch = searchParams.get('search') || '';

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: pageSize,
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
    const timeoutId = setTimeout(() => {
      if (globalFilter === urlSearch) return;
      updateParams({ search: globalFilter });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [globalFilter, urlSearch, updateParams]);

  const { data: leadsResponse, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leads', { page, limit: pageSize, search: urlSearch }],
    queryFn: () => getAllLeads(page, pageSize, urlSearch || undefined),
  });

  const prefetchLead = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ['campaign', id],
        queryFn: () => getCampaignById(id),
        staleTime: 60 * 1000,
      });
    },
    [queryClient],
  );

  const columnHelper = createColumnHelper<Lead>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('campaign.name', {
        id: 'campaign',
        header: 'Campaign Name',
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            {row.original.campaign?.name ? (
              <Link
                href={`/leads/${slugify(row.original.campaign.name, { lower: true })}/${row.original.campaign.id}`}
                className="font-medium hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                onMouseEnter={() => {
                  if (row.original.campaign?.id) {
                    prefetchLead(row.original.campaign.id);
                  }
                }}
              >
                {row.original.campaign.name}
              </Link>
            ) : (
              <div className="text-sm text-muted-foreground">-</div>
            )}
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('campaign.description', {
        id: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.campaign?.description || row.original.campaign?.bankName || '-'}
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('campaign.lastRunAt', {
        id: 'lastRunAt',
        header: 'Last Run',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.campaign?.lastRunAt
              ? dayjs(row.original.campaign.lastRunAt).format('MMM DD, YYYY hh:mm a')
              : '-'}
          </div>
        ),
        size: 180,
      }),
      columnHelper.accessor('campaign.createdAt', {
        id: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.campaign?.createdAt
              ? dayjs(row.original.campaign.createdAt).format('MMM DD, YYYY')
              : '-'}
          </div>
        ),
        size: 150,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <LeadActions id={row.original.id} name={row.original.customerName} />
          </div>
        ),
        size: 80,
      }),
    ],
    [prefetchLead, columnHelper],
  );

  const table = useReactTable({
    columns,
    data: leadsResponse?.data || [],
    state: {
      pagination,
      sorting,
    },
    enableSorting: true,
    enableSortingRemoval: false,
    manualPagination: true,
    manualFiltering: true,
    pageCount: leadsResponse?.meta?.totalPages || 0,
    onPaginationChange: (updater) => {
      const nextState = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(nextState);
      updateParams({
        page: nextState.pageIndex + 1,
        pageSize: nextState.pageSize,
      });
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
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
            aria-label="Search campaigns"
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
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
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
                    onMouseEnter={() => prefetchLead(row.original.campaign?.id || '')}
                    onClick={() => {
                      if (row.original.campaign?.id) {
                        router.push(
                          `/leads/${slugify(row.original.campaign.name, { lower: true })}/${row.original.campaign.id}`,
                        );
                      }
                    }}
                    className="hover:bg-muted/50 cursor-pointer"
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
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!isLoading && (
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="text-muted-foreground flex-1 text-sm">
            Showing{' '}
            {leadsResponse?.data?.length ? pagination.pageIndex * pagination.pageSize + 1 : 0} to{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              leadsResponse?.meta?.total || 0,
            )}{' '}
            of {leadsResponse?.meta?.total || 0} results
          </div>
          <div className="space-x-2 flex items-center">
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
