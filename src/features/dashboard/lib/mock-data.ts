import type { CampaignPerformanceStat } from '@/features/campaigns/types';
import type { LeadChartData, RecentActivityItem } from '../types/dashboard.type';

export const MOCK_OVERVIEW_COUNTS = {
  totalFiles: 8,
  totalCampaigns: 5,
  totalLeads: 142,
  conversionRate: '18.5%',
};

export const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: 'mock-1',
    name: 'Q1 Loan Recovery Drive',
    description: 'Outreach to overdue loan holders for Q1 settlement',
    status: 'active',
    sent: 1240,
    leads: 87,
    rate: '7.0%',
  },
  {
    id: 'mock-2',
    name: 'February Settlement Offers',
    description: 'Special settlement discounts for February batch',
    status: 'completed',
    sent: 980,
    leads: 55,
    rate: '5.6%',
  },
  {
    id: 'mock-3',
    name: 'NBFC Credit Card Recovery',
    description: 'Credit card overdue recovery for partner NBFCs',
    status: 'paused',
    sent: 430,
    leads: 0,
    rate: '0.0%',
  },
];

export const MOCK_LEADS_CHART: LeadChartData[] = [
  { date: '2026-03-01', count: 12 },
  { date: '2026-03-02', count: 8 },
  { date: '2026-03-03', count: 19 },
  { date: '2026-03-04', count: 15 },
  { date: '2026-03-05', count: 22 },
  { date: '2026-03-06', count: 17 },
];

export const MOCK_CAMPAIGN_PERFORMANCE: CampaignPerformanceStat[] = [
  { month: 'Jan 2026', email: 420, sms: 310, whatsapp: 680 },
  { month: 'Feb 2026', email: 380, sms: 290, whatsapp: 720 },
  { month: 'Mar 2026', email: 210, sms: 140, whatsapp: 390 },
];
