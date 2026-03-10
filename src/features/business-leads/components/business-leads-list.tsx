/** biome-ignore-all lint/a11y/useButtonType: table action buttons */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: table rows handle click navigation */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: table rows handle click navigation */
'use no memo';
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Loader2, Mail, MapPin, MoreHorizontal, Phone, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { deleteBusinessLead, getBusinessLeads } from '../services';
import type { BusinessLead } from '../types';

// ─── Row actions ──────────────────────────────────────────────────────────────

function LeadActions({ lead }: { lead: BusinessLead }) {
  const [open, setOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteBusinessLead(lead.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] });
      toast.success('Lead deleted successfully');
      setOpen(false);
    },
    onError: () => toast.error('Failed to delete lead'),
  });

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
              setIsDropdownOpen(false);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">&quot;{lead.name}&quot;</span>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                mutate();
              }}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

function LeadDetailSheet({ lead, onClose }: { lead: BusinessLead | null; onClose: () => void }) {
  return (
    <Sheet open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{lead?.name}</SheetTitle>
          <SheetDescription>
            <Badge variant="secondary">{lead?.type}</Badge>
          </SheetDescription>
        </SheetHeader>

        {lead && (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
            <div className="grid gap-3 text-sm">
              <DetailRow label="Phone">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
              <DetailRow label="Email">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
              <DetailRow label="Area">
                {lead.area || <span className="text-muted-foreground">—</span>}
              </DetailRow>
              <DetailRow label="City">
                {lead.city || <span className="text-muted-foreground">—</span>}
              </DetailRow>
              {lead.address && <DetailRow label="Address">{lead.address}</DetailRow>}
              {lead.notes && <DetailRow label="Notes">{lead.notes}</DetailRow>}
              <DetailRow label="Added">{dayjs(lead.createdAt).format('MMM DD, YYYY')}</DetailRow>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BusinessLeadsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlSearch = searchParams.get('search') || '';

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(urlSearch);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);

  const updateParams = useCallback(
    (updates: { page?: number; pageSize?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set('search', updates.search);
          params.set('page', '1');
        } else {
          params.delete('search');
        }
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      if (globalFilter === urlSearch) return;
      updateParams({ search: globalFilter });
    }, 500);
    return () => clearTimeout(id);
  }, [globalFilter, urlSearch, updateParams]);

  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ['business-leads', { page, limit: pageSize, search: urlSearch }],
    queryFn: () => getBusinessLeads({ page, limit: pageSize, search: urlSearch || undefined }),
  });

  const columnHelper = createColumnHelper<BusinessLead>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Company',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.area}</span>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="text-xs font-normal">
            {getValue()}
          </Badge>
        ),
        size: 140,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ getValue }) => {
          const email = getValue();
          return email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
        size: 200,
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ getValue }) => {
          const phone = getValue();
          return phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="h-3 w-3 shrink-0" />
              <span className="tabular-nums">{phone}</span>
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
        size: 150,
      }),
      columnHelper.accessor('city', {
        header: 'Location',
        cell: ({ row }) => (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {[row.original.city, row.original.area].filter(Boolean).join(', ') || '—'}
          </span>
        ),
        size: 160,
      }),
      columnHelper.accessor('notes', {
        header: 'Notes',
        cell: ({ getValue }) => {
          const notes = getValue();
          return notes ? (
            <span className="line-clamp-1 text-sm text-muted-foreground italic">{notes}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
        size: 180,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <LeadActions lead={row.original} />
          </div>
        ),
        size: 80,
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: leadsResponse?.data || [],
    state: { pagination, sorting },
    enableSorting: true,
    enableSortingRemoval: false,
    manualPagination: true,
    manualFiltering: true,
    pageCount: leadsResponse?.meta?.totalPages || 0,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(next);
      updateParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-full sm:w-60"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder="Search name, email, phone…"
            type="text"
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
              {[10, 20, 30, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild size="sm" className="h-8">
            <Link href="/business-leads/search">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Leads
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
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
                    onClick={() => setSelectedLead(row.original)}
                    className="cursor-pointer hover:bg-muted/50"
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
                    No business leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoading && (
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing{' '}
            {leadsResponse?.data?.length ? pagination.pageIndex * pagination.pageSize + 1 : 0} to{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              leadsResponse?.meta?.total || 0,
            )}{' '}
            of {leadsResponse?.meta?.total || 0} results
          </div>
          <div className="flex items-center space-x-2">
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

      {/* ── Detail sheet ── */}
      <LeadDetailSheet lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
