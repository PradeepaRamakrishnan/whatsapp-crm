'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit,
  FileText,
  IndianRupee,
  Mail,
  MessageSquare,
  Pause,
  Phone,
  Play,
  Send,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { campaignsData } from '../lib/data';
import { BorrowersTableInCampaign } from './borrowers-table-in-campaign';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900';
    case 'scheduled':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900';
    case 'completed':
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-900';
    case 'draft':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900';
    case 'paused':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-900';
  }
};

interface CampaignDetailsPageProps {
  campaignId: number;
}

export function CampaignDetailsPage({ campaignId }: CampaignDetailsPageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const campaign = useMemo(() => {
    return campaignsData.find((c) => c.id === campaignId);
  }, [campaignId]);

  // Mock data for comprehensive metrics (in production, fetch from API)
  const metrics = {
    totalContacts: 2450,
    contacted: 2340,
    interested: 1156,
    qualified: 486,
    disbursed: 301,
    responseRate: campaign?.responseRate || 0,
    conversionRate: 12.3,
    avgResponseTime: '2.4 hours',
    totalLoanValue: 15250000,
    disbursedAmount: 9450000,
    pendingAmount: 5800000,
    avgTicketSize: 31395,
    costPerLead: 245,
    roi: 387,
    contactMethods: {
      sms: 1200,
      email: 850,
      whatsapp: 690,
      call: 600,
    },
    timeline: [
      { date: '2024-01-25', event: 'Campaign created', type: 'created' },
      { date: '2024-01-26', event: 'First batch sent (500 contacts)', type: 'sent' },
      { date: '2024-01-27', event: 'Response rate reached 10%', type: 'milestone' },
      { date: '2024-01-28', event: '100 leads qualified', type: 'milestone' },
      { date: '2024-01-30', event: 'Campaign paused for review', type: 'paused' },
      { date: '2024-02-01', event: 'Campaign resumed', type: 'resumed' },
    ],
  };

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

  const contactedPercentage = (metrics.contacted / metrics.totalContacts) * 100;
  const interestedPercentage = (metrics.interested / metrics.contacted) * 100;
  const qualifiedPercentage = (metrics.qualified / metrics.interested) * 100;
  const disbursedPercentage = (metrics.disbursed / metrics.qualified) * 100;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Hero Section with Actions */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge className={cn('border', getStatusColor(campaign.status))} variant="secondary">
                {campaign.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Created{' '}
                  {new Date(campaign.createdDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{metrics.totalContacts.toLocaleString()} contacts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                <span>ID: #{campaign.id}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            {campaign.status === 'Active' ? (
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4" />
              Clone
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{metrics.responseRate}%</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Conversion</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Total Disbursed</p>
                  <p className="text-2xl font-bold">
                    ₹{(metrics.disbursedAmount / 10000000).toFixed(1)}Cr
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-950">
                  <IndianRupee className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{metrics.avgResponseTime}</p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-950">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="borrowers">Borrowers</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Lead Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lead Conversion Funnel
              </CardTitle>
              <CardDescription>
                Track how contacts move through your campaign stages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Total Contacts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Contacts</p>
                        <p className="text-xs text-muted-foreground">Campaign database</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{metrics.totalContacts.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">100%</p>
                    </div>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                {/* Contacted */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-950">
                        <Send className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contacted</p>
                        <p className="text-xs text-muted-foreground">Outreach completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{metrics.contacted.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {contactedPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={contactedPercentage} className="h-2" />
                </div>

                {/* Interested */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950">
                        <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Interested</p>
                        <p className="text-xs text-muted-foreground">Showed interest</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{metrics.interested.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {interestedPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.interested / metrics.totalContacts) * 100}
                    className="h-2"
                  />
                </div>

                {/* Qualified */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Qualified</p>
                        <p className="text-xs text-muted-foreground">Met criteria</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{metrics.qualified.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {qualifiedPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.qualified / metrics.totalContacts) * 100}
                    className="h-2"
                  />
                </div>

                {/* Disbursed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950">
                        <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Disbursed</p>
                        <p className="text-xs text-muted-foreground">Loan completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{metrics.disbursed.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {disbursedPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.disbursed / metrics.totalContacts) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Methods
                </CardTitle>
                <CardDescription>Distribution of communication channels used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">SMS</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.contactMethods.sms} sent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {((metrics.contactMethods.sms / metrics.contacted) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.contactMethods.sms / metrics.contacted) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                        <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.contactMethods.email} sent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {((metrics.contactMethods.email / metrics.contacted) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.contactMethods.email / metrics.contacted) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                        <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.contactMethods.whatsapp} sent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {((metrics.contactMethods.whatsapp / metrics.contacted) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.contactMethods.whatsapp / metrics.contacted) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                        <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Phone Call</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.contactMethods.call} calls
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {((metrics.contactMethods.call / metrics.contacted) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(metrics.contactMethods.call / metrics.contacted) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
                <CardDescription>Campaign financial metrics and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Loan Value</p>
                      <p className="text-2xl font-bold">
                        ₹{(metrics.totalLoanValue / 10000000).toFixed(2)} Cr
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Disbursed</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{(metrics.disbursedAmount / 10000000).toFixed(2)} Cr
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                          ₹{(metrics.pendingAmount / 10000000).toFixed(2)} Cr
                        </p>
                      </div>
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Ticket Size</span>
                      <span className="font-semibold">
                        ₹{metrics.avgTicketSize.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost per Lead</span>
                      <span className="font-semibold">₹{metrics.costPerLead}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ROI</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {metrics.roi}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">65.4%</p>
                    <p className="text-xs text-muted-foreground">1,530 opens</p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">{metrics.responseRate}%</p>
                    <p className="text-xs text-muted-foreground">{metrics.interested} clicks</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950">
                    <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                    <p className="text-xs text-muted-foreground">{metrics.disbursed} converted</p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-950">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Bounce Rate</p>
                    <p className="text-2xl font-bold">8.7%</p>
                    <p className="text-xs text-muted-foreground">204 bounced</p>
                  </div>
                  <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-950">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Targets vs Actuals</CardTitle>
              <CardDescription>Compare your campaign goals with actual performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Target</span>
                    <span className="font-medium">50% Target | {metrics.responseRate}% Actual</span>
                  </div>
                  <Progress value={metrics.responseRate} max={50} className="h-3" />
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    +{metrics.responseRate - 50}% above target
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conversion Target</span>
                    <span className="font-medium">
                      10% Target | {metrics.conversionRate}% Actual
                    </span>
                  </div>
                  <Progress value={metrics.conversionRate} max={10} className="h-3" />
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    +{metrics.conversionRate - 10}% above target
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disbursement Target</span>
                    <span className="font-medium">
                      ₹10Cr Target | ₹{(metrics.disbursedAmount / 10000000).toFixed(1)}Cr Actual
                    </span>
                  </div>
                  <Progress value={(metrics.disbursedAmount / 100000000) * 100} className="h-3" />
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    -{(100000000 - metrics.disbursedAmount) / 10000000}Cr below target
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Borrowers Tab */}
        <TabsContent value="borrowers" className="mt-6">
          <BorrowersTableInCampaign campaignId={campaignId} />
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
                {[...metrics.timeline].reverse().map((item, idx) => (
                  <div key={`${item.date}-${item.type}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          item.type === 'created' && 'bg-blue-100 dark:bg-blue-950',
                          item.type === 'sent' && 'bg-indigo-100 dark:bg-indigo-950',
                          item.type === 'milestone' && 'bg-emerald-100 dark:bg-emerald-950',
                          item.type === 'paused' && 'bg-orange-100 dark:bg-orange-950',
                          item.type === 'resumed' && 'bg-green-100 dark:bg-green-950',
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
                      </div>
                      {idx !== metrics.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{item.type} event</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>Complete details about this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Campaign Name</p>
                    <p className="mt-1 text-lg font-semibold">{campaign.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bank/Source</p>
                    <p className="mt-1 text-lg font-semibold">{campaign.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Campaign Owner</p>
                    <p className="mt-1 text-lg font-semibold">Rahul Sharma</p>
                    <p className="text-xs text-muted-foreground">Campaign Manager</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <Badge
                        className={cn('border', getStatusColor(campaign.status))}
                        variant="secondary"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                    <p className="mt-1 text-lg font-semibold">
                      {new Date(campaign.createdDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                    <p className="mt-1 text-lg font-semibold">
                      {new Date(campaign.scheduledDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Objectives</CardTitle>
              <CardDescription>Goals and targets for this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <Target className="mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Response Target</p>
                  <p className="mt-1 text-2xl font-bold">50%</p>
                </div>
                <div className="rounded-lg border p-4">
                  <TrendingUp className="mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Conversion Target</p>
                  <p className="mt-1 text-2xl font-bold">10%</p>
                </div>
                <div className="rounded-lg border p-4">
                  <IndianRupee className="mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Disbursement Target</p>
                  <p className="mt-1 text-2xl font-bold">₹10 Cr</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
