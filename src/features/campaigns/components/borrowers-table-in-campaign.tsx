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
import { EllipsisIcon, FunnelX, Settings2 } from 'lucide-react';
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
import { type BorrowerData, borrowersData } from '../lib/borrower-data';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'approved':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  }
};

interface BorrowersTableInCampaignProps {
  campaignId: number;
}

export function BorrowersTableInCampaign({
  campaignId: _campaignId,
}: BorrowersTableInCampaignProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<BorrowerData>();

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <DataGridColumnHeader title="Name" column={column} />,
      cell: ({ getValue }) => <div className="font-medium">{String(getValue() || '')}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('email', {
      header: ({ column }) => <DataGridColumnHeader title="Email" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 220,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('phone', {
      header: ({ column }) => <DataGridColumnHeader title="Phone" column={column} />,
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground">{String(getValue() || '')}</div>
      ),
      size: 150,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('loanAmount', {
      header: ({ column }) => <DataGridColumnHeader title="Loan Amount" column={column} />,
      cell: ({ getValue }) => (
        <div className="font-medium">₹{getValue().toLocaleString('en-IN')}</div>
      ),
      size: 150,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('loanType', {
      header: ({ column }) => <DataGridColumnHeader title="Loan Type" column={column} />,
      cell: ({ getValue }) => <div>{String(getValue() || '')}</div>,
      size: 150,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('creditScore', {
      header: ({ column }) => <DataGridColumnHeader title="Credit Score" column={column} />,
      cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
      size: 130,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
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
    columnHelper.accessor('applicationDate', {
      header: ({ column }) => <DataGridColumnHeader title="Applied On" column={column} />,
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
      size: 130,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="icon">
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 80,
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
        label: 'Name',
        type: 'text',
        placeholder: 'Filter by name...',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Filter by email...',
      },
      {
        key: 'loanType',
        label: 'Loan Type',
        type: 'select',
        placeholder: 'Filter by loan type...',
        options: [
          { label: 'Personal Loan', value: 'Personal Loan' },
          { label: 'Business Loan', value: 'Business Loan' },
          { label: 'Home Loan', value: 'Home Loan' },
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
          { label: 'Pending', value: 'Pending' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
        ],
        searchable: true,
        className: 'w-[160px]',
      },
      {
        key: 'creditScore',
        label: 'Credit Score',
        type: 'number',
        placeholder: 'Filter by credit score...',
      },
      {
        key: 'loanAmount',
        label: 'Loan Amount',
        type: 'number',
        placeholder: 'Filter by loan amount...',
      },
    ],
    [],
  );

  // Apply filters to data
  const filteredData = useMemo(() => {
    const data = borrowersData;
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
        const fieldValue = item[field as keyof BorrowerData];

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
            placeholder="Search borrowers..."
            type="text"
            aria-label="Search borrowers"
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
