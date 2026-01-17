import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { PendingFilesList } from '@/features/files/components/pending-files-list';
import { getAllFiles } from '@/features/files/services';

export const metadata: Metadata = {
  title: 'Pending Review Files',
  description: 'View all files pending review.',
};

const PendingFilesPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['files', { page: 1, limit: 10 }],
    queryFn: () => getAllFiles(1, 10),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PendingFilesList />
    </HydrationBoundary>
  );
};

export default PendingFilesPage;
