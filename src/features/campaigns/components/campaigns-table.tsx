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
import Link from 'next/link';
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
import { type CampaignData, campaignsData } from '../lib/data';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'completed':
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
    case 'draft':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  }
};

export function CampaignsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<CampaignData>();

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <DataGridColumnHeader title="Campaign Name" column={column} />,
      cell: ({ getValue, row }) => (
        <Link
          href={`/campaigns/${row.original.id}`}
          className="font-medium hover:text-blue-600 hover:underline cursor-pointer transition-colors"
        >
          {String(getValue() || '')}
        </Link>
      ),
      size: 250,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('responseRate', {
      header: ({ column }) => <DataGridColumnHeader title="Response Rate" column={column} />,
      cell: ({ getValue }) => {
        const rate = getValue();
        return <div className="text-sm font-medium">{rate > 0 ? `${rate}%` : '-'}</div>;
      },
      size: 140,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('bankName', {
      header: ({ column }) => <DataGridColumnHeader title="Bank Name" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('borrowerCount', {
      header: ({ column }) => <DataGridColumnHeader title="No. of Borrowers" column={column} />,
      cell: ({ getValue }) => (
        <div className="text-sm font-medium">{getValue().toLocaleString('en-IN')}</div>
      ),
      size: 150,
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
            {status}
          </Badge>
        );
      },
      size: 120,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('createdDate', {
      header: ({ column }) => <DataGridColumnHeader title="Created" column={column} />,
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        );
      },
      size: 120,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" aria-label="Manage">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 100,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: true,
    }),
  ];

  const filterFields = useMemo<FilterFieldConfig[]>(
    () => [
      {
        key: 'name',
        label: 'Campaign Name',
        type: 'text',
        placeholder: 'Filter by campaign name...',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'Filter by status...',
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Draft', value: 'Draft' },
        ],
        searchable: true,
        className: 'w-[160px]',
      },
      {
        key: 'responseRate',
        label: 'Response Rate',
        type: 'number',
        placeholder: 'Filter by response rate...',
      },
    ],
    [],
  );

  // Apply filters to data
  const filteredData = useMemo(() => {
    const data = campaignsData;
    let filtered = [...data];

    // Filter out empty filters before applying
    const activeFilters = filters.filter((filter) => {
      const { operator, values } = filter;
      if (operator === 'empty' || operator === 'not_empty') return true;
      if (!values || values.length === 0) return false;
      if (values.every((value) => typeof value === 'string' && value.trim() === '')) return false;
      if (values.every((value) => value === null || value === undefined)) return false;
      if (values.every((value) => Array.isArray(value) && value.length === 0)) return false;
      return true;
    });

    activeFilters.forEach((filter) => {
      const { field, operator, values } = filter;
      filtered = filtered.filter((item) => {
        const fieldValue = item[field as keyof CampaignData];

        switch (operator) {
          case 'is':
            return values.some((value) => String(value) === String(fieldValue));
          case 'is_not':
            return !values.some((value) => String(value) === String(fieldValue));
          case 'contains':
            return values.some((value) =>
              String(fieldValue).toLowerCase().includes(String(value).toLowerCase()),
            );
          case 'not_contains':
            return !values.some((value) =>
              String(fieldValue).toLowerCase().includes(String(value).toLowerCase()),
            );
          case 'starts_with':
            return values.some((value) =>
              String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase()),
            );
          case 'ends_with':
            return values.some((value) =>
              String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase()),
            );
          case 'equals':
            return String(fieldValue) === String(values[0]);
          case 'not_equals':
            return String(fieldValue) !== String(values[0]);
          case 'greater_than':
            return Number(fieldValue) > Number(values[0]);
          case 'less_than':
            return Number(fieldValue) < Number(values[0]);
          case 'greater_than_or_equal':
            return Number(fieldValue) >= Number(values[0]);
          case 'less_than_or_equal':
            return Number(fieldValue) <= Number(values[0]);
          case 'between':
            if (values.length >= 2) {
              const min = Number(values[0]);
              const max = Number(values[1]);
              return Number(fieldValue) >= min && Number(fieldValue) <= max;
            }
            return true;
          case 'not_between':
            if (values.length >= 2) {
              const min = Number(values[0]);
              const max = Number(values[1]);
              return Number(fieldValue) < min || Number(fieldValue) > max;
            }
            return true;
          case 'empty':
            return (
              fieldValue === null || fieldValue === undefined || String(fieldValue).trim() === ''
            );
          case 'not_empty':
            return (
              fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== ''
            );
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [filters]);

  const handleFiltersChange = useCallback((filters: Filter[]) => {
    setFilters(filters);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  const table = useReactTable({
    columns,
    data: filteredData,
    state: {
      pagination,
      sorting,
    },
    enableSorting: true,
    enableSortingRemoval: false,
    manualPagination: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
    >
      <div className="w-full space-y-2.5">
        {/* Filters and Controls Row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            className="h-8 w-full sm:w-60"
            value={(table.getState().globalFilter ?? '') as string}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            type="text"
            aria-label="Search all columns"
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
            <Button variant="outline" size="sm" onClick={() => setFilters([])}>
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
