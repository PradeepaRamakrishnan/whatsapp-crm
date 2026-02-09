'use client';

import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { CheckCircle2, Info, Mail, MessageSquare, Phone, User, XCircle, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getManualFollowupById, getManualFollowups } from '../services';
import type { ManualFollowupCase, ManualFollowupsResponse } from '../types';

export function ManualFollowupTable() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlSearch = searchParams.get('search') || '';

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: pageSize,
  });

  const [globalFilter, setGlobalFilter] = useState(urlSearch);

  const { data: followupsResponse, isLoading } = useQuery<ManualFollowupsResponse>({
    queryKey: ['manual-followups', { page, limit: pageSize, search: urlSearch }],
    queryFn: () => getManualFollowups(page, pageSize, urlSearch || undefined),
  });

  const { data: followupDetails, isLoading: isDetailsLoading } = useQuery<ManualFollowupCase>({
    queryKey: ['manual-followup', selectedId],
    queryFn: () => getManualFollowupById(selectedId!),
    enabled: !!selectedId,
  });

  const columnHelper = createColumnHelper<ManualFollowupCase>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('fileContent.customerName', {
        id: 'customerName',
        header: 'Customer Name',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.fileContent?.customerName || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('fileContent.emailId', {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.fileContent?.emailId || '-'}</span>
        ),
      }),
      columnHelper.accessor('fileContent.mobileNumber', {
        id: 'mobileNumber',
        header: 'Mobile Number',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.fileContent?.mobileNumber || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('reason', {
        id: 'reason',
        header: 'Reason',
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.reason}</span>,
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === 'pending'
                  ? 'outline'
                  : status === 'in_progress'
                    ? 'secondary'
                    : 'default'
              }
            >
              {status.replace('_', ' ')}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {dayjs(row.original.createdAt).format('MMM DD, YYYY')}
          </span>
        ),
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: followupsResponse?.data || [],
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: followupsResponse?.meta?.totalPages || 0,
    onPaginationChange: (updater) => {
      const nextState = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(nextState);
      updateParams({
        page: nextState.pageIndex + 1,
        pageSize: nextState.pageSize,
      });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const updateParams = (params: { page?: number; pageSize?: number }) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (params.page) {
      currentParams.set('page', String(params.page));
    } else {
      currentParams.delete('page');
    }

    if (params.pageSize) {
      currentParams.set('pageSize', String(params.pageSize));
    } else {
      currentParams.delete('pageSize');
    }

    window.history.replaceState({}, '', `${window.location.pathname}?${currentParams.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-full sm:w-60"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder="Search manual followups..."
            type="text"
            aria-label="Search manual followups"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Label className="text-sm text-muted-foreground">Rows per page</Label>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(val) => {
              const size = Number(val) || 10;
              updateParams({ pageSize: size, page: 1 });
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

      <div className="overflow-hidden rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <Table>
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
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedId(row.original.id)}
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
                    No manual follow-up cases found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!isLoading && (
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="text-muted-foreground flex-1 text-sm">
            Showing{' '}
            {followupsResponse?.data?.length ? pagination.pageIndex * pagination.pageSize + 1 : 0}{' '}
            to{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              followupsResponse?.meta?.total || 0,
            )}{' '}
            of {followupsResponse?.meta?.total || 0} results
          </div>
          <div className="space-x-2 flex items-center">
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
      )}

      {/* Enhanced Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="flex flex-col sm:max-w-xl ">
          {isDetailsLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : followupDetails ? (
            <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
              {/* Header Section */}
              <SheetHeader className="px-6 pt-6 pb-4 space-y-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                      {followupDetails.fileContent?.customerName}
                    </SheetTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {followupDetails.fileContent?.emailId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {followupDetails.fileContent?.mobileNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Content Section */}
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="space-y-6 p-6">
                  {/* Reason & Notes Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50  tracking-wide">
                        Follow-up Details
                      </h3>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400  tracking-wide">
                          Primary Reason
                        </span>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {followupDetails.reason}
                        </p>
                      </div>
                      {followupDetails.notes && (
                        <>
                          <div className="border-t border-slate-100 dark:border-slate-700" />
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400  tracking-wide">
                              Agent Notes
                            </span>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {followupDetails.notes}
                            </p>
                          </div>
                        </>
                      )}
                      <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                        Created {dayjs(followupDetails.createdAt).format('MMM DD, YYYY')}
                      </div>
                    </div>
                  </div>

                  {/* Campaign History Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50  tracking-wide">
                        Campaign History
                      </h3>
                    </div>

                    {followupDetails.campaignHistory &&
                    followupDetails.campaignHistory.length > 0 ? (
                      <div className="space-y-4">
                        {followupDetails.campaignHistory.map((history, idx) => (
                          <div
                            key={idx as number}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* Campaign Header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 border-b border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                                    {history.name}
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    Created{' '}
                                    {dayjs(history.createdAt).format('MMM DD, YYYY hh:mm A')}
                                  </p>
                                </div>
                                <Badge
                                  variant={history.status === 'running' ? 'default' : 'secondary'}
                                  className="capitalize"
                                >
                                  {history.status}
                                </Badge>
                              </div>
                            </div>

                            {/* Channel Details Grid */}
                            <div className="p-4 space-y-3">
                              {/* Email Channel */}
                              <ChannelCard
                                icon={Mail}
                                title="Email"
                                color="blue"
                                details={{
                                  sent: history.email?.sent || false,
                                  sentAt: history.email?.sentAt,
                                  deliveredAt: history.email?.deliveredAt,
                                  bounced: history.email?.bounced || false,
                                  bouncedAt: history.email?.bouncedAt,
                                }}
                              />

                              {/* SMS Channel */}
                              <ChannelCard
                                icon={MessageSquare}
                                title="SMS"
                                color="green"
                                details={{
                                  sent: history.sms?.sent || false,
                                  sentAt: history.sms?.sentAt,
                                  deliveredAt: history.sms?.deliveredAt,
                                  bounced: history.sms?.bounced || false,
                                  bouncedAt: history.sms?.bouncedAt,
                                }}
                              />

                              {/* WhatsApp Channel */}
                              <ChannelCard
                                icon={Phone}
                                title="WhatsApp"
                                color="emerald"
                                details={{
                                  sent: history.whatsapp?.sent || false,
                                  sentAt: history.whatsapp?.sentAt,
                                  deliveredAt: history.whatsapp?.deliveredAt,
                                  bounced: history.whatsapp?.bounced || false,
                                  bouncedAt: history.whatsapp?.bouncedAt,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-center text-sm text-slate-600 dark:text-slate-400">
                        No campaign history available
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Failed to load details.
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Channel Card Component
function ChannelCard({
  icon: Icon,
  title,
  color,
  details,
}: {
  icon: any;
  title: string;
  color: 'blue' | 'green' | 'emerald';
  details: {
    sent: boolean;
    sentAt?: string;
    deliveredAt?: string;
    bounced: boolean;
    bouncedAt?: string;
  };
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/40',
      statusBg: 'bg-blue-100/50 dark:bg-blue-900/30',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-100 dark:border-green-900/40',
      statusBg: 'bg-green-100/50 dark:bg-green-900/30',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      statusBg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
    },
  };

  const colors = colorMap[color];
  const isBounced = details.bounced;
  const isDelivered = details.deliveredAt && !isBounced;
  const isSent = details.sent && !isBounced;

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.statusBg} p-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`rounded-lg p-2 ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              {title} Channel
            </p>
            {details.sentAt && (
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                Sent: {dayjs(details.sentAt).format('MMM DD, YYYY hh:mm A')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-tight',
              isBounced
                ? 'text-red-600 dark:text-red-400'
                : isSent
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-500 dark:text-slate-500',
            )}
          >
            {isBounced ? 'Failed' : isSent ? 'Sent' : 'Not Sent'}
          </span>
          {isBounced ? (
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
          ) : isSent ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-slate-300 dark:text-slate-700 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Status Details */}
      {(isDelivered || isBounced) && (
        <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/50">
          {isDelivered && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 p-2">
              <p className="text-[10px] font-semibold text-green-700 dark:text-green-300 uppercase tracking-tight">
                Delivered
              </p>
              <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {dayjs(details.deliveredAt).format('MMM DD, hh:mm A')}
              </p>
            </div>
          )}
          {isBounced && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 p-2">
              <p className="text-[10px] font-semibold text-red-700 dark:text-red-300 uppercase tracking-tight">
                Failed
              </p>
              <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {dayjs(details.bouncedAt || details.sentAt).format('MMM DD, hh:mm A')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
