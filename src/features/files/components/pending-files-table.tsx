import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CheckCircle, MoreVertical, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import slugify from 'slugify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getAllFiles } from '../services';
import type { FileData, FileStatus, FilesResponse } from '../types/file.types';

const getStatusBadgeVariant = (status: FileStatus) => {
  const variants: Record<FileStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    uploaded: 'secondary',
    queued: 'outline',
    processing: 'default',
    pending_review: 'outline',
    reviewed: 'default',
    archived: 'secondary',
    failed: 'destructive',
  };
  return variants[status] || 'default';
};

const getStatusLabel = (status: FileStatus) => {
  const labels: Record<FileStatus, string> = {
    uploaded: 'Uploaded',
    queued: 'Queued',
    processing: 'Processing',
    pending_review: 'Pending Review',
    reviewed: 'Reviewed',
    archived: 'Archived',
    failed: 'Failed',
  };
  return labels[status] || status;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function PendingFilesTable() {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Fetch files data with React Query
  const { data: filesResponse } = useQuery<FilesResponse>({
    queryKey: ['files', { page: pagination.pageIndex + 1, limit: pagination.pageSize }],
    queryFn: () => getAllFiles(pagination.pageIndex + 1, pagination.pageSize),
    placeholderData: (previousData) => previousData,
  });

  const files = filesResponse?.data || [];

  // Filter only pending_review files
  const pendingFiles = useMemo(() => {
    return files.filter((file) => file.status === 'pending_review');
  }, [files]);

  // Apply global filter to pending files
  const filteredData = useMemo(() => {
    let filtered = [...pendingFiles];

    if (globalFilter) {
      filtered = filtered.filter((file) => {
        const searchStr = globalFilter.toLowerCase();
        return (
          file.name.toLowerCase().includes(searchStr) ||
          file.bankName.toLowerCase().includes(searchStr)
        );
      });
    }

    return filtered;
  }, [pendingFiles, globalFilter]);

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pagination.pageSize);

  const columnHelper = createColumnHelper<FileData>();

  // biome-ignore lint/suspicious/noExplicitAny: TanStack Table requires any for mixed column types
  const columns = useMemo<ColumnDef<FileData, any>[]>(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title="File Name" column={column} />,
        cell: ({ getValue }) => (
          <div className="font-medium max-w-75 truncate">{String(getValue() || '')}</div>
        ),
        meta: {
          headerTitle: 'File Name',
        },
        size: 280,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.accessor('bankName', {
        id: 'bankName',
        header: ({ column }) => <DataGridColumnHeader title="Bank Name" column={column} />,
        cell: ({ getValue }) => <div className="font-medium">{String(getValue() || '')}</div>,
        meta: {
          headerTitle: 'Bank Name',
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
        cell: ({ getValue }) => {
          const status = getValue() as FileStatus;
          return (
            <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
              {getStatusLabel(status)}
            </Badge>
          );
        },
        meta: {
          headerTitle: 'Status',
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: ({ column }) => <DataGridColumnHeader title="Uploaded At" column={column} />,
        cell: ({ getValue }) => {
          const date = getValue();
          return <div className="text-sm">{date ? formatDate(String(date)) : '-'}</div>;
        },
        meta: {
          headerTitle: 'Uploaded At',
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        enablePinning: true,
      }),
      columnHelper.display({
        id: 'actions',
        header: ({ column }) => <DataGridColumnHeader title="Actions" column={column} />,
        cell: ({ row }) => {
          const file = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const slug = slugify(file.name, { lower: true, strict: true });
                    router.push(`/files/${slug}/${file.id}`);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    // TODO: Implement delete functionality
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 120,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enablePinning: true,
      }),
    ],
    [columnHelper, router],
  );

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      setPagination(updater);
    },
    [],
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: totalPages,
    manualPagination: false,
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
      onRowClick={(file) => {
        const slug = slugify(file.name, { lower: true, strict: true });
        router.push(`/files/${slug}/${file.id}`);
      }}
      tableLayout={{
        rowBorder: true,
        headerBorder: true,
        width: 'fixed',
        columnsResizable: true,
        columnsPinnable: true,
      }}
    >
      <div className="w-full space-y-2.5">
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
