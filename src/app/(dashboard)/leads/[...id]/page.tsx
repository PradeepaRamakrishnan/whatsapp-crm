import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { LeadDetailsPage } from '@/features/leads/components/lead-details-page';
import { getLeadsById } from '@/features/leads/services';
import type { LeadsResponse } from '@/features/leads/types';

interface DetailPageProps {
  params: Promise<{ id: string[] }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id: idArray } = await params;
  const id = idArray?.[idArray.length - 1];

  if (!id) return { title: 'Lead Details' };

  try {
    const leadResponse = await getLeadsById(id);
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

export default async function DetailPage({ params }: DetailPageProps) {
  const { id: idArray } = await params;
  const id = idArray?.[idArray.length - 1];

  if (!id) return <div>Invalid Lead ID</div>;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['lead', id],
    queryFn: () => getLeadsById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeadDetailsPage leadId={id} />
    </HydrationBoundary>
  );
}
