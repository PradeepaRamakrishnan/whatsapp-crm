import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InstagramAccountsList } from '@/features/instagram/components/instagram-accounts-list';

export const metadata: Metadata = {
  title: 'Instagram Configuration',
  description: 'Manage connected Instagram Business accounts.',
};

const InstagramAccountsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-2">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-72 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-muted rounded-xl animate-pulse" />
        </div>
      }
    >
      <InstagramAccountsList />
    </Suspense>
  );
};

export default InstagramAccountsPage;
