/** biome-ignore-all lint/a11y/useButtonType: <> */
'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CheckCircle2, EllipsisIcon, Phone, PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
// import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import type { Filter } from '@/components/ui/filters';
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
import { type BorrowerData, borrowersData } from '../lib/data';

interface InterestedLeadsTableProps {
  campaignId?: number;
}

export function InterestedLeadsTable({ campaignId: _campaignId }: InterestedLeadsTableProps) {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters] = useState<Filter[]>([]);

  const columnHelper = createColumnHelper<BorrowerData>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ getValue, row }) => (
        <button
          onClick={() => router.push(`/leads/interested/${row.original.id}`)}
          className="font-medium text-primary hover:underline cursor-pointer"
        >
          {String(getValue() || '')}
        </button>
      ),
      size: 180,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || '')}</div>,
      size: 220,
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground">{String(getValue() || '')}</div>
      ),
      size: 150,
    }),
    columnHelper.accessor('loanAmount', {
      header: 'Amount',
      cell: ({ getValue }) => (
        <div className="font-medium">₹{getValue().toLocaleString('en-IN')}</div>
      ),
      size: 150,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('settlementCount', {
      header: 'Settlement Count',
      cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
      size: 150,
    }),
    columnHelper.display({
      id: 'email-status',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.contactStatus.email ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
      ),
      size: 80,
    }),
    columnHelper.display({
      id: 'sms-status',
      header: 'SMS',
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.contactStatus.sms && !row.original.dndStatus ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
      ),
      size: 80,
    }),
    columnHelper.display({
      id: 'whatsapp-status',
      header: 'WhatsApp',
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.contactStatus.whatsapp && !row.original.dndStatus ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
      ),
      size: 100,
    }),
    columnHelper.accessor('dndStatus', {
      header: 'DND',
      cell: ({ getValue }) => (
        <div className="flex justify-center">
          {getValue() ? (
            <PhoneOff className="h-4 w-4 text-red-600" />
          ) : (
            <Phone className="h-4 w-4 text-emerald-600" />
          )}
        </div>
      ),
      size: 80,
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
  ];

  // const filterFields = useMemo<FilterFieldConfig[]>(
  //   () => [
  //     {
  //       key: 'name',
  //       label: 'Name',
  //       type: 'text',
  //       placeholder: 'Filter by name...',
  //     },
  //     {
  //       key: 'email',
  //       label: 'Email',
  //       type: 'email',
  //       placeholder: 'Filter by email...',
  //     },
  //     {
  //       key: 'loanType',
  //       label: 'Loan Type',
  //       type: 'select',
  //       placeholder: 'Filter by loan type...',
  //       options: [
  //         { label: 'Personal Loan', value: 'Personal Loan' },
  //         { label: 'Business Loan', value: 'Business Loan' },
  //         { label: 'Home Loan', value: 'Home Loan' },
  //       ],
  //       searchable: true,
  //       className: 'w-[160px]',
  //     },
  //     {
  //       key: 'loanAmount',
  //       label: 'Loan Amount',
  //       type: 'number',
  //       placeholder: 'Filter by loan amount...',
  //     },
  //   ],
  //   [],
  // );

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

  // const handleFiltersChange = useCallback((filters: Filter[]) => {
  //   setFilters(filters);
  //   setPagination((prev) => ({
  //     ...prev,
  //     pageIndex: 0,
  //   }));
  // }, []);

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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-full sm:w-60"
            value={(table.getState().globalFilter ?? '') as string}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search borrowers..."
            type="text"
            aria-label="Search borrowers"
          />

          {/* <DataGridColumnVisibility
            table={table}
            trigger={
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                View
              </Button>
            }
          /> */}
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
        <Table className="[&_th]:px-6 [&_th]:py-3 [&_td]:px-6 [&_td]:py-2 [&_th]:font-normal [&_th]:bg-muted [&_td]:font-medium">
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
                <TableRow key={row.id} className="hover:bg-muted/50">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing {filteredData.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredData.length)} of{' '}
          {filteredData.length} results
        </div>
        <div className="space-x-2">
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
    </div>
  );
}
