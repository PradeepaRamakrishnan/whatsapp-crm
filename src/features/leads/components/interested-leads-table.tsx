/** biome-ignore-all lint/a11y/useButtonType: <> */
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
import { EllipsisIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
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
import { getAllLeads } from '../services';
import type { Lead, LeadsResponse } from '../types';

export function InterestedLeadsTable() {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: leadsResponse, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leads', { page, limit: pageSize }],
    queryFn: () => getAllLeads(page, pageSize),
  });

  // console.log('leadsResponse', leadsResponse);

  const columnHelper = createColumnHelper<Lead>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('customerName', {
        header: 'Name',
        cell: ({ getValue, row }) => (
          <button
            // onClick={() => router.push(`/leads/${row.original.id}`)}
            onClick={() =>
              router.push(
                `/leads/${slugify(row.original.customerName, { lower: true })}/${row.original.id}`,
              )
            }
            className="font-medium hover:text-primary hover:underline cursor-pointer"
          >
            {String(getValue() || '')}
          </button>
        ),
        size: 180,
      }),
      columnHelper.accessor('fileContent.emailId', {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.fileContent?.emailId || '-'}
          </div>
        ),
        size: 220,
      }),
      columnHelper.accessor('fileContent.mobileNumber', {
        id: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.fileContent?.mobileNumber || '-'}
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor('campaign.name', {
        id: 'campaign',
        header: 'Campaign',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.original.campaign?.name || '-'}</div>
        ),
        size: 150,
      }),
      columnHelper.accessor('fileContent.settlementAmount', {
        id: 'loanAmount',
        header: 'Amount',
        cell: ({ row }) => {
          const amount = row.original.fileContent?.settlementAmount;
          return (
            <div className="font-medium">{amount ? `₹${amount.toLocaleString('en-IN')}` : '-'}</div>
          );
        },
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => (
          <div className="capitalize px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs inline-block">
            {getValue()}
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor('interestedAt', {
        header: 'Interested At',
        cell: ({ getValue }) => (
          <div className="text-sm text-muted-foreground">
            {new Date(getValue()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        ),
        size: 150,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="text-right">
            <Button variant="ghost" size="icon">
              <EllipsisIcon className="h-4 w-4" />
            </Button>
          </div>
        ),
        size: 80,
      }),
    ],
    [router, columnHelper],
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
    pageCount: leadsResponse?.meta?.totalPages || 0,
    onPaginationChange: setPagination,
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
            placeholder="Search leads..."
            type="text"
            aria-label="Search leads"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Label className="text-sm text-muted-foreground">Rows per page</Label>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(val) => {
              setPagination((prev) => ({ ...prev, pageSize: Number(val), pageIndex: 0 }));
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
                    onClick={() =>
                      router.push(
                        `/leads/${slugify(row.original.customerName, { lower: true })}/${row.original.id}`,
                      )
                    }
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
