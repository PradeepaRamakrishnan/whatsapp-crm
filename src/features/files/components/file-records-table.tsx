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
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { type Filter, type FilterFieldConfig, Filters } from '@/components/ui/filters';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { type BorrowerData, borrowersData } from '@/features/campaigns/lib/borrower-data';

interface FileRecordsTableProps {
  fileId: string;
}

export function FileRecordsTable({ fileId: _fileId }: FileRecordsTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<BorrowerData>();

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <DataGridColumnHeader title="Customer Name" column={column} />,
      cell: ({ getValue }) => <div className="font-medium">{String(getValue() || '')}</div>,
      size: 200,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('email', {
      header: ({ column }) => <DataGridColumnHeader title="Email" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 240,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('phone', {
      header: ({ column }) => <DataGridColumnHeader title="Mobile No." column={column} />,
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
      header: ({ column }) => <DataGridColumnHeader title="Settlement Amount" column={column} />,
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
    columnHelper.accessor('settlementCount', {
      header: ({ column }) => <DataGridColumnHeader title="Settlement Count" column={column} />,
      cell: ({ getValue }) => <div className="text-sm font-medium">{getValue()}</div>,
      size: 130,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('branch', {
      header: ({ column }) => <DataGridColumnHeader title="Branch" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 160,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('state', {
      header: ({ column }) => <DataGridColumnHeader title="State" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 140,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('primaryCardNumber', {
      header: ({ column }) => <DataGridColumnHeader title="Card Number" column={column} />,
      cell: ({ getValue }) => (
        <div className="text-sm font-mono text-muted-foreground">{String(getValue() || '')}</div>
      ),
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
      enablePinning: true,
    }),
    columnHelper.accessor('monthOfSettlement', {
      header: ({ column }) => <DataGridColumnHeader title="Settlement Month" column={column} />,
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 150,
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
        label: 'Customer Name',
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
        key: 'branch',
        label: 'Branch',
        type: 'text',
        placeholder: 'Filter by branch...',
      },
      {
        key: 'state',
        label: 'State',
        type: 'text',
        placeholder: 'Filter by state...',
      },
      {
        key: 'loanAmount',
        label: 'Settlement Amount',
        type: 'number',
        placeholder: 'Filter by amount...',
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
      return true;
    });

    if (activeFilters.length > 0) {
      filtered = filtered.filter((row) => {
        return activeFilters.every((filter) => {
          const { field, operator, values } = filter;
          const cellValue = row[field as keyof BorrowerData];

          // Handle empty operators
          if (operator === 'empty') {
            return !cellValue || cellValue === '';
          }
          if (operator === 'not_empty') {
            return cellValue && cellValue !== '';
          }

          // Handle other operators
          if (!values || values.length === 0) return true;

          const filterValue = values[0];
          if (filterValue === null || filterValue === undefined) return true;

          switch (operator) {
            case 'equals':
              return String(cellValue).toLowerCase() === String(filterValue).toLowerCase();
            case 'not_equals':
              return String(cellValue).toLowerCase() !== String(filterValue).toLowerCase();
            case 'contains':
              return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'not_contains':
              return !String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'starts_with':
              return String(cellValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
            case 'ends_with':
              return String(cellValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
            case 'greater_than':
              return Number(cellValue) > Number(filterValue);
            case 'less_than':
              return Number(cellValue) < Number(filterValue);
            case 'greater_than_or_equal':
              return Number(cellValue) >= Number(filterValue);
            case 'less_than_or_equal':
              return Number(cellValue) <= Number(filterValue);
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [filters]);

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

  const handleFiltersChange = (newFilters: Filter[]) => {
    setFilters(newFilters);
  };

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
            placeholder="Search records..."
            type="text"
            aria-label="Search records"
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
      </div>
    </DataGrid>
  );
}
