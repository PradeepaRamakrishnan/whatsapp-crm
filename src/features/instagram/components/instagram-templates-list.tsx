'use client';

import { FileText, Plus, RefreshCw, Search } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { InstagramAccount } from '../types';
import { InstagramTemplateSheet } from './instagram-template-sheet';

interface InstagramTemplatesListProps {
  accounts: InstagramAccount[];
}

export function InstagramTemplatesList({ accounts }: InstagramTemplatesListProps) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate sync or trigger mutation
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 py-4">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-1 rounded-xl">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9 bg-muted/50 border-none h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-10 bg-muted/50 border-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 gap-2"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
            Sync Templates
          </Button>
          <Button
            size="sm"
            className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white gap-2 border-none shadow-sm shadow-orange-200"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Main Content Area (Placeholder for now) */}
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-16 text-center bg-white/50">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="max-w-[420px] space-y-2">
          <h3 className="text-xl font-semibold">No Templates Found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'No templates match your current filters. Try adjusting your search or status selection.'
              : 'Create reusable message templates for your Instagram Business accounts. Templates help you respond faster and maintain a consistent brand voice.'}
          </p>
        </div>
      </div>

      <InstagramTemplateSheet open={createOpen} onOpenChange={setCreateOpen} accounts={accounts} />
    </div>
  );
}
