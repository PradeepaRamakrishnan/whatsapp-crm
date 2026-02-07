import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { LeadDetailsPage } from '@/features/leads/components/lead-details-page';
import { getCompaignById } from '@/features/leads/services';
import type { LeadsResponse } from '@/features/leads/types';

type PageProps = {
  params: Promise<{ id: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: idArray } = await params;
  const id = idArray?.[idArray.length - 1];

  if (!id) return { title: 'Lead Details' };

  try {
    const leadResponse = await getCompaignById(id);
    const lead = (leadResponse as LeadsResponse)?.data?.[0] || leadResponse;

    return {
      title: `${lead.customerName} | Lead Details`,
      description: `Viewing details for lead ${lead.customerName}`,
    };
  } catch (error) {
    console.error('Error prefetching campaign data:', error);
    return { title: 'Lead Details' };
  }
}

const LeadDetails = async ({ params }: PageProps) => {
  const { id: idArray } = await params;
  const id = idArray?.[idArray.length - 1];

  if (!id) return <div>Invalid Lead ID</div>;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCompaignById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeadDetailsPage leadId={id} />
    </HydrationBoundary>
  );
};

export default LeadDetails;
