'use client';

import { Activity, CheckCircle2, Plus, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignsTable } from './campaigns-table';

export function CampaignsList() {
  const router = useRouter();

  const stats = [
    {
      title: 'Total Campaigns',
      value: '24',
      icon: Rocket,
      description: 'All campaigns created',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      title: 'Active',
      value: '8',
      icon: Activity,
      description: 'Currently running',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      title: 'Completed',
      value: '11',
      icon: CheckCircle2,
      description: 'Finished campaigns',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign List</h1>
          <p className="text-muted-foreground">Manage and view all campaigns</p>
        </div>
        <Button onClick={() => router.push('/campaigns/create')}>
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
      <CampaignsTable />
    </div>
  );
}
