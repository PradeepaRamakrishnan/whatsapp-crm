/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useQuery } from '@tanstack/react-query';
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
import { Mail, Phone, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCompaignById } from '../services';
import type { Lead, LeadsResponse } from '../types';
import { ContactDetailsPage } from './contact-detail';
import { LeadDocuments } from './lead-documents';

interface LeadDetailsPageProps {
  leadId: string;
}

export function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const { data: leadResponse, isLoading } = useQuery({
    queryKey: ['campaign', leadId],
    queryFn: () => getCompaignById(leadId),
  });

  // Support both paginated shape (LeadsResponse) and plain array response
  const leads: Lead[] = ((leadResponse as LeadsResponse)?.data as Lead[] | undefined) || [];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const columnHelper = createColumnHelper<Lead>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('customerName', {
        header: 'Name',
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor('fileContent.emailId', {
        header: 'Email',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('fileContent.mobileNumber', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      }),
      // columnHelper.accessor('campaign.name', {
      //   header: 'Campaign',
      //   cell: (info) => info.getValue() || '-',
      // }),
      columnHelper.accessor('fileContent.settlementAmount', {
        header: 'Amount',
        cell: (info) => (info.getValue() ? `₹${info.getValue()?.toLocaleString('en-IN')}` : '₹0'),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <Badge
              variant="outline"
              className="capitalize text-xs font-medium px-2 py-1 border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
            >
              Consent
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="capitalize text-xs font-medium px-2 py-1 border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
            >
              Interested
            </Badge>
          ),
      }),
      columnHelper.accessor('interestedAt', {
        header: 'Interested At',
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '-',
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Simple filter logic for client-side filtering
    filterFns: {
      fuzzy: (row, columnId, value, addMeta) => {
        const itemRank = row.getValue(columnId);
        if (typeof itemRank === 'string') {
          return itemRank.toLowerCase().includes(value.toLowerCase());
        }
        return false;
      },
    },
    globalFilterFn: (row, filterValue) => {
      const searchTerm = filterValue.toLowerCase();
      const customerName = row.original.customerName?.toLowerCase() || '';
      const campaignName = row.original.campaign?.name?.toLowerCase() || '';
      const status = row.original.status?.toLowerCase() || '';
      return (
        customerName.includes(searchTerm) ||
        campaignName.includes(searchTerm) ||
        status.includes(searchTerm)
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
        Lead not found.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6  p-6 min-w-0">
      {(() => {
        const campaign = leads[0]?.campaign;
        if (!campaign) return null;

        const createdDate = campaign.createdAt
          ? new Date(campaign.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '-';

        return (
          <div className="space-y-4">
            <div className="flex flex-col  sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span>Created {createdDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>ID: {campaign.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
          <div className="flex flex-1 items-center gap-2">
            <Input
              className="h-8 w-full sm:w-60"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search leads..."
              type="text"
              aria-label="Search leads"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Label className="text-sm text-muted-foreground">Rows per page</Label>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) => {
                table.setPageSize(Number(val));
              }}
            >
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
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
                    onClick={() => {
                      setSelectedLead(row.original);
                      setIsSheetOpen(true);
                    }}
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
      </div>

      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing{' '}
          {table.getFilteredRowModel().rows.length
            ? pagination.pageIndex * pagination.pageSize + 1
            : 0}{' '}
          to{' '}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
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

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setSelectedLead(null);
        }}
      >
        <SheetContent className="flex flex-col sm:max-w-4xl">
          <SheetHeader className="border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl font-bold tracking-tight">
                  {selectedLead?.customerName || 'Lead Details'}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    <span className="truncate font-medium">
                      {selectedLead?.fileContent?.emailId || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-green-500" />
                    <span className="truncate font-medium">
                      {selectedLead?.fileContent?.mobileNumber || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SheetHeader>

          {selectedLead && (
            <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden mt-2">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                {/* <TabsTrigger value="documents">Documents</TabsTrigger> */}
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
                <ContactDetailsPage contact={selectedLead} />
              </TabsContent>

              <TabsContent value="documents" className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
                <LeadDocuments
                  leadId={selectedLead.id}
                  campaignId={selectedLead.campaign?.id}
                  contactId={selectedLead.contact?.id}
                  initialDocuments={selectedLead.documents}
                />
              </TabsContent>

              <TabsContent
                value="conversation"
                className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0"
              >
                {selectedLead.campaign?.id && selectedLead.contact?.id && (
                  <CampaignConversation
                    campaignId={selectedLead.campaign.id}
                    contactId={selectedLead.contact.id}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
