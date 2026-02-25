import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InstagramInbox } from '@/features/instagram/components/instagram-inbox';

export const metadata: Metadata = {
  title: 'Instagram Inbox',
  description: 'View messages from connected Instagram Business accounts.',
};

const InstagramInboxPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <InstagramInbox />
    </Suspense>
  );
};

export default InstagramInboxPage;
