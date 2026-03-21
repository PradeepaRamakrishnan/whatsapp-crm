import { CalendarClock, Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SchedulerList } from '@/features/lead-generation-schedulers/components/scheduler-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Lead Generation Schedulers',
  description: 'Manage automated lead collection schedules',
};

export default function LeadGenerationSchedulersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <CalendarClock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Lead Generation Schedulers</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Automate lead collection with recurring cron jobs. Each scheduler runs on your chosen
            cadence and saves results to Business Leads.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SchedulerList />
      </Suspense>
    </div>
  );
}
