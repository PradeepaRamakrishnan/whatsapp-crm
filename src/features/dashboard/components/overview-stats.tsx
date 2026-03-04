'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileSpreadsheet, Send, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getOverviewCounts } from '../services';

interface OverviewCounts {
  totalCampaigns: number;
  totalLeads: number;
  conversionRate: string;
  totalFiles: number;
}

const STATS_CONFIG = [
  {
    key: 'totalFiles' as const,
    title: 'Total Files',
    icon: FileSpreadsheet,
    color: 'text-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    description: 'Borrower files uploaded',
    emptyHint: 'Upload your first file',
    emptyHref: '/files',
  },
  {
    key: 'totalCampaigns' as const,
    title: 'Total Campaigns',
    icon: Send,
    color: 'text-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    description: 'Campaigns created',
    emptyHint: 'Create a campaign',
    emptyHref: '/campaigns/create',
  },
  {
    key: 'totalLeads' as const,
    title: 'Total Leads',
    icon: TrendingUp,
    color: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    description: 'Leads generated from campaigns',
    emptyHint: 'Appears after campaigns run',
    emptyHref: null,
  },
  {
    key: 'conversionRate' as const,
    title: 'Response Rate',
    icon: Target,
    color: 'text-indigo-500',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    description: 'Campaign to lead conversion',
    emptyHint: 'Calculated after leads appear',
    emptyHref: null,
  },
];

export function OverviewStats() {
  const { data: counts, isLoading } = useQuery<OverviewCounts>({
    queryKey: ['overview-counts'],
    queryFn: () => getOverviewCounts(),
    retry: false,
  });

  const getValue = (key: keyof OverviewCounts) => counts?.[key]?.toLocaleString() ?? '0';

  const isEmpty = (key: keyof OverviewCounts) => {
    if (key === 'conversionRate')
      return (
        counts?.conversionRate === '0.0%' ||
        counts?.conversionRate === '0%' ||
        !counts?.conversionRate
      );
    return (counts?.[key] as number) === 0;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STATS_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const value =
          stat.key === 'conversionRate' ? (counts?.conversionRate ?? '0.0%') : getValue(stat.key);
        const empty = !isLoading && isEmpty(stat.key);

        return (
          <Card key={stat.title} className="flex flex-col gap-1 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
              <div className={`flex h-6 w-6 items-center justify-center rounded-md ${stat.iconBg}`}>
                <Icon className={`h-3 w-3 ${stat.color}`} />
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-1">
                <div className="h-6 w-14 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-28 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <div>
                <p
                  className={`text-xl font-bold leading-tight ${empty ? 'text-muted-foreground/35' : 'text-foreground'}`}
                >
                  {value}
                </p>
                {empty ? (
                  stat.emptyHref ? (
                    <Link
                      href={stat.emptyHref}
                      className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${stat.color} hover:underline`}
                    >
                      {stat.emptyHint}
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-muted-foreground/45">{stat.emptyHint}</p>
                  )
                ) : (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.description}</p>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
