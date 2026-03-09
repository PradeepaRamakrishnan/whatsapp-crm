/** biome-ignore-all lint/a11y/useKeyWithClickEvents: cards handle click navigation */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: cards handle click navigation */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Search,
  Trash2,
  Zap,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import slugify from 'slugify';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MOCK_CAMPAIGNS_RESPONSE } from '../lib/mock-data';
import { deleteCampaign, getAllCampaigns } from '../services';
import type { CampaignData, CampaignStatus, CampaignsResponse } from '../types';

dayjs.extend(utc);

const statusConfig: Record<
  CampaignStatus,
  { label: string; icon: React.ElementType; className: string; dotClass: string }
> = {
  active: {
    label: 'Active',
    icon: PlayCircle,
    className:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  running: {
    label: 'Running',
    icon: Zap,
    className:
      'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  paused: {
    label: 'Paused',
    icon: PauseCircle,
    className:
      'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
    dotClass: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className:
      'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400',
    dotClass: 'bg-red-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className:
      'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
    dotClass: 'bg-slate-400',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className:
      'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400',
    dotClass: 'bg-orange-400',
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    className:
      'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
    dotClass: 'bg-slate-300',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Calendar,
    className:
      'text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400',
    dotClass: 'bg-violet-500',
  },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

function CampaignCardActions({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete campaign');
      console.error(error);
    },
  });

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
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
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">&quot;{name}&quot;</span>? This action cannot be
              undone and will permanently delete the campaign and its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
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

function CampaignCard({ campaign }: { campaign: CampaignData }) {
  const router = useRouter();
  const href = `/campaigns/${slugify(campaign.name, { lower: true })}/${campaign.id}`;

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md hover:border-border/80 hover:-translate-y-0.5"
      onClick={() => router.push(href)}
    >
      {/* Top row: name + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug truncate">{campaign.name}</h3>
        </div>
        <CampaignCardActions id={campaign.id} name={campaign.name} />
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>
      )}

      {/* Footer: status + dates */}
      <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
        <StatusBadge status={campaign.status} />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{dayjs.utc(campaign.createdAt).format('MMM D, YYYY')}</span>
        </div>
      </div>

      {/* Last run */}
      {campaign.lastRunAt && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-2">
          <Clock className="h-3 w-3 shrink-0" />
          <span>Last run {dayjs.utc(campaign.lastRunAt).format('MMM D, YYYY · HH:mm')}</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <div className="mb-3 rounded-full bg-muted p-4">
        <Zap className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">
        {hasSearch ? 'No campaigns match your search' : 'No campaigns yet'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        {hasSearch
          ? 'Try a different search term or clear the filter.'
          : 'Create your first campaign to start reaching out to contacts.'}
      </p>
    </div>
  );
}

export function CampaignsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(() => searchParams.get('search') || '');

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 12;

  const updateParams = React.useCallback(
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

  // Debounce search input
  React.useEffect(() => {
    const id = setTimeout(() => {
      const current = searchParams.get('search') || '';
      if (search !== current) updateParams({ search });
    }, 400);
    return () => clearTimeout(id);
  }, [search, searchParams, updateParams]);

  const { data: campaignsResponse, isLoading } = useQuery<CampaignsResponse>({
    queryKey: ['campaigns', { page, limit: pageSize, search: searchParams.get('search') }],
    queryFn: () => getAllCampaigns(page, pageSize, searchParams.get('search') || undefined),
    placeholderData: (previousData) => previousData,
    select: (data) => (data.meta.total === 0 ? MOCK_CAMPAIGNS_RESPONSE : data),
  });

  const campaigns = campaignsResponse?.data || [];
  const totalRecords = campaignsResponse?.meta.total || 0;
  const totalPages = campaignsResponse?.meta.totalPages || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => updateParams({ pageSize: Number(val) || 12, page: 1 })}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState hasSearch={!!search} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {totalRecords > 0 ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, totalRecords)} of {totalRecords} campaigns
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-1">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
