import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { CampaignsList } from '@/features/campaigns/components/campaigns-list';
import { getAllCampaigns } from '@/features/campaigns/services';

export const metadata: Metadata = {
  title: 'Campaign List',
  description:
    'View and manage all your marketing campaigns. Track performance, monitor status, and analyze results.',
};

type PageProps = {
  params: { category: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const CampaignListPage = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();

  const { page, pageSize } = await searchParams;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(pageSize) || 10;

  try {
    await queryClient.prefetchQuery({
      queryKey: ['campaigns', { page: pageNumber, limit: limitNumber }],
      queryFn: () => getAllCampaigns(pageNumber, limitNumber),
    });
  } catch {
    // API unavailable — client will refetch on mount
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CampaignsList />
    </HydrationBoundary>
  );
};

export default CampaignListPage;
