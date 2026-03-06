'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, Pause, Plus, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_CAMPAIGNS_RESPONSE } from '../lib/mock-data';
import { getAllCampaigns } from '../services';
import type { CampaignsResponse, CampaignsStats } from '../types';
import { CampaignsTable } from './campaigns-table';

function getStatsConfig(stats: CampaignsStats, total: number) {
  return [
    {
      title: 'Total Campaigns',
      value: total,
      icon: Rocket,
      description: 'All campaigns created',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: Activity,
      description: 'Currently active',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      title: 'Paused',
      value: stats.paused,
      icon: Pause,
      description: 'Paused campaigns',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      description: 'Failed campaigns',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-950/30',
    },
  ];
}

export function CampaignsList() {
  const router = useRouter();

  const { data: campaignsResponse } = useQuery<CampaignsResponse>({
    queryKey: ['campaigns', { page: 1, limit: 10 }],
    queryFn: () => getAllCampaigns(1, 10),
    select: (data) => (data.meta.total === 0 ? MOCK_CAMPAIGNS_RESPONSE : data),
  });

  const stats = campaignsResponse?.stats || { active: 0, running: 0, paused: 0, failed: 0 };
  const total = campaignsResponse?.meta.total || 0;
  const statsConfig = getStatsConfig(stats, total);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaign List</h1>
          <p className="mt-1 text-muted-foreground">Manage and view all campaigns</p>
        </div>
        <Button onClick={() => router.push('/campaigns/create')}>
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns Table */}
      <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
        <CampaignsTable />
      </Suspense>
    </div>
  );
}
