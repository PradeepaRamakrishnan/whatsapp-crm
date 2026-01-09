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
import { Edit2, FunnelX, Settings2, Trash2 } from 'lucide-react';
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
import {
  type FinancialInstitution,
  financialInstitutionsData,
} from '../lib/financial-institutions-data';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'inactive':
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  }
};

export function FinancialInstitutionsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<FinancialInstitution>();

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <DataGridColumnHeader title="Institution Name" column={column} />,
      cell: ({ getValue }) => <div className="font-medium">{String(getValue() || '')}</div>,
      size: 250,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('type', {
      header: ({ column }) => <DataGridColumnHeader title="Type" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 150,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('ifscCode', {
      header: ({ column }) => <DataGridColumnHeader title="IFSC Code" column={column} />,
      cell: ({ getValue }) => <div className="text-sm font-mono">{String(getValue() || '')}</div>,
      size: 140,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('branch', {
      header: ({ column }) => <DataGridColumnHeader title="Branch" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('contactPerson', {
      header: ({ column }) => <DataGridColumnHeader title="Contact Person" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('email', {
      header: ({ column }) => <DataGridColumnHeader title="Email" column={column} />,
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground">{String(getValue() || '')}</div>
      ),
      size: 220,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('phone', {
      header: ({ column }) => <DataGridColumnHeader title="Phone" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 140,
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
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" aria-label="Edit">
            <Edit2 className="h-4 w-4" />
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
        label: 'Institution Name',
        type: 'text',
        placeholder: 'Filter by name...',
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        placeholder: 'Filter by type...',
        options: [
          { label: 'Bank', value: 'Bank' },
          { label: 'Credit Union', value: 'Credit Union' },
          { label: 'NBFC', value: 'NBFC' },
        ],
        searchable: true,
        className: 'w-[160px]',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'Filter by status...',
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
        ],
        searchable: true,
        className: 'w-[140px]',
      },
    ],
    [],
  );

  // Apply filters to data
  const filteredData = useMemo(() => {
    const data = financialInstitutionsData;
    let filtered = [...data];

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
        const fieldValue = item[field as keyof FinancialInstitution];

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
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableSorting: true,
    enableSortingRemoval: false,
    manualPagination: false,
    state: {
      pagination,
      sorting,
    },
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
            placeholder="Search institutions..."
            type="text"
            aria-label="Search institutions"
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
