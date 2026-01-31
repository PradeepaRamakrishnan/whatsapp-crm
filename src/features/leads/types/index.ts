export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  size: string;
}

export interface Lead {
  id: string;
  customerName: string;
  status: string;
  campaign: {
    id: string;
    name: string;
    status: string;
    fileName?: string;
    bankName?: string;
  };
  contact: {
    id: string;
    status: string;
    email?: {
      sent: boolean;
      sentAt?: string;
      deliveredAt?: string;
      bouncedAt?: string;
    };
    sms?: {
      sent: boolean;
      sentAt?: string;
    };
    whatsapp?: {
      sent: boolean;
      sentAt?: string;
    };
  };
  fileContent: {
    id: string;
    customerName: string;
    emailId: string;
    mobileNumber: string;
    settlementAmount?: number;
    settlementCount?: number;
  };
  email?: {
    sent: boolean;
    sentAt?: string;
  };
  sms?: {
    sent: boolean;
    sentAt?: string;
  };
  whatsapp?: {
    sent: boolean;
    sentAt?: string;
  };
  interestedAt: string;
  from?: string;
  consentGivenAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
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
