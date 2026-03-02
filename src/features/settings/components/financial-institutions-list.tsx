'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllFinancialInstitutions } from '../services';
import type { FinancialInstitutionsResponse } from '../types';
import { FinancialInstitutionsTable } from './financial-institutions-table';

export function FinancialInstitutionsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useQuery<FinancialInstitutionsResponse>({
    queryKey: ['financial-institutions', page, pageSize, search],
    queryFn: () => getAllFinancialInstitutions(page, pageSize),
  });

  // Extract stats from API data with fallback values
  const totalInstitutions = data?.stats?.total || 0;
  const activeCount = data?.stats?.active || 0;
  const inactiveCount = data?.stats?.inactive || 0;

  const stats = [
    {
      title: 'Total Institutions',
      value: totalInstitutions,
      icon: Building2,
      description: 'Registered financial institutions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      title: 'Active',
      value: activeCount,
      icon: Building2,
      description: 'Currently active',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      title: 'Inactive',
      value: inactiveCount,
      icon: Building2,
      description: 'Temporarily inactive',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-950/30',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Institutions</h1>
          <p className="mt-1 text-muted-foreground">
            Manage banking partners and financial institutions
          </p>
        </div>
        <Button onClick={() => router.push('/settings/financial-institutions/create')}>
          <Plus className="h-4 w-4" />
          Add Institution
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground animate-pulse">...</span>
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Institutions Table */}
      <FinancialInstitutionsTable />
    </div>
  );
}
