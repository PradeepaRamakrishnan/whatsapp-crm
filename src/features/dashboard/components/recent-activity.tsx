'use client';

import { useQuery } from '@tanstack/react-query';
// import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getRecentActivity } from '@/features/dashboard/services';
import type { RecentActivityItem } from '../types/dashboard.type';

export function RecentActivity() {
  const { data: campaigns = [], isLoading } = useQuery<RecentActivityItem[]>({
    queryKey: ['recent-activity', { limit: 5 }],
    queryFn: () => getRecentActivity(5),
  });

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'active':
  //       return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
  //     case 'running':
  //       return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
  //     case 'paused':
  //       return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
  //     case 'completed':
  //       return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  //     default:
  //       return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  //   }
  // };

  return (
    <div>
      <div className="mb-4">
        <div className="text-lg font-semibold">Recent Campaign Activity</div>
        <div className="text-sm text-muted-foreground">Latest campaigns and their performance</div>
      </div>
      <div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Response Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      {/* <TableCell>
                        <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell> */}
                      <TableCell>{campaign.description}</TableCell>
                      <TableCell className="text-right">{campaign.sent.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {campaign.leads.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{campaign.rate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No recent activity
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
