import { Suspense } from 'react';
import { ManualFollowupTable } from './manual-followup-table';

const ManualFollowup = () => {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manual Follow-up</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track manual follow-up cases for borrowers
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
        <ManualFollowupTable />
      </Suspense>
    </div>
  );
};

export default ManualFollowup;
