import type { Metadata } from 'next';
import type { CampaignLog } from '@/features/campaigns/components/campaign-logs-table';
import { CampaignLogsTable } from '@/features/campaigns/components/campaign-logs-table';

export const metadata: Metadata = {
  title: 'Campaign Logs',
  description:
    'View detailed logs of campaign executions. Monitor when campaigns were run, with timestamps and status updates, in a CloudWatch-inspired interface.',
};

const mockLogs: CampaignLog[] = [
  {
    id: '1',
    campaign: 'Campaign #1024',
    status: 'Success',
    runAt: '2026-01-19T14:23:00Z',
    details: 'Execution completed. 1,200 recipients processed.',
  },
  {
    id: '2',
    campaign: 'Campaign #1023',
    status: 'Failed',
    runAt: '2026-01-18T10:05:00Z',
    details: 'SMTP connection error. Automatic retry scheduled.',
  },
  {
    id: '3',
    campaign: 'Campaign #1022',
    status: 'Success',
    runAt: '2026-01-15T08:45:00Z',
    details: 'Execution completed. 900 recipients processed.',
  },
  {
    id: '4',
    campaign: 'Campaign #1021',
    status: 'Pending',
    runAt: '2026-01-14T12:00:00Z',
    details: 'Scheduled for execution.',
  },
];

export default function CampaignLogsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Campaign Logs</h1>
      <CampaignLogsTable logs={mockLogs} />
    </div>
  );
}
