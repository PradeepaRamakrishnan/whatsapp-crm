import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { TemplatesList } from '@/features/campaigns/components/templates-list';
import type { TemplateChannel } from '@/features/campaigns/types/template.types';
import { getAllTemplates } from '@/features/settings/services';

export const metadata: Metadata = {
  title: 'Template Management',
  description: 'Manage message templates for all communication channels.',
};

type PageProps = {
  params: { category: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const CampaignTemplatesPage = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();

  const { activeTab } = await searchParams;

  const tab = (activeTab as TemplateChannel | 'all' | 'by-bank') || 'all';

  await queryClient.prefetchQuery({
    queryKey: ['templates', tab],
    queryFn: () => getAllTemplates(tab),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TemplatesList />
    </HydrationBoundary>
  );
};

export default CampaignTemplatesPage;
