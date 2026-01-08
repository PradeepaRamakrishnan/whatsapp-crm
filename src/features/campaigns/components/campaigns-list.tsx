'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CampaignsTable } from './campaigns-table';

export function CampaignsList() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign List</h1>
          <p className="text-muted-foreground">Manage and view all campaigns</p>
        </div>
        <Button onClick={() => router.push('/campaigns/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Table */}
      <CampaignsTable />
    </div>
  );
}
