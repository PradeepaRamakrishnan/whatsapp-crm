import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { OverviewCharts } from '@/features/dashboard/components/overview-charts';
import { OverviewStats } from '@/features/dashboard/components/overview-stats';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { getOverviewCounts } from '@/features/dashboard/services';

const OverviewPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['overview-counts'],
    queryFn: () => getOverviewCounts(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Overview</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Your campaign performance and analytics at a glance
          </p>
        </div>

        <OverviewStats />

        <OverviewCharts />

        <RecentActivity />
      </div>
    </HydrationBoundary>
  );
};

export default OverviewPage;
