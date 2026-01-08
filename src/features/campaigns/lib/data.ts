export interface CampaignData {
  id: number;
  name: string;
  status: string;
  responseRate: number;
  createdDate: string;
  scheduledDate: string;
  bankName: string;
}

export const campaignsData: CampaignData[] = [
  {
    id: 1,
    name: 'Rejected Borrowers Re-engagement',
    status: 'Active',
    responseRate: 18.5,
    createdDate: '2024-01-10',
    scheduledDate: '2024-01-15',
    bankName: 'HDFC Bank',
  },
  {
    id: 2,
    name: 'High Priority Rejected Pool',
    status: 'Active',
    responseRate: 22.3,
    createdDate: '2024-01-12',
    scheduledDate: '2024-01-18',
    bankName: 'ICICI Bank',
  },
  {
    id: 3,
    name: 'Pending Validation Follow-up',
    status: 'Completed',
    responseRate: 65.2,
    createdDate: '2024-01-08',
    scheduledDate: '2024-01-12',
    bankName: 'SBI',
  },
  {
    id: 4,
    name: 'Critical Rejected Recovery',
    status: 'Active',
    responseRate: 28.4,
    createdDate: '2024-01-15',
    scheduledDate: '2024-01-20',
    bankName: 'Axis Bank',
  },
  {
    id: 5,
    name: 'Eligible Pool Outreach',
    status: 'Completed',
    responseRate: 72.5,
    createdDate: '2024-01-05',
    scheduledDate: '2024-01-10',
    bankName: 'HDFC Bank',
  },
  {
    id: 6,
    name: 'Second Chance Campaign',
    status: 'Scheduled',
    responseRate: 0,
    createdDate: '2024-01-20',
    scheduledDate: '2024-02-01',
    bankName: 'Kotak Mahindra',
  },
  {
    id: 7,
    name: 'Monthly Borrower Outreach',
    status: 'Draft',
    responseRate: 0,
    createdDate: '2024-01-22',
    scheduledDate: '2024-02-05',
    bankName: 'ICICI Bank',
  },
  {
    id: 8,
    name: 'Premium Eligible Pool',
    status: 'Active',
    responseRate: 78.3,
    createdDate: '2024-01-18',
    scheduledDate: '2024-01-23',
    bankName: 'HDFC Bank',
  },
  {
    id: 9,
    name: 'Rejected Recovery Program',
    status: 'Completed',
    responseRate: 15.8,
    createdDate: '2024-01-08',
    scheduledDate: '2024-01-15',
    bankName: 'SBI',
  },
  {
    id: 10,
    name: 'New Year Re-application',
    status: 'Completed',
    responseRate: 24.2,
    createdDate: '2023-12-28',
    scheduledDate: '2024-01-01',
    bankName: 'Axis Bank',
  },
  {
    id: 11,
    name: 'Pending Validation Reminder',
    status: 'Scheduled',
    responseRate: 0,
    createdDate: '2024-01-25',
    scheduledDate: '2024-02-10',
    bankName: 'Kotak Mahindra',
  },
  {
    id: 12,
    name: 'Document Upload Campaign',
    status: 'Active',
    responseRate: 32.1,
    createdDate: '2024-01-19',
    scheduledDate: '2024-01-24',
    bankName: 'HDFC Bank',
  },
];
