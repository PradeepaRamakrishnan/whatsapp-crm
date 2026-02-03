export interface RecentActivityItem {
  id: string;
  name: string;
  status: string;
  sent: number;
  leads: number;
  rate: string;
}

export interface LeadChartData {
  date: string;
  count: number;
}
