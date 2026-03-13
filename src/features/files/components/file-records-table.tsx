'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MinusCircle,
  Pencil,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
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
import { deleteFileRecord, getFileById } from '../services';
import { useFileFilterStore } from '../store/file-filter-store';
import type { FileRecord } from '../types/file.types';
import { FileRecordDetailsSheet } from './file-record-details-sheet';
import { FileRecordEdit } from './file-record-edit';

interface FileRecordsTableProps {
  fileId: string;
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonTableRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      {Array.from({ length: cols }, (_, i) => i).map((col) => (
        <td key={col} className="px-4 py-3">
          <div
            className="h-3.5 animate-pulse rounded bg-muted/60"
            style={{ width: `${60 + (col % 3) * 15}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function RecordStatusBadge({ isValid, isExcluded }: { isValid: boolean; isExcluded: boolean }) {
  if (isExcluded) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        <MinusCircle className="h-2.5 w-2.5" />
        Excluded
      </span>
    );
  }
  if (isValid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Valid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
      <XCircle className="h-2.5 w-2.5" />
      Invalid
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  filter,
  searchQuery,
  onClear,
}: {
  filter: string;
  searchQuery: string;
  onClear: () => void;
}) {
  const hasFilters = filter !== 'all' || searchQuery.length > 0;
  return (
    <tr>
      <td colSpan={4}>
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
            <AlertCircle className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-foreground/70">
              {hasFilters ? 'No records match your filters' : 'No contacts yet'}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">
              {hasFilters
                ? 'Try adjusting your search or filter.'
                : 'Add contacts using the button above.'}
            </p>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={onClear}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FileRecordsTable({ fileId }: FileRecordsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRecord, setSelectedRecord] = React.useState<FileRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = React.useState<FileRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = React.useState<FileRecord | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteFileRecord(fileId, recordToDelete?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      setRecordToDelete(null);
      toast.success('Record deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlFilter = searchParams.get('filter') || 'all';
  const { filter: storeFilter, setFilter: setStoreFilter } = useFileFilterStore();

  const updateParams = React.useCallback(
    (updates: { page?: number; pageSize?: number; filter?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
      if (updates.filter !== undefined) {
        if (updates.filter === 'all') params.delete('filter');
        else params.set('filter', updates.filter);
        params.set('page', '1');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  useEffect(() => {
    if (urlFilter !== storeFilter) setStoreFilter(urlFilter);
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

  const showLoading = isLoading || (isFetching && !fileData);
  const records = fileData?.contents.data || [];
  const totalRecords = fileData?.contents.meta.total || 0;
  const totalPages = fileData?.contents.meta.totalPages || 0;

  // Client-side name search
  const filteredRecords = React.useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.mobileNumber.includes(q) ||
        r.emailId?.toLowerCase().includes(q),
    );
  }, [records, searchQuery]);

  const hasFilters = urlFilter !== 'all' || searchQuery.length > 0;

  return (
    <div className="space-y-3">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search by name, phone or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
            disabled={showLoading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={urlFilter} onValueChange={(val) => updateParams({ filter: val })}>
            <SelectTrigger
              className={`h-9 w-[160px] text-sm ${urlFilter !== 'all' ? 'border-primary/40 bg-primary/5 text-primary' : ''}`}
            >
              <Filter
                className={`mr-1.5 h-3 w-3 ${urlFilter !== 'all' ? 'text-primary' : 'text-muted-foreground/50'}`}
              />
              <SelectValue placeholder="All Records" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Records</SelectItem>
              <SelectItem value="invalid">Invalid Only</SelectItem>
              <SelectItem value="duplicate_email">Duplicates</SelectItem>
              <SelectItem value="excluded">Excluded</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(val) => updateParams({ pageSize: Number(val) || 10, page: 1 })}
          >
            <SelectTrigger className="h-9 w-[100px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 15, 20, 25].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Customer
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Phone
                </th>
                <th className="hidden px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 md:table-cell">
                  Email
                </th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {showLoading ? (
                Array.from({ length: Math.min(pageSize, 5) }, (_, i) => i).map((n) => (
                  <SkeletonTableRow key={n} cols={5} />
                ))
              ) : filteredRecords.length === 0 ? (
                <EmptyState
                  filter={urlFilter}
                  searchQuery={searchQuery}
                  onClear={() => {
                    setSearchQuery('');
                    updateParams({ filter: 'all' });
                  }}
                />
              ) : (
                filteredRecords.map((record, i) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`group cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20 ${
                      record.isExcluded
                        ? 'bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20'
                        : !record.isValid
                          ? 'bg-red-50/20 hover:bg-red-50/40 dark:bg-red-950/10 dark:hover:bg-red-950/20'
                          : i % 2 !== 0
                            ? 'bg-muted/10'
                            : ''
                    }`}
                  >
                    {/* Customer name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground">
                          {record.customerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[12.5px] font-semibold leading-tight">
                          {record.customerName}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground">
                      {record.mobileNumber}
                    </td>

                    {/* Email */}
                    <td className="hidden px-4 py-3 text-[11.5px] text-muted-foreground/80 md:table-cell">
                      {record.emailId || <span className="text-muted-foreground/30">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <RecordStatusBadge isValid={record.isValid} isExcluded={record.isExcluded} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} role="none">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7  transition-opacity group-hover:opacity-100 hover:opacity-100"
                          onClick={() => setRecordToEdit(record)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive/60  transition-opacity group-hover:opacity-100 hover:opacity-100 hover:text-destructive"
                          onClick={() => setRecordToDelete(record)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!showLoading && totalRecords > 0 && (
          <div className="flex items-center justify-between gap-2 border-t border-border/40 bg-muted/20 px-4 py-2.5">
            <p className="text-[11px] text-muted-foreground/60 tabular-nums">
              {hasFilters ? `${filteredRecords.length.toLocaleString()} matching · ` : ''}
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRecords)} of{' '}
              {totalRecords.toLocaleString()} records
            </p>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && page > 3) p = page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="icon"
                      className="h-6 w-6 text-[11px]"
                      onClick={() => updateParams({ page: p })}
                    >
                      {p}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sheets & Dialogs ── */}
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
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
