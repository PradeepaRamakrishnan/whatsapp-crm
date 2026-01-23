import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { InterestedLeadsList } from '@/features/leads/components/interested-leads-list';
import { getAllLeads } from '@/features/leads/services';

export const metadata: Metadata = {
  title: 'Interested Leads',
  description: 'View and manage all leads who have shown interest in your services.',
};

type PageProps = {
  params: { category: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const InterestedLeadsPage = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();

  const { page, pageSize } = await searchParams;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(pageSize) || 10;

  await queryClient.prefetchQuery({
    queryKey: ['leads', { page: pageNumber, limit: limitNumber }],
    queryFn: () => getAllLeads(pageNumber, limitNumber),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InterestedLeadsList />
    </HydrationBoundary>
  );
};

export default InterestedLeadsPage;
