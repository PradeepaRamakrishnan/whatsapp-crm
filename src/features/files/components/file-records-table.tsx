'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Calendar, CheckCircle, Copy, Mail, Pencil, Phone, Trash2, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFileById } from '../services';
import type { FileRecord } from '../types/file.types';
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

  const columns: ColumnDef<FileRecord>[] = [
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('customerName')}</div>,
    },
    {
      accessorKey: 'emailId',
      header: 'Email',
      cell: ({ row }) => <div className="text-sm">{row.getValue('emailId')}</div>,
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
  const filter = searchParams.get('filter') || 'all';

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
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const {
    data: fileData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['file', fileId, { page, limit: pageSize, filter }],
    queryFn: () => getFileById(fileId, page, pageSize, filter),
    placeholderData: (previousData) => previousData,
  });

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
          <Select
            value={filter}
            onValueChange={(val) => {
              updateParams({ filter: val });
            }}
          >
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
                  className="cursor-pointer"
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

      <Sheet open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span>{selectedRecord?.customerName}</span>
            </SheetTitle>
            <SheetDescription>Customer record details</SheetDescription>
          </SheetHeader>

          {selectedRecord && (
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium">{selectedRecord.emailId || '-'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">{selectedRecord.mobileNumber || '-'}</p>
                </div>
              </div>

              {selectedRecord.campaigns && selectedRecord.campaigns.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-4 text-sm font-semibold">Campaigns</h4>
                    <div className="space-y-4">
                      {selectedRecord.campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="rounded-lg border p-4 dark:border-slate-700"
                        >
                          {/* Campaign Name */}
                          <p className="font-semibold text-base mb-4">{campaign.name}</p>

                          {/* Created At */}
                          {campaign.lastRun && (
                            <div className="mb-4 flex items-center gap-2 rounded-md bg-muted/50 p-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <div className="text-xs">
                                <p className="font-medium text-muted-foreground">Created At</p>
                                <p className="font-medium">
                                  {dayjs(campaign.lastRun).format('MMM DD, YYYY hh:mm A')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Campaign Status */}
                          {campaign.channels && (
                            <div className="mb-4">
                              <p className="mb-3 text-sm font-medium text-muted-foreground">
                                Campaign Status
                              </p>
                              <div className="space-y-2">
                                {/* Email */}
                                {campaign.channels.email && (
                                  <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                                    <div className="flex items-center gap-3">
                                      <Mail className="h-4 w-4 text-blue-600" />
                                      <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-xs text-muted-foreground">
                                          {campaign.channels.email.sentAt
                                            ? dayjs(campaign.channels.email.sentAt).format(
                                                'MMM DD, YYYY hh:mm A',
                                              )
                                            : '-'}
                                        </p>
                                      </div>
                                    </div>
                                    {campaign.channels.email.sent && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                )}

                                {/* SMS */}
                                {campaign.channels.sms && (
                                  <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                                    <div className="flex items-center gap-3">
                                      <Copy className="h-4 w-4 text-green-600" />
                                      <div>
                                        <p className="text-sm font-medium">SMS</p>
                                        <p className="text-xs text-muted-foreground">
                                          {campaign.channels.sms.sentAt
                                            ? dayjs(campaign.channels.sms.sentAt).format(
                                                'MMM DD, YYYY hh:mm A',
                                              )
                                            : '-'}
                                        </p>
                                      </div>
                                    </div>
                                    {campaign.channels.sms.sent && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                )}

                                {/* WhatsApp */}
                                {campaign.channels.whatsapp && (
                                  <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                                    <div className="flex items-center gap-3">
                                      <Phone className="h-4 w-4 text-green-600" />
                                      <div>
                                        <p className="text-sm font-medium">WhatsApp</p>
                                        <p className="text-xs text-muted-foreground">
                                          {campaign.channels.whatsapp.sentAt
                                            ? dayjs(campaign.channels.whatsapp.sentAt).format(
                                                'MMM DD, YYYY hh:mm A',
                                              )
                                            : '-'}
                                        </p>
                                      </div>
                                    </div>
                                    {campaign.channels.whatsapp.sent && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Response Status */}
                          {campaign.responseStatus && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-muted-foreground">
                                Response Status
                              </p>
                              <Badge
                                className={`text-xs ${
                                  campaign.responseStatus === 'interested'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {campaign.responseStatus.charAt(0).toUpperCase() +
                                  campaign.responseStatus.slice(1)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedRecord.additionalData &&
                Object.keys(selectedRecord.additionalData).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-3 text-sm font-semibold">Additional Information</h4>
                      <div className="grid gap-2">
                        {Object.entries(selectedRecord.additionalData).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                          >
                            <span className="text-xs font-medium capitalize text-muted-foreground">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <FileRecordEdit
        key={recordToEdit?.id || 'none'}
        fileId={fileId}
        record={recordToEdit}
        onOpenChange={(open) => !open && setRecordToEdit(null)}
      />
    </div>
  );
}
