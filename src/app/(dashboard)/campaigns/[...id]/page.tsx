import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CampaignDetailsPage } from '@/features/campaigns/components/campaign-details-page';
import {
  getCampaignById,
  getCampaignContacts,
  getCampaignTimeline,
  getContactMessages,
} from '@/features/campaigns/services';

export const metadata = {
  title: 'Campaign Details',
  description: 'View campaign details and analytics',
};

interface CampaignDetailRouteProps {
  params: Promise<{
    id: string[];
  }>;
}

const CampaignDetailRoute = async ({ params }: CampaignDetailRouteProps) => {
  const { id } = await params;

  // Campaign detail route - use last segment as campaign ID
  const campaignId = id[id.length - 1];

  console.info('Campaign ID from URL:', campaignId);
  console.info('Full URL segments:', id);

  const queryClient = new QueryClient();

  try {
    // Prefetch campaign details
    await queryClient.prefetchQuery({
      queryKey: ['campaign', campaignId],
      queryFn: () => getCampaignById(campaignId),
    });

    // Prefetch campaign contacts
    await queryClient.prefetchQuery({
      queryKey: ['campaign-contacts', campaignId, { page: 1, limit: 10 }],
      queryFn: () => getCampaignContacts(campaignId, 1, 10),
    });

    await queryClient.prefetchQuery({
      queryKey: ['campaign-conversation', campaignId],
      queryFn: () => getContactMessages(campaignId),
    });

    // Prefetch campaign timeline
    await queryClient.prefetchQuery({
      queryKey: ['campaign-timeline', campaignId],
      queryFn: () => getCampaignTimeline(campaignId),
    });
  } catch (error) {
    console.error('Error prefetching campaign data:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CampaignDetailsPage campaignId={campaignId} />
    </HydrationBoundary>
  );
};

export default CampaignDetailRoute;
