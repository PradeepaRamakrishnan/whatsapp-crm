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
import { Eye, Settings2, Trash2 } from 'lucide-react';
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
import { interestedLeadsData, type LeadData } from '../lib/data';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'interested':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'qualified':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'new':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  }
};

export function InterestedLeadsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<LeadData>();

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <DataGridColumnHeader title="Lead Name" column={column} />,
      cell: ({ getValue, row }) => (
        <Link
          href={`/leads/interested/${row.original.id}`}
          className="font-medium hover:text-orange-600 hover:underline cursor-pointer transition-colors"
        >
          {String(getValue() || '')}
        </Link>
      ),
      size: 150,
      enableSorting: true,
      enableHiding: true,
    }),
    columnHelper.accessor('email', {
      header: ({ column }) => <DataGridColumnHeader title="Email" column={column} />,
      cell: ({ getValue }) => <div className="text-sm ">{String(getValue() || '')}</div>,
      size: 150,
    }),
    columnHelper.accessor('phoneNumber', {
      header: ({ column }) => <DataGridColumnHeader title="Phone Number" column={column} />,
      cell: ({ getValue }) => <div className="text-sm ">{String(getValue() || '')}</div>,
      size: 150,
    }),
    columnHelper.accessor('loanAmountRequested', {
      header: ({ column }) => <DataGridColumnHeader title=" Amount" column={column} />,
      cell: ({ getValue }) => (
        <div className="text-sm ">₹{Number(getValue()).toLocaleString('en-IN')}</div>
      ),
      size: 150,
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
    }),
    // columnHelper.accessor('createdDate', {
    //   header: ({ column }) => <DataGridColumnHeader title="Inquiry Date" column={column} />,
    //   cell: ({ getValue }) => {
    //     const date = new Date(getValue());
    //     return (
    //       <div className="text-sm text-muted-foreground">
    //         {date.toLocaleDateString('en-IN', {
    //           day: '2-digit',
    //           month: 'short',
    //           year: 'numeric',
    //         })}
    //       </div>
    //     );
    //   },
    //   size: 150,
    // }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/leads/interested/${row.original.id}`}>
            <Button variant="ghost" size="icon" aria-label="View Details">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 100,
    }),
  ];

  const filterFields = useMemo<FilterFieldConfig[]>(
    () => [
      {
        key: 'name',
        label: 'Lead Name',
        type: 'text',
        placeholder: 'Filter by name...',
      },
      {
        key: 'source',
        label: 'Source',
        type: 'select',
        placeholder: 'Filter by source...',
        options: [
          { label: 'Facebook Ad', value: 'Facebook Ad' },
          { label: 'Google Search', value: 'Google Search' },
          { label: 'Website Form', value: 'Website Form' },
          { label: 'Referral', value: 'Referral' },
          { label: 'LinkedIn', value: 'LinkedIn' },
        ],
        searchable: true,
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    const filtered = [...interestedLeadsData];
    // Simple filter application can be added here if needed,
    // for now using mock data directly
    return filtered;
  }, []);

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
      }}
    >
      <div className="w-full space-y-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            className="h-8 w-full sm:w-60"
            value={(table.getState().globalFilter ?? '') as string}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search leads..."
            type="text"
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
