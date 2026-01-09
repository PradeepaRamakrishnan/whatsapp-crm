'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { FunnelX, Settings2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { type Filter, type FilterFieldConfig, Filters } from '@/components/ui/filters';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { type FileData, filesData } from '../lib/files-data';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'submitted':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'reviewed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'rejected':
      return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  }
};

export function FilesTable() {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<FileData>();

  const columns = [
    columnHelper.accessor('fileName', {
      header: ({ column }) => <DataGridColumnHeader title="File Name" column={column} />,
      cell: ({ getValue }) => <span className="font-medium">{String(getValue() || '')}</span>,
      size: 300,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('bankName', {
      header: ({ column }) => <DataGridColumnHeader title="Bank Name" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 200,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
      cell: ({ getValue }) => {
        const status = String(getValue() || '');
        return (
          <Badge className={getStatusColor(status)} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
      size: 120,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('totalRows', {
      header: ({ column }) => <DataGridColumnHeader title="Total Rows" column={column} />,
      cell: ({ getValue }) => (
        <div className="text-sm font-medium">{getValue().toLocaleString()}</div>
      ),
      size: 120,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('uploadedDate', {
      header: ({ column }) => <DataGridColumnHeader title="Uploaded" column={column} />,
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        );
      },
      size: 140,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      size: 80,
      enableHiding: false,
      enableResizing: false,
      enablePinning: true,
    }),
  ];

  const filterFields: FilterFieldConfig[] = [
    {
      key: 'bankName',
      label: 'Bank',
      type: 'select',
      options: [
        { label: 'ICICI Bank', value: 'ICICI Bank' },
        { label: 'HDFC Bank', value: 'HDFC Bank' },
        { label: 'State Bank of India', value: 'State Bank of India' },
        { label: 'Axis Bank', value: 'Axis Bank' },
        { label: 'Kotak Mahindra Bank', value: 'Kotak Mahindra Bank' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Valid', value: 'valid' },
        { label: 'Invalid', value: 'invalid' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    if (filters.length === 0) return filesData;

    return filesData.filter((file) => {
      return filters.every((filter) => {
        const value = file[filter.field as keyof FileData];
        if (value === undefined || value === null) return false;

        if (filter.operator === 'contains') {
          return String(value).toLowerCase().includes(String(filter.values?.[0]).toLowerCase());
        }
        if (filter.operator === 'equals' || filter.operator === 'is') {
          return filter.values?.includes(value as never);
        }
        return true;
      });
    });
  }, [filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });

  const handleFiltersChange = useCallback((newFilters: Filter[]) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const handleRowClick = useCallback(
    (file: FileData) => {
      router.push(`/files/${file.id}`);
    },
    [router],
  );

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        rowBorder: true,
        headerBorder: true,
        width: 'fixed',
        columnsResizable: true,
        columnsPinnable: true,
        columnsVisibility: true,
      }}
      onRowClick={handleRowClick}
    >
      <div className="w-full space-y-2.5">
        {/* Filters and Controls Row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            className="h-8 w-full sm:w-60"
            value={(table.getState().globalFilter ?? '') as string}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search files..."
            type="text"
            aria-label="Search files"
          />

          <DataGridColumnVisibility
            table={table}
            trigger={
              <Button variant="outline" size="sm">
                <Settings2 />
                View
              </Button>
            }
          />

          <div className="flex-1">
            <Filters
              filters={filters}
              fields={filterFields}
              variant="outline"
              onChange={handleFiltersChange}
            />
          </div>

          {filters.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <FunnelX /> Clear
            </Button>
          )}
        </div>

        <DataGridContainer>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
