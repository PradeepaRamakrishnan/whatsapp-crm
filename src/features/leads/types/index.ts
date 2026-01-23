export interface Lead {
  id: string;
  customerName: string;
  status: string;
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  contact: {
    id: string;
    status: string;
  };
  fileContent: {
    id: string;
    customerName: string;
    emailId: string;
    mobileNumber: string;
    settlementAmount?: number;
    settlementCount?: number;
  };
  interestedAt: string;
  consentGivenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadsResponse {
  data: Lead[];
  meta: LeadsMeta;
  stats: {
    totalInterested: number;
    newToday: number;
    avgResponseTime: string;
    followUpsDue: number;
  };
}
