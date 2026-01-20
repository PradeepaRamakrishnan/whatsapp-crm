import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getAllConfiguration } from '@/features/campaigns/services';
import Configuration from '@/features/configuration/components/configuration';

const AgentConfigurationPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['configurations'],
    queryFn: () => getAllConfiguration(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Configuration />
    </HydrationBoundary>
  );
};

export default AgentConfigurationPage;
