import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Configuration from '@/features/configuration/components/configuration';
import { getAllConfiguration } from '@/features/settings/services';

const AgentConfigurationPage = async () => {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['configurations'],
      queryFn: () => getAllConfiguration(),
    });
  } catch {
    // API unavailable — client will refetch on mount
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Configuration />
    </HydrationBoundary>
  );
};

export default AgentConfigurationPage;
