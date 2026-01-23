'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock, Info, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllLeads } from '../services';
import type { LeadsResponse } from '../types';
import { InterestedLeadsTable } from './interested-leads-table';

export function InterestedLeadsList() {
  const { data: leadsResponse } = useQuery<LeadsResponse>({
    queryKey: ['leads', { page: 1, limit: 10 }],
    queryFn: () => getAllLeads(1, 10),
  });

  const stats = [
    {
      title: 'Total Interested',
      value: leadsResponse?.stats?.totalInterested?.toString() || '0',
      icon: Users,
      description: 'Leads who expressed interest',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950/30',
    },
    {
      title: 'New Today',
      value: leadsResponse?.stats?.newToday?.toString() || '0',
      icon: TrendingUp,
      description: 'Incoming interest today',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      title: 'Avg. Response Time',
      value: leadsResponse?.stats?.avgResponseTime || '0h',
      icon: Clock,
      description: 'Time to first contact',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      title: 'Follow-ups Due',
      value: leadsResponse?.stats?.followUpsDue?.toString() || '0',
      icon: Info,
      description: 'Action required',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interested Leads</h1>
          <p className="text-muted-foreground">
            Manage leads who have expressed interest in loan products
          </p>
        </div>
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

      {/* Leads Table */}
      <InterestedLeadsTable />
    </div>
  );
}
