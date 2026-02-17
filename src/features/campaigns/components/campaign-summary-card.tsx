import { Mail, MessageCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CampaignDetails } from '../types';

interface CampaignSummaryCardProps {
  campaign: CampaignDetails;
}

export function CampaignSummaryCard({ campaign }: CampaignSummaryCardProps) {
  const { executionSummary, contactMessageSent } = campaign;

  const stats = [
    {
      label: 'Email',
      icon: Mail,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-500',
      sent: executionSummary?.successful?.email ?? contactMessageSent?.email?.sent ?? 0,
      failed: executionSummary?.failed?.email ?? 0,
      skipped:
        (executionSummary?.skipped?.duplicateEmail ?? 0) +
        (executionSummary?.skipped?.alreadySent?.email ?? 0) +
        (executionSummary?.skipped?.notWhitelisted?.email ?? 0) +
        (executionSummary?.skipped?.campaignPaused?.email ?? 0),
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-500',
      sent: executionSummary?.successful?.whatsapp ?? contactMessageSent?.whatsapp?.sent ?? 0,
      failed: executionSummary?.failed?.whatsapp ?? 0,
      skipped:
        (executionSummary?.skipped?.duplicatePhone ?? 0) +
        (executionSummary?.skipped?.alreadySent?.whatsapp ?? 0) +
        (executionSummary?.skipped?.notWhitelisted?.whatsapp ?? 0) +
        (executionSummary?.skipped?.campaignPaused?.whatsapp ?? 0),
    },
    {
      label: 'SMS',
      icon: MessageSquare,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-500',
      sent: executionSummary?.successful?.sms ?? contactMessageSent?.sms?.sent ?? 0,
      failed: executionSummary?.failed?.sms ?? 0,
      skipped:
        (executionSummary?.skipped?.duplicatePhone ?? 0) +
        (executionSummary?.skipped?.alreadySent?.sms ?? 0) +
        (executionSummary?.skipped?.notWhitelisted?.sms ?? 0) +
        (executionSummary?.skipped?.campaignPaused?.sms ?? 0),
    },
  ];

  return (
    <Card className="lg:col-span-2 overflow-hidden border-none shadow-md bg-white dark:bg-slate-950">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semisemibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Campaign Summary
            </CardTitle>
            <CardDescription>Real-time delivery performance across all channels</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stats.map((channel) => (
            <div
              key={channel.label}
              className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-6 transition-colors"
            >
              {/* Channel Identity - Matching File Info Style */}
              <div className="flex items-start gap-3 min-w-[180px]">
                <div className={`rounded-lg ${channel.bgColor} p-2.5 mt-0.5`}>
                  <channel.icon className={`h-5 w-5 ${channel.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                    Channel
                  </dt>
                  <dd className="text-base font-semibold text-slate-900 dark:text-white">
                    {channel.label}
                  </dd>
                </div>
              </div>

              {/* Stats Grid - Matching File Content Stats Style */}
              <div className="grid grid-cols-3 gap-6 md:gap-12 flex-1 max-w-3xl">
                <div className="border-l-2 border-emerald-500 pl-4 py-1">
                  <dt className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 leading-none">
                    Total Sent
                  </dt>
                  <dd className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {channel.sent.toLocaleString()}
                  </dd>
                </div>

                <div className="border-l-2 border-rose-500 pl-4 py-1">
                  <dt className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 leading-none">
                    Failed
                  </dt>
                  <dd className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {channel.failed.toLocaleString()}
                  </dd>
                </div>

                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <dt className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 leading-none">
                    Skipped
                  </dt>
                  <dd className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {channel.skipped.toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
