/** biome-ignore-all assist/source/organizeImports: <> */
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Instagram, Plus, Table, Search, RefreshCw, Bot } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInstagramAccounts } from '../services';
import type { InstagramAccount } from '../types';
import { ConnectAccountSheet } from './connect-account-sheet';
import { InstagramAccountsTable } from './instagram-accounts-table';
import { InstagramTemplatesList } from './instagram-templates-list';
import { InstagramAutomationSettings } from './instagram-automation-settings';
import { cn } from '@/lib/utils';

export function InstagramAccountsList() {
  const queryClient = useQueryClient();
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    data: accounts = [],
    isLoading,
    isRefetching,
  } = useQuery<InstagramAccount[]>({
    queryKey: ['instagram-accounts'],
    queryFn: getInstagramAccounts,
    retry: 1,
  });

  const filteredAccounts = (Array.isArray(accounts) ? accounts : []).filter(
    (account) =>
      account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.instagramId?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-2 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            <Instagram className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Instagram Configuration</h1>
            <p className="text-muted-foreground">Manage connected Instagram Business accounts</p>
          </div>
        </div>
      </div>

      <Tabs id="instagram-accounts-tabs" defaultValue="accounts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="accounts" className="gap-2">
            <Table className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Bot className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4 flex flex-col">
          {/* Action Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-1 rounded-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or ID..."
                className="pl-9 bg-muted/50 border-none h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4 gap-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })}
                disabled={isLoading || isRefetching}
              >
                <RefreshCw
                  className={cn('h-4 w-4', (isLoading || isRefetching) && 'animate-spin')}
                />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setConnectOpen(true)}>
                <Plus className="h-4 w-4" />
                Connect Instagram Account
              </Button>
            </div>
          </div>

          {/* Accounts Table */}
          <InstagramAccountsTable
            accounts={filteredAccounts}
            isLoading={isLoading || isRefetching}
          />
        </TabsContent>

        <TabsContent value="templates">
          <InstagramTemplatesList accounts={accounts} />
        </TabsContent>
        <TabsContent value="automation">
          <InstagramAutomationSettings accounts={accounts} />
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
