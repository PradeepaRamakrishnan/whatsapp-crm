export interface CampaignData {
  id: number;
  name: string;
  status: string;
  responseRate: number;
  createdDate: string;
  scheduledDate: string;
  bankName: string;
  borrowerCount: number;
}

export const campaignsData: CampaignData[] = [
  {
    id: 1,
    name: 'ICICI Bank Borrowers List Jan 2026',
    status: 'Active',
    responseRate: 18.5,
    createdDate: '2026-01-10',
    scheduledDate: '2026-01-15',
    bankName: 'ICICI Bank',
    borrowerCount: 1250,
  },
  {
    id: 2,
    name: 'HDFC Bank Borrowers List Jan 2026',
    status: 'Active',
    responseRate: 22.3,
    createdDate: '2026-01-12',
    scheduledDate: '2026-01-18',
    bankName: 'HDFC Bank',
    borrowerCount: 856,
  },
  {
    id: 3,
    name: 'SBI Bank Borrowers List Jan 2026',
    status: 'Completed',
    responseRate: 65.2,
    createdDate: '2026-01-08',
    scheduledDate: '2026-01-12',
    bankName: 'SBI',
    borrowerCount: 2340,
  },
  {
    id: 4,
    name: 'Axis Bank Borrowers List Jan 2026',
    status: 'Draft',
    responseRate: 0,
    createdDate: '2026-01-15',
    scheduledDate: '2026-01-20',
    bankName: 'Axis Bank',
    borrowerCount: 567,
  },
];
