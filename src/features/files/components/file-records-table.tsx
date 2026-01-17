/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getFileById } from '../services';
import type { FileRecord } from '../types/file.types';

interface FileRecordsTableProps {
  fileId: string;
}

export function FileRecordsTable({ fileId }: FileRecordsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial pagination from URL or use defaults
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialLimit = Number(searchParams.get('limit')) || 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage - 1,
    pageSize: initialLimit,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;

      setPagination(newPagination);

      // Sync URL for bookmarking/sharing (doesn't affect data fetching)
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPagination.pageIndex + 1));
      params.set('limit', String(newPagination.pageSize));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pagination, pathname, router, searchParams],
  );

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const {
    data: fileData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['file', fileId, { page, limit }],
    queryFn: () => getFileById(fileId, page, limit),
    placeholderData: keepPreviousData,
  });

  const isPageTransitioning = isFetching && fileData;

  const records = useMemo(() => fileData?.contents.data || [], [fileData]);
  const totalRecords = fileData?.contents.meta.total || 0;
  const totalPages = fileData?.contents.meta.totalPages || 0;

  const columnHelper = createColumnHelper<FileRecord>();

  const columns = useMemo<ColumnDef<FileRecord, any>[]>(
    () => [
      columnHelper.accessor('customerName', {
        id: 'customerName',
        header: ({ column }) => <DataGridColumnHeader title="Customer Name" column={column} />,
        cell: ({ getValue }) => <div className="font-medium">{String(getValue() || '')}</div>,
        meta: {
          headerTitle: 'Customer Name',
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.accessor('emailId', {
        id: 'emailId',
        header: ({ column }) => <DataGridColumnHeader title="Email" column={column} />,
        cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
        meta: {
          headerTitle: 'Email',
        },
        size: 240,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.accessor('mobileNumber', {
        id: 'mobileNumber',
        header: ({ column }) => <DataGridColumnHeader title="Mobile No." column={column} />,
        cell: ({ getValue }) => (
          <div className="text-sm text-muted-foreground">{String(getValue() || '')}</div>
        ),
        meta: {
          headerTitle: 'Mobile Number',
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.accessor('settlementAmount', {
        id: 'settlementAmount',
        header: ({ column }) => <DataGridColumnHeader title="Settlement Amount" column={column} />,
        cell: ({ getValue }) => (
          <div className="font-medium">₹{Number(getValue()).toLocaleString('en-IN')}</div>
        ),
        meta: {
          headerTitle: 'Settlement Amount',
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
        meta: {
          headerTitle: 'Actions',
        },
        size: 120,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enablePinning: true,
      }),
    ],
    [columnHelper],
  );

  // Apply global filter (client-side for current page)
  const filteredData = useMemo(() => {
    let filtered = [...records];

    if (globalFilter) {
      filtered = filtered.filter((record) => {
        const searchStr = globalFilter.toLowerCase();
        return (
          record.customerName.toLowerCase().includes(searchStr) ||
          record.emailId.toLowerCase().includes(searchStr) ||
          record.mobileNumber.toLowerCase().includes(searchStr)
        );
      });
    }

    return filtered;
  }, [records, globalFilter]);

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: totalPages > 0 ? totalPages : -1,
    rowCount: totalRecords,
    manualPagination: true,
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    enableSorting: true,
    enableSortingRemoval: false,
    onPaginationChange: handlePaginationChange,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalRecords}
      tableLayout={{
        rowBorder: true,
        headerBorder: true,
        width: 'fixed',
        columnsResizable: true,
        columnsPinnable: true,
      }}
    >
      <div className="w-full space-y-2.5">
        <div className="flex items-center gap-3">
          <Input
            className="h-8 w-full sm:w-60"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            type="text"
            aria-label="Search records"
            disabled={isLoading}
          />
        </div>

        <DataGridContainer>
          <ScrollArea>
            {isLoading && !fileData ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading records...</p>
              </div>
            ) : (
              <div
                className={cn(
                  'transition-opacity duration-200',
                  isPageTransitioning && 'opacity-50 pointer-events-none',
                )}
              >
                <DataGridTable />
              </div>
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>

        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
