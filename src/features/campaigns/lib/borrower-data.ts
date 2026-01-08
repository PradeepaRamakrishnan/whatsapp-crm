// Borrower data types and mock data for campaigns

export type BorrowerData = {
  id: number;
  name: string;
  email: string;
  phone: string;
  loanAmount: number;
  loanType: string;
  creditScore: number;
  status: string;
  applicationDate: string;
};

// Mock borrower data for campaign display
export const borrowersData: BorrowerData[] = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    loanAmount: 500000,
    loanType: 'Personal Loan',
    creditScore: 750,
    status: 'Active',
    applicationDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43211',
    loanAmount: 750000,
    loanType: 'Business Loan',
    creditScore: 720,
    status: 'Pending',
    applicationDate: '2024-01-16',
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 98765 43212',
    loanAmount: 1000000,
    loanType: 'Home Loan',
    creditScore: 680,
    status: 'Approved',
    applicationDate: '2024-01-17',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phone: '+91 98765 43213',
    loanAmount: 300000,
    loanType: 'Personal Loan',
    creditScore: 700,
    status: 'Active',
    applicationDate: '2024-01-18',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 98765 43214',
    loanAmount: 850000,
    loanType: 'Business Loan',
    creditScore: 760,
    status: 'Approved',
    applicationDate: '2024-01-19',
  },
  {
    id: 6,
    name: 'Anjali Gupta',
    email: 'anjali.gupta@example.com',
    phone: '+91 98765 43215',
    loanAmount: 450000,
    loanType: 'Personal Loan',
    creditScore: 690,
    status: 'Rejected',
    applicationDate: '2024-01-20',
  },
  {
    id: 7,
    name: 'Rahul Mehta',
    email: 'rahul.mehta@example.com',
    phone: '+91 98765 43216',
    loanAmount: 1200000,
    loanType: 'Home Loan',
    creditScore: 770,
    status: 'Active',
    applicationDate: '2024-01-21',
  },
  {
    id: 8,
    name: 'Deepika Joshi',
    email: 'deepika.joshi@example.com',
    phone: '+91 98765 43217',
    loanAmount: 600000,
    loanType: 'Business Loan',
    creditScore: 710,
    status: 'Pending',
    applicationDate: '2024-01-22',
  },
  {
    id: 9,
    name: 'Suresh Nair',
    email: 'suresh.nair@example.com',
    phone: '+91 98765 43218',
    loanAmount: 400000,
    loanType: 'Personal Loan',
    creditScore: 730,
    status: 'Approved',
    applicationDate: '2024-01-23',
  },
  {
    id: 10,
    name: 'Kavita Desai',
    email: 'kavita.desai@example.com',
    phone: '+91 98765 43219',
    loanAmount: 950000,
    loanType: 'Home Loan',
    creditScore: 740,
    status: 'Active',
    applicationDate: '2024-01-24',
  },
];
