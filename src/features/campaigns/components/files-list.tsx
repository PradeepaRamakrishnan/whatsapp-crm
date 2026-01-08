'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FilesTable } from './files-table';

export function FilesList() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
          <p className="text-muted-foreground">Manage and view all uploaded borrower files</p>
        </div>
        <Button onClick={() => router.push('/campaigns/files/upload')}>
          <Plus className="mr-2 h-4 w-4" />
          Create File
        </Button>
      </div>

      {/* Files Table */}
      <FilesTable />
    </div>
  );
}
