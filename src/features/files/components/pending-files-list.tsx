'use client';

import { Suspense } from 'react';
import { PendingFilesTable } from './pending-files-table';

export function PendingFilesList() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Review Files</h1>
          <p className="text-muted-foreground">View and manage files awaiting review</p>
        </div>
      </div>

      {/* Pending Files Table */}
      <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
        <PendingFilesTable />
      </Suspense>
    </div>
  );
}
