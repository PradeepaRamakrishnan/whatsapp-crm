/** biome-ignore-all assist/source/organizeImports: <> */
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, RefreshCw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInstagramAccounts } from '../services';
import type { InstagramAccount } from '../types';
import { ConnectAccountSheet } from './connect-account-sheet';
import { InstagramAccountsTable } from './instagram-accounts-table';
import { InstagramTemplatesList } from './instagram-templates-list';
import { InstagramAutomationSettings } from './instagram-automation-settings';
import { InstagramConfigHeader } from './instagram-config-header';
import { cn } from '@/lib/utils';

export function InstagramAccountsList() {
  const queryClient = useQueryClient();
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('accounts');

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
    <div className="flex flex-1 flex-col p-4 min-w-0">
      <InstagramConfigHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col gap-6">
        {activeTab === 'accounts' && (
          <>
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
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })
                  }
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
          </>
        )}

        {activeTab === 'templates' && <InstagramTemplatesList accounts={accounts} />}

        {activeTab === 'automation' && <InstagramAutomationSettings accounts={accounts} />}
      </div>

      {/* Connect Sheet */}
      <ConnectAccountSheet
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })}
      />
    </div>
  );
}
