import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { OverviewCharts } from '@/features/dashboard/components/overview-charts';
import { OverviewStats } from '@/features/dashboard/components/overview-stats';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import {
  getLeadsChartData,
  getOverviewCounts,
  getRecentActivity,
} from '@/features/dashboard/services';

const OverviewPage = async () => {
  const queryClient = new QueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['overview-counts'],
      queryFn: () => getOverviewCounts(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['leads-chart'],
      queryFn: () => getLeadsChartData(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['recent-activity', { limit: 5 }],
      queryFn: () => getRecentActivity(5),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="mt-1 text-muted-foreground">
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
