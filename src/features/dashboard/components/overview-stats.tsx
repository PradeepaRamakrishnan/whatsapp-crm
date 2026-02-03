'use client';

import { useQuery } from '@tanstack/react-query';
import { Send, Target, UserCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOverviewCounts } from '../services';

interface OverviewCounts {
  totalCampaigns: number;
  totalLeads: number;
  conversionRate: string;
  totalFiles: number;
}

export function OverviewStats() {
  const { data: counts, isLoading } = useQuery<OverviewCounts>({
    queryKey: ['overview-counts'],
    queryFn: () => {
      return getOverviewCounts();
    },
    retry: false,
  });

  const stats = [
    {
      title: 'Total Campaigns',
      value: counts?.totalCampaigns?.toLocaleString() ?? '...',
      change: '+12.5%',
      trend: 'up',
      icon: Send,
      color: 'text-blue-500',
      description: 'Active campaigns',
    },
    {
      title: 'Total Leads',
      value: counts?.totalLeads?.toLocaleString() ?? '...',
      change: '+18.2%',
      trend: 'up',
      icon: UserCheck,
      color: 'text-emerald-500',
      description: 'Leads generated from campaigns',
    },
    {
      title: 'Conversion Rate',
      value: counts?.conversionRate ?? '...',
      change: '+5.4%',
      trend: 'up',
      icon: Target,
      color: 'text-indigo-500',
      description: 'Campaign to lead conversion',
    },
    {
      title: 'Total Files',
      value: counts?.totalFiles?.toLocaleString() ?? '...',
      change: '-2.1%',
      trend: 'down',
      icon: Users,
      color: 'text-amber-500',
      description: 'Active borrower files',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
                <div className="text-xs mt-2 text-muted-foreground">{stat.description}</div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
