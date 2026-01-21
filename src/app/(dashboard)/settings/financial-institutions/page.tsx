import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FinancialInstitutionsList } from '@/features/settings/components/financial-institutions-list';

export const metadata: Metadata = {
  title: 'Financial Institutions',
  description: 'Manage financial institutions and banking partners.',
};

const FinancialInstitutionsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      }
    >
      <FinancialInstitutionsList />
    </Suspense>
  );
};

export default FinancialInstitutionsPage;
