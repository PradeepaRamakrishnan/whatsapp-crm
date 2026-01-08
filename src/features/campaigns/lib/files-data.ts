export type FileData = {
  id: string;
  fileName: string;
  bankName: string;
  status: 'valid' | 'invalid';
  uploadedDate: string;
  totalRows: number;
};

export const filesData: FileData[] = [
  {
    id: '1',
    fileName: 'ICICI Borrowers Jan 2026',
    bankName: 'ICICI Bank',
    status: 'valid',
    uploadedDate: '2026-01-07T10:30:00',
    totalRows: 1189,
  },
  {
    id: '2',
    fileName: 'HDFC Customers Dec 2025',
    bankName: 'HDFC Bank',
    status: 'invalid',
    uploadedDate: '2026-01-06T14:20:00',
    totalRows: 856,
  },
  {
    id: '3',
    fileName: 'SBI Leads Q4 2025',
    bankName: 'State Bank of India',
    status: 'valid',
    uploadedDate: '2026-01-05T09:15:00',
    totalRows: 2340,
  },
  {
    id: '4',
    fileName: 'Axis Bank Data',
    bankName: 'Axis Bank',
    status: 'valid',
    uploadedDate: '2026-01-04T16:45:00',
    totalRows: 567,
  },
  {
    id: '5',
    fileName: 'Kotak Borrowers',
    bankName: 'Kotak Mahindra Bank',
    status: 'invalid',
    uploadedDate: '2026-01-03T11:30:00',
    totalRows: 423,
  },
];
