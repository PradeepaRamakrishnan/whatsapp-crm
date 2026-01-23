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
import utc from 'dayjs/plugin/utc';
import {
  Calendar,
  CheckCircle2,
  IndianRupee,
  Mail,
  MessageSquare,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
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
import { getCampaignContacts } from '../services';
import type { CampaignContactData, CampaignContactsResponse } from '../types';

dayjs.extend(utc);

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    case 'processing':
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'failed':
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300';
    case 'interested':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'not_interested':
      return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
  }
};

const getResponseStatusColor = (responseStatus: 'interested' | 'not_interested' | null) => {
  if (responseStatus === 'interested') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
  }
  if (responseStatus === 'not_interested') {
    return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300';
  }
  return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
};

const formatResponseStatus = (responseStatus: 'interested' | 'not_interested' | null) => {
  if (responseStatus === null) return 'No Response';
  return responseStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const columns: ColumnDef<CampaignContactData>[] = [
  {
    accessorKey: 'contact.customerName',
    header: 'Customer Name',
    cell: ({ row }) => <div className="font-medium">{row.original.contact.customerName}</div>,
  },
  {
    accessorKey: 'contact.mobileNumber',
    header: 'Mobile Number',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.contact.mobileNumber}</div>
    ),
  },
  {
    accessorKey: 'contact.emailId',
    header: 'Email',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.contact.emailId}</div>
    ),
  },
  {
    accessorKey: 'contact.settlementAmount',
    header: 'Settlement Amount',
    cell: ({ row }) => (
      <div className="font-medium">
        ₹{row.original.contact.settlementAmount.toLocaleString('en-IN')}
      </div>
    ),
  },
  {
    accessorKey: 'responseStatus',
    header: 'Response Status',
    cell: ({ row }) => {
      const responseStatus: 'interested' | 'not_interested' | null = row.getValue('responseStatus');
      return (
        <Badge
          variant="outline"
          className={`font-medium ${getResponseStatusColor(responseStatus)}`}
        >
          {formatResponseStatus(responseStatus)}
        </Badge>
      );
    },
  },
  {
    id: 'channels',
    header: 'Channels',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.email.sent ? (
          <Mail className="h-4 w-4 text-blue-600" />
        ) : (
          <Mail className="h-4 w-4 text-gray-300" />
        )}
        {row.original.sms.sent ? (
          <MessageSquare className="h-4 w-4 text-green-600" />
        ) : (
          <MessageSquare className="h-4 w-4 text-gray-300" />
        )}
        {row.original.whatsapp.sent ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-gray-300" />
        )}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date: string = row.getValue('createdAt');
      return (
        <div className="text-sm text-muted-foreground">{dayjs(date).format('DD MMM YYYY')}</div>
      );
    },
  },
];

interface CampaignContactsTableProps {
  campaignId: string;
}

export function CampaignContactsTable({ campaignId }: CampaignContactsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [selectedContact, setSelectedContact] = React.useState<CampaignContactData | null>(null);

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const updateParams = React.useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) {
        params.set('page', String(updates.page));
      }
      if (updates.pageSize !== undefined) {
        params.set('pageSize', String(updates.pageSize));
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const { data: contactsResponse, isLoading } = useQuery<CampaignContactsResponse>({
    queryKey: ['campaign-contacts', campaignId, { page, limit: pageSize }],
    queryFn: () => getCampaignContacts(campaignId, page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const contacts = contactsResponse?.data || [];
  const totalRecords = contactsResponse?.meta.total || 0;
  const totalPages = contactsResponse?.meta.totalPages || 0;

  const table = useReactTable({
    data: contacts,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
  });

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    updateParams({ page: 1, pageSize: Number(newPageSize) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex-1">
          <Input
            placeholder="Search contacts..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="rowsPerPage" className="text-sm text-muted-foreground">
            Rows per page
          </label>
          <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer"
                  onClick={() => setSelectedContact(row.original)}
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
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing {totalRecords > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, totalRecords)} of {totalRecords} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
            disabled={page >= totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <Sheet open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span>{selectedContact?.contact.customerName}</span>
            </SheetTitle>
            <SheetDescription>Contact details and status</SheetDescription>
          </SheetHeader>

          {selectedContact && (
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                    <p className="truncate text-sm font-medium">
                      {selectedContact.contact.emailId || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-50 dark:bg-green-950/30">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Mobile Number</p>
                    <p className="text-sm font-medium">
                      {selectedContact.contact.mobileNumber || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 dark:bg-amber-950/30">
                    <IndianRupee className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Settlement Amount</p>
                    <p className="text-sm font-semibold">
                      ₹{Number(selectedContact.contact.settlementAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-950/30">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Created At</p>
                    <p className="text-sm font-medium">
                      {dayjs(selectedContact.createdAt).format('MMM DD, YYYY hh:mm A')}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 text-sm font-semibold">Campaign Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Processing Status
                    </span>
                    <Badge className={getStatusColor(selectedContact.status)} variant="secondary">
                      {selectedContact.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Response Status
                    </span>
                    <Badge
                      className={getResponseStatusColor(selectedContact.responseStatus)}
                      variant="secondary"
                    >
                      {formatResponseStatus(selectedContact.responseStatus)}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedContact.lead && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-sm font-semibold">Lead Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Lead Status
                        </span>
                        <Badge
                          className={getStatusColor(selectedContact.lead.status)}
                          variant="secondary"
                        >
                          {selectedContact.lead.status}
                        </Badge>
                      </div>
                      {selectedContact.lead.interestedAt && (
                        <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Interested At
                          </span>
                          <span className="text-xs font-medium text-right">
                            {dayjs(selectedContact.lead.interestedAt).format(
                              'MMM DD, YYYY hh:mm A',
                            )}
                          </span>
                        </div>
                      )}
                      {selectedContact.lead.consentGivenAt && (
                        <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Consent Given At
                          </span>
                          <span className="text-xs font-medium text-right">
                            {dayjs(selectedContact.lead.consentGivenAt).format(
                              'MMM DD, YYYY hh:mm A',
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h4 className="mb-3 text-sm font-semibold">Channel Status</h4>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Email</span>
                        {selectedContact.email.sent && selectedContact.email.sentAt && (
                          <span className="text-xs text-muted-foreground">
                            {dayjs(selectedContact.email.sentAt).format('MMM DD, YYYY hh:mm A')}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedContact.email.sent ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-muted-foreground">SMS</span>
                    </div>
                    {selectedContact.sms.sent ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
                    </div>
                    {selectedContact.whatsapp.sent ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 text-sm font-semibold">Timestamps</h4>
                <div className="space-y-2">
                  <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">Updated At</span>
                    <span className="text-xs font-medium text-right">
                      {dayjs(selectedContact.updatedAt).format('MMM DD, YYYY hh:mm A')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
