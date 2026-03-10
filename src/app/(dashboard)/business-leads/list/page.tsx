import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BusinessLeadsList } from '@/features/business-leads/components/business-leads-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Business Leads',
  description: 'View and manage all saved business leads.',
};

export default function BusinessLeadsListPage() {
  return (
    <div className="p-4">
      <Suspense>
        <BusinessLeadsList />
      </Suspense>
    </div>
  );
}
