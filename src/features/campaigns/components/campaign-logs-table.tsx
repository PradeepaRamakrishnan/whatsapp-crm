import dayjs from 'dayjs';

export interface CampaignLog {
  id: string;
  campaign: string;
  status: 'Success' | 'Failed' | 'Pending';
  runAt: string;
  details: string;
}

const statusColor = {
  Success: 'text-green-400',
  Failed: 'text-red-400',
  Pending: 'text-yellow-400',
};

interface CampaignLogsTableProps {
  logs: CampaignLog[];
}

export function CampaignLogsTable({ logs }: CampaignLogsTableProps) {
  // ...existing code...

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 font-mono text-sm max-h-[500px] overflow-y-auto bg-black">
      {logs.length === 0 && <div className="text-muted-foreground">No logs found.</div>}
      {logs.map((log) => (
        <div key={log.id} className="mb-1 whitespace-pre-wrap">
          <span className="text-gray-500">{dayjs(log.runAt).format('YYYY-MM-DD HH:mm:ss')}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="font-bold text-blue-300">{log.campaign}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className={`${statusColor[log.status]} font-semibold`}>{log.status}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-200">{log.details}</span>
        </div>
      ))}
    </div>
  );
}
