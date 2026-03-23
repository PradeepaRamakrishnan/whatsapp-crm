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
import { Mail, MessageCircle, MessageSquare, Phone, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import { CampaignContactDetailsSheet } from '@/components/shared/campaign-contact-details-sheet';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCampaignContacts } from '../services';
import type {
  CallingStatus,
  CampaignContactData,
  CampaignContactsResponse,
  ChannelStatus,
} from '../types';

const RESPONSE_STYLES: Record<string, string> = {
  interested: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  not_interested: 'text-rose-700 bg-rose-50 border-rose-200',
  no_response: 'text-slate-600 bg-slate-50 border-slate-200',
};

function ResponseBadge({ status }: { status: string | null }) {
  const key = status ?? 'no_response';
  const cls = RESPONSE_STYLES[key] ?? RESPONSE_STYLES.no_response;
  const label =
    key === 'interested'
      ? 'Interested'
      : key === 'not_interested'
        ? 'Not Interested'
        : 'No Response';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function ChannelIcon({
  icon: Icon,
  label,
  data,
  sentColor,
  pendingColor,
}: {
  icon: React.ElementType;
  label: string;
  data: ChannelStatus | CallingStatus;
  sentColor: string;
  pendingColor: string;
}) {
  const sent = data.sent;
  const sentAt = data.sentAt ? dayjs(data.sentAt).format('MMM DD, hh:mm A') : null;
  const deliveredAt =
    'deliveredAt' in data && data.deliveredAt
      ? dayjs(data.deliveredAt).format('MMM DD, hh:mm A')
      : null;
  const readAt =
    'readAt' in data && data.readAt ? dayjs(data.readAt).format('MMM DD, hh:mm A') : null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className={`cursor-default ${sent ? sentColor : pendingColor}`}>
          <Icon className="h-4 w-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs space-y-0.5">
        <p className="font-semibold">{label}</p>
        {sentAt ? (
          <p className="text-muted-foreground">Sent: {sentAt}</p>
        ) : (
          <p className="text-muted-foreground">Not sent yet</p>
        )}
        {deliveredAt && <p className="text-emerald-400">Delivered: {deliveredAt}</p>}
        {readAt && <p className="text-blue-400">Read: {readAt}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

export const columns: ColumnDef<CampaignContactData>[] = [
  {
    accessorKey: 'contact.customerName',
    header: 'Customer Name',
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.contact.customerName}</span>
    ),
  },
  {
    accessorKey: 'contact.mobileNumber',
    header: 'Mobile Number',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.contact.mobileNumber || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'contact.emailId',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.contact.emailId || '—'}</span>
    ),
  },
  {
    accessorKey: 'responseStatus',
    header: 'Response Status',
    cell: ({ row }) => <ResponseBadge status={row.original.responseStatus} />,
  },
  {
    id: 'channels',
    header: 'Channels',
    cell: ({ row }) => {
      const c = row.original;
      return (
        <TooltipProvider delay={100}>
          <div className="flex items-center gap-2.5">
            <ChannelIcon
              icon={Mail}
              label="Email"
              data={c.email}
              sentColor="text-blue-500"
              pendingColor="text-muted-foreground/40"
            />
            <ChannelIcon
              icon={MessageSquare}
              label="SMS"
              data={c.sms}
              sentColor="text-rose-500"
              pendingColor="text-muted-foreground/40"
            />
            <ChannelIcon
              icon={MessageCircle}
              label="WhatsApp"
              data={c.whatsapp}
              sentColor="text-emerald-500"
              pendingColor="text-muted-foreground/40"
            />
            <ChannelIcon
              icon={Phone}
              label="Call"
              data={c.calling}
              sentColor="text-violet-500"
              pendingColor="text-muted-foreground/40"
            />
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {dayjs(row.original.createdAt).format('DD MMM YYYY')}
      </span>
    ),
  },
];

interface CampaignContactsTableProps {
  campaignId: string;
  campaignStatus?: string;
}

export function CampaignContactsTable({ campaignId, campaignStatus }: CampaignContactsTableProps) {
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
    refetchInterval: () => {
      const status = campaignStatus?.toLowerCase();
      return status === 'running' || status === 'pending' ? 30000 : false;
    },
    refetchOnWindowFocus: false,
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

  const handlePageSizeChange = (newPageSize: string | null) => {
    if (newPageSize) updateParams({ page: 1, pageSize: Number(newPageSize) });
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
    <div className="w-full space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search contacts…"
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-8 max-w-sm text-xs h-8"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground">Show</span>
          <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
            <SelectTrigger size="sm" className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[11px] font-semibold uppercase tracking-wider py-2.5"
                  >
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
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedContact(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center text-xs text-muted-foreground"
                >
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          {totalRecords > 0 ? (page - 1) * pageSize + 1 : 0}–
          {Math.min(page * pageSize, totalRecords)} of {totalRecords} contacts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-1">
            {page} / {totalPages || 1}
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

      <CampaignContactDetailsSheet
        campaignId={campaignId}
        selectedContact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </div>
  );
}
