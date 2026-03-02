'use client';

import { Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NbfcTable } from './nbfc-table';

export function NbfcList() {
  const stats = [
    {
      title: 'Total NBFCs',
      value: '8',
      icon: Building,
      description: 'Registered NBFCs',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      title: 'Active',
      value: '7',
      icon: Building,
      description: 'Currently active',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      title: 'Inactive',
      value: '1',
      icon: Building,
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
          <h1 className="text-2xl font-bold tracking-tight">NBFC Management</h1>
          <p className="mt-1 text-muted-foreground">Manage Non-Banking Financial Companies</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add NBFC
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

      {/* NBFC Table */}
      <NbfcTable />
    </div>
  );
}
