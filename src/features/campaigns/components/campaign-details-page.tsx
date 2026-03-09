'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Pause,
  Play,
  Send,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  getCampaignById,
  getCampaignTimeline,
  pauseCampaign,
  resumeCampaign,
  runCampaign,
} from '../services';
import type { CampaignStatus } from '../types';
import { CampaignContactsTable } from './campaign-contacts-table';

const statusConfig: Record<string, { label: string; dotClass: string; className: string }> = {
  active: {
    label: 'Ready to start',
    dotClass: 'bg-emerald-500',
    className:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400',
  },
  running: {
    label: 'Sending messages',
    dotClass: 'bg-blue-500 animate-pulse',
    className:
      'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400',
  },
  pending: {
    label: 'Retrieving recipients…',
    dotClass: 'bg-amber-400 animate-pulse',
    className:
      'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
  },
  scheduled: {
    label: 'Scheduled',
    dotClass: 'bg-violet-500',
    className:
      'text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-slate-400',
    className:
      'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-orange-400',
    className:
      'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400',
  },
  draft: {
    label: 'Draft',
    dotClass: 'bg-slate-300',
    className:
      'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
  },
  failed: {
    label: 'Failed',
    dotClass: 'bg-red-500',
    className:
      'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400',
  },
};

function StatusPill({ status }: { status: string }) {
  const cfg = statusConfig[status?.toLowerCase()] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
  bg,
  border,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${bg} ${border}`}>
      <div className="rounded-lg bg-white/60 dark:bg-white/10 p-1.5">
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className={`text-base font-semibold leading-none ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0">
      <SectionLabel>{label}</SectionLabel>
      <span className="text-xs font-medium text-right">{value || '—'}</span>
    </div>
  );
}

function ChannelSummaryRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  sent,
  failed,
  skipped,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  sent: number;
  failed: number;
  skipped: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3">
      <div className={`rounded-lg p-2 ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sent</p>
          <p className="text-sm font-bold text-emerald-600">{sent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Failed</p>
          <p className="text-sm font-bold text-red-600">{failed.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Skipped</p>
          <p className="text-sm font-bold text-amber-600">{skipped.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

interface CampaignDetailsPageProps {
  campaignId: string;
}

export function CampaignDetailsPage({ campaignId }: CampaignDetailsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaignById(campaignId),
    refetchInterval: (query) => {
      const status = query.state.data?.status?.toLowerCase();
      return status === 'running' || status === 'pending' ? 5000 : false;
    },
    refetchOnWindowFocus: false,
  });

  const { data: timelineResponse } = useQuery({
    queryKey: ['campaign-timeline', campaignId],
    queryFn: () => getCampaignTimeline(campaignId),
    refetchOnWindowFocus: false,
  });

  const runMutation = useMutation({
    mutationFn: () => runCampaign(campaignId),
    onSuccess: () => {
      toast.success('Campaign started successfully');
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: Error | AxiosError) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to run campaign'
          : 'Failed to run campaign';
      toast.error(message);
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => pauseCampaign(campaignId),
    onSuccess: () => {
      toast.success('Campaign paused');
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: Error | AxiosError) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to pause campaign'
          : 'Failed to pause campaign';
      toast.error(message);
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => resumeCampaign(campaignId),
    onSuccess: () => {
      toast.success('Campaign resumed');
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: Error | AxiosError) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to resume campaign'
          : 'Failed to resume campaign';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading campaign…
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-semibold">Campaign not found</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This campaign doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const timeline = timelineResponse?.data || [];
  const status = campaign.status as CampaignStatus;
  const interestedPct =
    campaign.totalContacts > 0 ? (campaign.interested / campaign.totalContacts) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-5 p-6 min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-lg font-semibold truncate">{campaign.name}</h1>
            <StatusPill status={campaign.status} />
          </div>
          {campaign.description && (
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              {campaign.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created{' '}
              {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {campaign.id}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {(status === 'active' || status === 'failed') && (
            <Button size="sm" onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
              {runMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {runMutation.isPending ? 'Starting…' : 'Run'}
            </Button>
          )}
          {status === 'running' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
            >
              {pauseMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
              {pauseMutation.isPending ? 'Pausing…' : 'Pause'}
            </Button>
          )}
          {status === 'paused' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
            >
              {resumeMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {resumeMutation.isPending ? 'Resuming…' : 'Resume'}
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            Report
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill
          icon={Users}
          label="Recipients"
          value={(campaign.totalContacts ?? 0).toLocaleString()}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-950/30"
          border="border-blue-100 dark:border-blue-900/30"
        />
        <StatPill
          icon={CheckCircle2}
          label="Interested"
          value={(campaign.interested ?? 0).toLocaleString()}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-950/30"
          border="border-emerald-100 dark:border-emerald-900/30"
        />
        <StatPill
          icon={TrendingUp}
          label="Response Rate"
          value={`${campaign.responseRate ?? 0}%`}
          color="text-violet-600"
          bg="bg-violet-50 dark:bg-violet-950/30"
          border="border-violet-100 dark:border-violet-900/30"
        />
        <StatPill
          icon={Mail}
          label="Conversion"
          value={`${interestedPct.toFixed(1)}%`}
          color="text-orange-600"
          bg="bg-orange-50 dark:bg-orange-950/30"
          border="border-orange-100 dark:border-orange-900/30"
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="border-b w-full bg-transparent p-0 h-auto rounded-none justify-start gap-1">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2 text-xs font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2 text-xs font-medium"
          >
            Recipients
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2 text-xs font-medium"
          >
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="mt-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Campaign Info */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-1.5">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Campaign Information</p>
                  <p className="text-[11px] text-muted-foreground">Core identity and status</p>
                </div>
              </div>
              <div>
                <InfoRow label="Name" value={campaign.name} />
                <InfoRow label="Description" value={campaign.description || '—'} />
                <InfoRow label="Status" value={<StatusPill status={campaign.status} />} />
                <InfoRow
                  label="Created"
                  value={new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              </div>
            </div>

            {/* File Information */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold">File Information</p>
                  <p className="text-[11px] text-muted-foreground">Source data and record health</p>
                </div>
              </div>
              {campaign.file && campaign.fileContentStats ? (
                <>
                  <InfoRow label="File Name" value={campaign.file.name} />
                  <InfoRow label="Bank" value={campaign.file.bankName?.toUpperCase()} />
                  <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
                    {[
                      {
                        label: 'Total',
                        value: campaign.fileContentStats.totalRecords ?? 0,
                        color: 'text-blue-600',
                        border: 'border-blue-400',
                      },
                      {
                        label: 'Invalid',
                        value: campaign.fileContentStats.invalidRecords ?? 0,
                        color: 'text-red-600',
                        border: 'border-red-400',
                      },
                      {
                        label: 'Dupes',
                        value: campaign.fileContentStats.duplicateRecords ?? 0,
                        color: 'text-amber-600',
                        border: 'border-amber-400',
                      },
                      {
                        label: 'Excluded',
                        value: campaign.fileContentStats.excludedRecords ?? 0,
                        color: 'text-slate-500',
                        border: 'border-slate-400',
                      },
                    ].map((s) => (
                      <div key={s.label} className={`border-l-2 pl-2.5 py-0.5 ${s.border}`}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                          {s.label}
                        </p>
                        <p className={`text-lg font-bold leading-none ${s.color}`}>
                          {s.value.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-xs text-muted-foreground">File info not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Summary */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-1.5">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold">Delivery Summary</p>
                <p className="text-[11px] text-muted-foreground">
                  Message delivery across all channels
                </p>
              </div>
            </div>

            {status === 'active' || status === 'pending' || status === 'draft' ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Summary available after campaign runs</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Click <strong>Run</strong> to start sending messages
                </p>
              </div>
            ) : campaign.executionSummary ? (
              <div className="space-y-2">
                <ChannelSummaryRow
                  icon={Mail}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50 dark:bg-blue-950/30"
                  label="Email"
                  sent={campaign.executionSummary.successful.email}
                  failed={campaign.executionSummary.failed.email}
                  skipped={
                    campaign.executionSummary.skipped.alreadySent.email +
                    campaign.executionSummary.skipped.notWhitelisted.email +
                    campaign.executionSummary.skipped.campaignPaused.email
                  }
                />
                <ChannelSummaryRow
                  icon={MessageCircle}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/30"
                  label="WhatsApp"
                  sent={campaign.executionSummary.successful.whatsapp}
                  failed={campaign.executionSummary.failed.whatsapp}
                  skipped={
                    campaign.executionSummary.skipped.alreadySent.whatsapp +
                    campaign.executionSummary.skipped.notWhitelisted.whatsapp +
                    campaign.executionSummary.skipped.campaignPaused.whatsapp
                  }
                />
                <ChannelSummaryRow
                  icon={MessageSquare}
                  iconColor="text-purple-600"
                  iconBg="bg-purple-50 dark:bg-purple-950/30"
                  label="SMS"
                  sent={campaign.executionSummary.successful.sms}
                  failed={campaign.executionSummary.failed.sms}
                  skipped={
                    campaign.executionSummary.skipped.alreadySent.sms +
                    campaign.executionSummary.skipped.notWhitelisted.sms +
                    campaign.executionSummary.skipped.campaignPaused.sms
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">No execution summary available</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Recipients Tab ── */}
        <TabsContent value="contacts" className="mt-4">
          <CampaignContactsTable campaignId={campaignId} campaignStatus={campaign.status} />
        </TabsContent>

        {/* ── Timeline Tab ── */}
        <TabsContent value="timeline" className="mt-5">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-1.5">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-semibold">Activity Timeline</p>
                <p className="text-[11px] text-muted-foreground">
                  Complete history of events and milestones
                </p>
              </div>
            </div>
            <div className="space-y-0">
              {timeline.length > 0 ? (
                [...timeline].reverse().map((item, idx) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          item.type === 'created' && 'bg-blue-100 dark:bg-blue-950',
                          item.type === 'sent' && 'bg-indigo-100 dark:bg-indigo-950',
                          item.type === 'milestone' && 'bg-emerald-100 dark:bg-emerald-950',
                          item.type === 'paused' && 'bg-orange-100 dark:bg-orange-950',
                          item.type === 'resumed' && 'bg-green-100 dark:bg-green-950',
                          item.category === 'status_change' && 'bg-purple-100 dark:bg-purple-950',
                        )}
                      >
                        {item.type === 'created' && <FileText className="h-3 w-3 text-blue-600" />}
                        {item.type === 'sent' && <Send className="h-3 w-3 text-indigo-600" />}
                        {item.type === 'milestone' && (
                          <Target className="h-3 w-3 text-emerald-600" />
                        )}
                        {item.type === 'paused' && <Pause className="h-3 w-3 text-orange-600" />}
                        {item.type === 'resumed' && <Play className="h-3 w-3 text-green-600" />}
                        {item.category === 'status_change' && item.type !== 'created' && (
                          <Activity className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                      {idx !== timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-snug">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-3">
                          {item.metadata.contactCount !== undefined && (
                            <span className="text-[11px] text-muted-foreground">
                              Contacts: {item.metadata.contactCount}
                            </span>
                          )}
                          {item.metadata.bankName && (
                            <span className="text-[11px] text-muted-foreground capitalize">
                              Bank: {item.metadata.bankName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-xs text-muted-foreground">No timeline events yet</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
