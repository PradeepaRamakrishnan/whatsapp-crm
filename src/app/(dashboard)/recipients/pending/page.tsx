import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { PendingFilesList } from '@/features/files/components/pending-files-list';
import { getAllFiles } from '@/features/files/services';

export const metadata: Metadata = {
  title: 'Pending Recipients',
  description: 'View all recipient lists pending review.',
};

const PendingFilesPage = async () => {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['files', { page: 1, limit: 10 }],
      queryFn: () => getAllFiles(1, 10),
    });
  } catch {
    // API unavailable — client will refetch on mount
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PendingFilesList />
    </HydrationBoundary>
  );
};

export default PendingFilesPage;
