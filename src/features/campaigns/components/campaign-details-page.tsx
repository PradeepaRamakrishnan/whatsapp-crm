'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  MessageCircle,
  MessageCircleMore,
  MessageSquare,
  Pause,
  Play,
  Send,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  getCampaignById,
  getCampaignTimeline,
  pauseCampaign,
  resumeCampaign,
  runCampaign,
} from '../services';
import { CampaignContactsTable } from './campaign-contacts-table';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900';
    case 'running':
      return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900';
    case 'pending':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900';
    case 'scheduled':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900';
    case 'completed':
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900';
    case 'draft':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900';
    case 'paused':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-900';
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Retrieving recipients...';
    case 'active':
      return 'Ready to start';
    case 'running':
      return 'Sending messages';
    case 'completed':
      return 'Completed';
    case 'paused':
      return 'Paused';
    case 'scheduled':
      return 'Scheduled';
    case 'draft':
      return 'Draft';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
};

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

  // Fetch campaign details with React Query (prefetched on server)
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaignById(campaignId),
    refetchInterval: (query) => {
      // Refetch every 5 seconds if campaign is running or pending
      const campaignData = query.state.data;
      const status = campaignData?.status?.toLowerCase();
      return status === 'running' || status === 'pending' ? 5000 : false;
    },
    refetchOnWindowFocus: false,
  });

  // console.log('Campaign Details:', campaign);

  // Fetch campaign timeline
  const { data: timelineResponse } = useQuery({
    queryKey: ['campaign-timeline', campaignId],
    queryFn: () => getCampaignTimeline(campaignId),
    refetchOnWindowFocus: false,
  });

  // Mutation for running campaign
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

  // Mutation for pausing campaign
  const pauseMutation = useMutation({
    mutationFn: () => pauseCampaign(campaignId),
    onSuccess: () => {
      toast.success('Campaign paused successfully');
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

  // Mutation for resuming campaign
  const resumeMutation = useMutation({
    mutationFn: () => resumeCampaign(campaignId),
    onSuccess: () => {
      toast.success('Campaign resumed successfully');
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">Fetching campaign details</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Campaign not found</h2>
          <p className="text-sm text-muted-foreground">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }
  // Get timeline data
  const timeline = timelineResponse?.data || [];

  // Calculate percentages for display
  const interestedPercentage =
    campaign.totalContacts > 0 ? (campaign.interested / campaign.totalContacts) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Hero Section with Actions */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge
                className={cn(
                  'border',
                  getStatusColor(campaign.status),
                  campaign.status?.toLowerCase() === 'active' && 'animate-pulse',
                )}
                variant="secondary"
              >
                {getStatusLabel(campaign.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Created{' '}
                  {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                <span>ID: {campaign.id}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {(campaign.status === 'active' || campaign.status === 'failed') && (
              <Button
                variant="default"
                size="sm"
                onClick={() => runMutation.mutate()}
                disabled={runMutation.isPending}
              >
                <Play className="h-4 w-4" />
                {runMutation.isPending ? 'Running...' : 'Run'}
              </Button>
            )}
            {campaign.status === 'running' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => pauseMutation.mutate()}
                disabled={pauseMutation.isPending}
              >
                <Pause className="h-4 w-4" />
                {pauseMutation.isPending ? 'Pausing...' : 'Pause'}
              </Button>
            ) : campaign.status === 'paused' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending}
              >
                <Play className="h-4 w-4" />
                {resumeMutation.isPending ? 'Resuming...' : 'Resume'}
              </Button>
            ) : null}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Report
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.totalContacts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Campaign database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interested</CardTitle>
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.interested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {interestedPercentage.toFixed(1)}% conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950/30">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.responseRate}%</div>
              <p className="text-xs text-muted-foreground">Overall engagement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-950/30">
                <MessageCircleMore className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-xl font-bold">
                    {(campaign.contactMessageSent?.email?.sent ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-xl font-bold">
                    {(campaign.contactMessageSent?.whatsapp?.sent ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-bold">
                    {(campaign.contactMessageSent?.sms?.sent ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sent messages by channel</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-3">
        <TabsList className=" border-b w-full bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Campaign Recipients</TabsTrigger>
          <TabsTrigger value="timeline">Timeline History</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Normal Card Design with Grid */}
        <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Card 1: Campaign Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Target className="h-5 w-5 text-primary" />
                  Campaign Information
                </CardTitle>
                <CardDescription>Core identity and strategic status</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-6 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Campaign Name
                      </dt>
                      <dd className="text-sm font-semibold">{campaign.name}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </dt>
                      <dd className="text-sm font-medium leading-relaxed">
                        {campaign.description || '-'}
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Card 2: File Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  File Information
                </CardTitle>
                <CardDescription>Source details and record health</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        File Name
                      </dt>
                      <dd className="text-sm font-semibold truncate">{campaign.file.name}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Bank Name
                      </dt>
                      <dd className="text-sm font-semibold uppercase">{campaign.file.bankName}</dd>
                    </div>
                  </div>

                  <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t mt-6">
                    <div className="border-l-2 border-blue-500 pl-4 py-1">
                      <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Total Records
                      </dt>
                      <dd className="text-2xl font-bold tracking-tight">
                        {(campaign.fileContentStats.totalRecords ?? 0).toLocaleString()}
                      </dd>
                    </div>

                    <div className="border-l-2 border-rose-500 pl-4 py-1">
                      <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Invalid
                      </dt>
                      <dd className="text-2xl font-bold tracking-tight text-rose-600">
                        {(campaign.fileContentStats.invalidRecords ?? 0).toLocaleString()}
                      </dd>
                    </div>

                    <div className="border-l-2 border-amber-500 pl-4 py-1">
                      <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Duplicates
                      </dt>
                      <dd className="text-2xl font-bold tracking-tight text-amber-600">
                        {(campaign.fileContentStats.duplicateRecords ?? 0).toLocaleString()}
                      </dd>
                    </div>

                    <div className="border-l-2 border-slate-400 pl-4 py-1">
                      <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Excluded
                      </dt>
                      <dd className="text-2xl font-bold tracking-tight text-slate-600">
                        {(campaign.fileContentStats.excludedRecords ?? 0).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-2">
          <CampaignContactsTable campaignId={campaignId} campaignStatus={campaign.status} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Campaign Activity Timeline
              </CardTitle>
              <CardDescription>Complete history of campaign events and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  [...timeline].reverse().map((item, idx) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            item.type === 'created' && 'bg-blue-100 dark:bg-blue-950',
                            item.type === 'sent' && 'bg-indigo-100 dark:bg-indigo-950',
                            item.type === 'milestone' && 'bg-emerald-100 dark:bg-emerald-950',
                            item.type === 'paused' && 'bg-orange-100 dark:bg-orange-950',
                            item.type === 'resumed' && 'bg-green-100 dark:bg-green-950',
                            item.category === 'status_change' && 'bg-purple-100 dark:bg-purple-950',
                          )}
                        >
                          {item.type === 'created' && (
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                          {item.type === 'sent' && (
                            <Send className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                          {item.type === 'milestone' && (
                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {item.type === 'paused' && (
                            <Pause className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          )}
                          {item.type === 'resumed' && (
                            <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                          {item.category === 'status_change' && item.type !== 'created' && (
                            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        {idx !== timeline.length - 1 && <div className="h-full w-0.5 bg-border" />}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.metadata.contactCount !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                Contacts: {item.metadata.contactCount}
                              </span>
                            )}
                            {item.metadata.bankName && (
                              <span className="text-xs text-muted-foreground capitalize">
                                Bank: {item.metadata.bankName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No timeline events yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
