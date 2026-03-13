/** biome-ignore-all lint/correctness/useExhaustiveDependencies: stable refs excluded intentionally */
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
import { Mail, MessageSquare, Phone, Search } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getCampaignContacts } from '../services';
import type { CampaignContactData, CampaignContactsResponse, ChannelOrderItem } from '../types';

// ─── Channel icon config ──────────────────────────────────────────────────────

type ContactChannelKey = 'email' | 'sms' | 'whatsapp' | 'calling';

const CHANNEL_CONFIG: Record<
  string,
  {
    sentClass: string;
    icon: (sent: boolean) => React.ReactNode;
  }
> = {
  email: {
    sentClass: 'text-blue-500',
    icon: (sent) => (
      <Mail className={`h-3.5 w-3.5 ${sent ? 'text-blue-500' : 'text-muted-foreground/30'}`} />
    ),
  },
  sms: {
    sentClass: 'text-emerald-500',
    icon: (sent) => (
      <MessageSquare
        className={`h-3.5 w-3.5 ${sent ? 'text-emerald-500' : 'text-muted-foreground/30'}`}
      />
    ),
  },
  whatsapp: {
    sentClass: 'text-green-500',
    icon: (sent) => (
      <svg
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 ${sent ? 'text-green-500' : 'text-muted-foreground/30'}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  calling: {
    sentClass: 'text-orange-500',
    icon: (sent) => (
      <Phone className={`h-3.5 w-3.5 ${sent ? 'text-orange-500' : 'text-muted-foreground/30'}`} />
    ),
  },
};

function formatDelay(ms: number): string {
  if (ms === 0) return 'Immediate';
  if (ms < 60_000) return `+${ms / 1000}s delay`;
  if (ms < 3_600_000) return `+${Math.round(ms / 60_000)}m delay`;
  return `+${Math.round(ms / 3_600_000)}h delay`;
}

function ChannelsCell({
  row,
  channelOrder,
}: {
  row: CampaignContactData;
  channelOrder: ChannelOrderItem[];
}) {
  const steps = channelOrder.filter((item) => item.enabled);

  if (steps.length === 0) return <span className="text-muted-foreground/40 text-xs">—</span>;

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((item, idx) => {
        const config = CHANNEL_CONFIG[item.channel];
        if (!config) return null;
        const contactChannel = row[item.channel as ContactChannelKey] as
          | { sent?: boolean; sentAt?: string | null }
          | undefined;
        const sent = contactChannel?.sent ?? false;
        const sentAt = contactChannel?.sentAt;

        const tooltipLines = [
          `${item.channel.charAt(0).toUpperCase()}${item.channel.slice(1)} · ${formatDelay(item.delayMs)}`,
          sent && sentAt ? `Sent ${dayjs(sentAt).format('DD MMM YYYY, hh:mm A')}` : 'Not sent',
        ];

        return (
          <Tooltip key={`${item.channel}-${idx}`}>
            <TooltipTrigger asChild>
              <span className="cursor-default">{config.icon(sent)}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex flex-col gap-0.5 text-center">
              {tooltipLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

// ─── Column factory ───────────────────────────────────────────────────────────

function buildColumns(channelOrder: ChannelOrderItem[]): ColumnDef<CampaignContactData>[] {
  return [
    {
      accessorKey: 'contact.customerName',
      header: 'Customer Name',
      cell: ({ row }) => <div className="font-medium">{row.original.contact.customerName}</div>,
    },
    {
      accessorKey: 'contact.mobileNumber',
      header: 'Mobile Number',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.contact.mobileNumber || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'contact.emailId',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.contact.emailId || '—'}</div>
      ),
    },
    {
      id: 'channels',
      header: 'Channels',
      cell: ({ row }) => <ChannelsCell row={row.original} channelOrder={channelOrder} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {dayjs(row.original.createdAt).format('DD MMM YYYY')}
        </div>
      ),
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
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
  const channelOrder = contactsResponse?.channelOrder ?? [];

  const columns = React.useMemo(() => buildColumns(channelOrder), [channelOrder]);

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
        channelOrder={channelOrder}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </div>
  );
}
