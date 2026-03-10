'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import slugify from 'slugify';
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
import { fetchFiles as getAllFiles } from '../services/client';
import type { FileData, FileStatus, FilesResponse } from '../types/file.types';
import { FileActions } from './file-actions';

dayjs.extend(utc);

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FileStatus, { label: string; dot: string; badge: string }> = {
  uploaded: {
    label: 'Uploaded',
    dot: 'bg-sky-500',
    badge:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/40',
  },
  queued: {
    label: 'Queued',
    dot: 'bg-slate-400',
    badge:
      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/40',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-violet-500 animate-pulse',
    badge:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/40',
  },
  pending_review: {
    label: 'Pending Review',
    dot: 'bg-amber-500',
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
  },
  reviewed: {
    label: 'Reviewed',
    dot: 'bg-emerald-500',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40',
  },
  archived: {
    label: 'Archived',
    dot: 'bg-zinc-400',
    badge:
      'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/40',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-rose-500',
    badge:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40',
  },
};

// ─── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border/40 px-4 py-3.5 last:border-0">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted/60" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3.5 w-40 animate-pulse rounded bg-muted/60" />
        <div className="h-2.5 w-28 animate-pulse rounded bg-muted/40" />
      </div>
      <div className="hidden h-5 w-24 animate-pulse rounded-full bg-muted/50 sm:block" />
      <div className="hidden h-2.5 w-24 animate-pulse rounded bg-muted/40 lg:block" />
      <div className="h-7 w-7 animate-pulse rounded bg-muted/40" />
    </div>
  );
}

// ─── File row ──────────────────────────────────────────────────────────────────

function FileRow({ file, onClick }: { file: FileData; onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[file.status] ?? STATUS_CONFIG.uploaded;
  const initials = file.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none"
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-[12px] font-bold text-primary ring-1 ring-primary/15 transition-all group-hover:bg-primary/12">
        {initials || <FileSpreadsheet className="h-4 w-4" />}
      </div>

      {/* Name + source */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold capitalize leading-tight text-foreground">
          {file.name}
        </p>
        {file.source ? (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground/70">
            <Building2 className="h-2.5 w-2.5 shrink-0" />
            <span className="capitalize">{file.source}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-[11px] text-muted-foreground/40">No source</p>
        )}
      </div>

      {/* Status */}
      <div className="hidden shrink-0 sm:flex">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusCfg.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Date */}
      <div className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground/60 lg:flex">
        <CalendarDays className="h-3 w-3" />
        {dayjs.utc(file.createdAt).format('MMM D, YYYY')}
      </div>

      {/* Actions */}
      <span className="shrink-0" onClick={(e) => e.stopPropagation()} role="none">
        <FileActions
          fileId={file.id}
          fileName={file.name}
          currentStatus={file.status}
          variant="dropdown"
        />
      </span>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FilesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nameFilter, setNameFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [sortField, setSortField] = React.useState<'name' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

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

  const { data: filesResponse, isLoading } = useQuery<FilesResponse>({
    queryKey: ['files', { page, limit: pageSize }],
    queryFn: () => getAllFiles(page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const allFiles = filesResponse?.data || [];
  const totalRecords = filesResponse?.meta.total ?? 0;
  const totalPages = filesResponse?.meta.totalPages || 0;

  const filtered = React.useMemo(() => {
    let rows = allFiles;
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      rows = rows.filter(
        (f) => f.name.toLowerCase().includes(q) || f.source.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((f) => f.status === statusFilter);
    }
    return [...rows].sort((a, b) => {
      const av = a[sortField] as string;
      const bv = b[sortField] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [allFiles, nameFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field: 'name' | 'createdAt') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const hasFilters = nameFilter.length > 0 || statusFilter !== 'all';

  return (
    <div className="space-y-3">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search by name or source…"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[155px] text-sm">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {(Object.keys(STATUS_CONFIG) as FileStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
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

      {/* ── List card ── */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        {/* Column header */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/40 bg-muted/30 px-4 py-2 sm:grid-cols-[1fr_160px_auto_auto]">
          <button
            type="button"
            onClick={() => toggleSort('name')}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors text-left"
          >
            Name / Source
            <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 sm:block">
            Status
          </span>
          <button
            type="button"
            onClick={() => toggleSort('createdAt')}
            className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors lg:flex"
          >
            Uploaded
            <ArrowUpDown className="h-2.5 w-2.5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60" />
        </div>

        {/* Rows */}
        {isLoading ? (
          Array.from({ length: Math.min(pageSize, 5) }, (_, i) => i).map((n) => (
            <SkeletonRow key={n} />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
              <AlertCircle className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-foreground/70">
                {hasFilters ? 'No lists match your filters' : 'No recipient lists found'}
              </p>
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => {
                    setNameFilter('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          filtered.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onClick={() =>
                router.push(`/files/${slugify(file.name, { lower: true })}/${file.id}`)
              }
            />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-[11.5px] text-muted-foreground/60 tabular-nums">
            {totalRecords > 0
              ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalRecords)} of ${totalRecords.toLocaleString()}`
              : 'No results'}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 text-xs"
                  onClick={() => updateParams({ page: p })}
                >
                  {p}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
