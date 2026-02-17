'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import { useEffect } from 'react';
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
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { deleteFileRecord, getFileById } from '../services';
import { useFileFilterStore } from '../store/file-filter-store';
import type { FileRecord } from '../types/file.types';
import { FileRecordDetailsSheet } from './file-record-details-sheet';
import { FileRecordEdit } from './file-record-edit';

interface FileRecordsTableProps {
  fileId: string;
}

export function FileRecordsTable({ fileId }: FileRecordsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRecord, setSelectedRecord] = React.useState<FileRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = React.useState<FileRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = React.useState<FileRecord | null>(null);

  // console.log(selectedRecord, 'data')

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteFileRecord(fileId, recordToDelete?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      setRecordToDelete(null);
      toast.success('Record deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });

  const columns: ColumnDef<FileRecord>[] = [
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('customerName')}</div>,
    },
    {
      accessorKey: 'emailId',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue('emailId')}</div>
      ),
    },
    {
      accessorKey: 'mobileNumber',
      header: 'Mobile No.',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue('mobileNumber')}</div>
      ),
    },
    {
      accessorKey: 'settlementAmount',
      header: 'Settlement Amount',
      cell: ({ row }) => {
        const amount = row.getValue('settlementAmount') as number;
        return <div className="font-medium">₹{Number(amount).toLocaleString('en-IN')}</div>;
      },
    },
    {
      id: 'campaigns',
      header: 'Campaigns',
      cell: ({ row }) => {
        const campaigns = row.original.campaigns || [];
        if (campaigns.length === 0) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <Copy className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">
                    {campaigns.length} campaign{campaigns.length > 1 ? 's' : ''}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="text-xs font-semibold">Used in campaigns:</p>
                  {campaigns.map((campaign) => (
                    <p key={campaign.id} className="text-xs">
                      • {campaign.name}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
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
              setRecordToEdit(row.original);
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
              setRecordToDelete(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlFilter = searchParams.get('filter') || 'all';
  const { filter: storeFilter, setFilter: setStoreFilter } = useFileFilterStore();

  const updateParams = React.useCallback(
    (updates: { page?: number; pageSize?: number; filter?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) {
        params.set('page', String(updates.page));
      }
      if (updates.pageSize !== undefined) {
        params.set('pageSize', String(updates.pageSize));
      }
      if (updates.filter !== undefined) {
        if (updates.filter === 'all') {
          params.delete('filter');
        } else {
          params.set('filter', updates.filter);
        }
        params.set('page', '1'); // Reset to page 1 on filter change
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Sync URL to Store (for highlighting external components)
  useEffect(() => {
    if (urlFilter !== storeFilter) {
      setStoreFilter(urlFilter);
    }
  }, [urlFilter, storeFilter, setStoreFilter]);

  const {
    data: fileData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['file', fileId, { page, limit: pageSize, filter: urlFilter }],
    queryFn: () => getFileById(fileId, page, pageSize, urlFilter),
    placeholderData: (previousData) => previousData,
  });

  // console.log(fileData, 'filedata')

  const showLoading = isLoading || (isFetching && !fileData);

  const records = fileData?.contents.data || [];
  const totalRecords = fileData?.contents.meta.total || 0;
  const totalPages = fileData?.contents.meta.totalPages || 0;

  // console.log(records, 'records');

  const table = useReactTable({
    data: records,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex flex-1 items-center gap-3">
          <Input
            placeholder="Search records..."
            value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('customerName')?.setFilterValue(event.target.value)
            }
            className="max-w-sm w-full"
            disabled={showLoading}
          />
          <Select value={urlFilter} onValueChange={(val) => updateParams({ filter: val })}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Records" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Records</SelectItem>
              <SelectItem value="invalid">Invalid Records</SelectItem>
              <SelectItem value="duplicate_email">Duplicates</SelectItem>
              <SelectItem value="excluded">Excluded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="rowsPerPage" className="text-sm text-muted-foreground">
            Rows per page
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              const v = Number(val) || 10;
              updateParams({ pageSize: v, page: 1 });
            }}
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
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
            {showLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading records...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer ${row.original.isExcluded ? 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30' : ''}`}
                  onClick={() => setSelectedRecord(row.original)}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} of{' '}
          {totalRecords} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
      <FileRecordDetailsSheet
        record={selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      />

      <FileRecordEdit
        key={recordToEdit?.id || 'none'}
        fileId={fileId}
        record={recordToEdit}
        onOpenChange={(open) => !open && setRecordToEdit(null)}
      />

      <AlertDialog
        open={!!recordToDelete}
        onOpenChange={(open) => !open && setRecordToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for &quot;{recordToDelete?.customerName}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
