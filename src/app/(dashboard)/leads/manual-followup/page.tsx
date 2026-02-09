import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import ManualFollowup from '@/features/leads/components/manual-followup';
import { getManualFollowups } from '@/features/leads/services';

export const metadata: Metadata = {
  title: 'Manual Follow-up Cases',
  description:
    'View and manage cases that require manual follow-ups to ensure timely actions and resolutions.',
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ManualFollowupPage = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();

  const { page, pageSize, search } = await searchParams;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(pageSize) || 10;
  const searchTerm = typeof search === 'string' ? search : undefined;

  await queryClient.prefetchQuery({
    queryKey: ['manual-followups', { page: pageNumber, limit: limitNumber, search: searchTerm }],
    queryFn: () => getManualFollowups(pageNumber, limitNumber, searchTerm),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ManualFollowup />
    </HydrationBoundary>
  );
};

export default ManualFollowupPage;
