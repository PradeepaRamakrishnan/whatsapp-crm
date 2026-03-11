'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, Pause, Plus, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { MOCK_CAMPAIGNS_RESPONSE } from '../lib/mock-data';
import { getAllCampaigns } from '../services';
import type { CampaignsResponse, CampaignsStats } from '../types';
import { CampaignsTable } from './campaigns-table';

function getStatsConfig(stats: CampaignsStats, total: number) {
  return [
    { title: 'Total', value: total, icon: Rocket, iconColor: 'text-blue-600' },
    { title: 'Active', value: stats.active, icon: Activity, iconColor: 'text-emerald-600' },
    { title: 'Paused', value: stats.paused, icon: Pause, iconColor: 'text-amber-500' },
    { title: 'Failed', value: stats.failed, icon: AlertCircle, iconColor: 'text-red-500' },
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
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage outreach campaigns and track performance
          </p>
        </div>
        <Button
          onClick={() => router.push('/campaigns/create')}
          className="shrink-0 gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsConfig.map((stat) => (
          <div
            key={stat.title}
            className="flex items-center gap-3 rounded-md border bg-card px-4 py-3"
          >
            <div className="rounded p-1.5 bg-muted">
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className="text-lg font-semibold leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Grid */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            Loading campaigns...
          </div>
        }
      >
        <CampaignsTable />
      </Suspense>
    </div>
  );
}
