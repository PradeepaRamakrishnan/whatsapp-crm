export interface Note {
  id: string;
  type: 'note' | 'message';
  content: string;
  timestamp: string;
  author: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  size: string;
}

export interface LeadData {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  status: 'Processing' | 'In review' | 'Eligible';
  createdDate: string;
  loanAmountRequested: number;
  settlementCount: number;
  notes?: Note[];
  documents?: Document[];
}

export const interestedLeadsData: LeadData[] = [
  {
    id: 1,
    name: 'Ankit Sharma',
    phoneNumber: '9876543210',
    email: 'ankit.sharma@gmail.com',
    status: 'Processing',
    createdDate: '2026-01-05T10:30:00Z',
    loanAmountRequested: 500000,
    settlementCount: 0,
  },
  {
    id: 2,
    name: 'Priya Verma',
    phoneNumber: '9123456789',
    email: 'priya.verma@gmail.com',
    status: 'Processing',
    createdDate: '2026-01-06T14:20:00Z',
    loanAmountRequested: 1000000,
    settlementCount: 1,
  },
  {
    id: 3,
    name: 'Rahul Gupta',
    phoneNumber: '8887776665',
    email: 'rahul.gupta@gmail.com',
    status: 'Eligible',
    createdDate: '2026-01-07T09:15:00Z',
    loanAmountRequested: 250000,
    settlementCount: 2,
  },
  {
    id: 4,
    name: 'Sonal Singh',
    phoneNumber: '7766554433',
    email: 'sonal.singh@gmail.com',
    status: 'Eligible',
    createdDate: '2026-01-08T16:45:00Z',
    loanAmountRequested: 750000,
    settlementCount: 1,
  },
  {
    id: 5,
    name: 'Vikram Aditya',
    phoneNumber: '9988776655',
    email: 'vikram.aditya@gmail.com',
    status: 'Processing',
    createdDate: '2026-01-08T11:00:00Z',
    loanAmountRequested: 1500000,
    settlementCount: 3,
  },
];
