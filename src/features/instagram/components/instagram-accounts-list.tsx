'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Instagram, Plus, Table, Users, WifiOff } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInstagramAccounts } from '../services';
import type { InstagramAccount } from '../types';
import { ConnectAccountSheet } from './connect-account-sheet';
import { InstagramAccountsTable } from './instagram-accounts-table';
import { InstagramTemplatesList } from './instagram-templates-list';

export function InstagramAccountsList() {
  const queryClient = useQueryClient();
  const [connectOpen, setConnectOpen] = React.useState(false);

  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useQuery<InstagramAccount[]>({
    queryKey: ['instagram-accounts'],
    queryFn: getInstagramAccounts,
    retry: 1,
  });

  const total = accounts.length;
  const active = accounts.filter((a) => a.status === 'active').length;
  const disconnected = accounts.filter((a) => a.status === 'disconnected').length;

  const stats = [
    {
      title: 'Total Accounts',
      value: total,
      icon: Users,
      description: 'Connected Instagram accounts',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950/30',
    },
    {
      title: 'Active',
      value: active,
      icon: Instagram,
      description: 'Live and ready to message',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      title: 'Disconnected',
      value: disconnected,
      icon: WifiOff,
      description: 'Inactive accounts',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-950/30',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            <Instagram className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instagram Accounts</h1>
            <p className="text-muted-foreground">Manage connected Instagram Business accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setConnectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load accounts: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      )}

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="accounts" className="gap-2">
            <Table className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6 flex flex-col">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
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
                      <span className="text-muted-foreground animate-pulse">…</span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Accounts Table */}
          <InstagramAccountsTable accounts={accounts} />
        </TabsContent>

        <TabsContent value="templates">
          <InstagramTemplatesList accounts={accounts} />
        </TabsContent>
      </Tabs>

      {/* Connect Sheet */}
      <ConnectAccountSheet
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })}
      />
    </div>
  );
}
