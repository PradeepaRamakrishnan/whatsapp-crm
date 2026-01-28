export type CampaignStatus = 'active' | 'running' | 'paused' | 'failed' | 'completed';

export interface CampaignErrorDetails {
  message: string;
}

export interface CampaignData {
  id: string;
  name: string;
  description: string;
  fileId: string;
  status: CampaignStatus;
  lastRunAt?: string;
  errorDetails?: CampaignErrorDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignsStats {
  active: number;
  running: number;
  paused: number;
  failed: number;
}

export interface CampaignsResponse {
  data: CampaignData[];
  meta: CampaignsMeta;
  stats: CampaignsStats;
}

// Campaign Details Types
export interface MessageSentStats {
  total: number;
  email: number;
  sms: number;
  whatsapp: number;
}

export interface ContactMessageSent {
  total: number;
  sent: number;
  pending: number;
}

export interface CampaignFile {
  id: string;
  name: string;
  bankName: string;
  status: string;
}

export interface FileContentStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
}

export interface CampaignDetails {
  id: string;
  name: string;
  description: string;
  file: CampaignFile;
  status: CampaignStatus;
  totalContacts: number;
  fileContentStats: FileContentStats;
  interested: number;
  responseRate: number;
  messageSent: MessageSentStats;
  contactMessageSent: ContactMessageSent;
  createdAt: string;
  updatedAt: string;
}

// API returns campaign data directly, not wrapped
export type CampaignDetailsResponse = CampaignDetails;

// Campaign Contacts Types
export interface CampaignContactData {
  id: string;
  campaign: {
    id: string | Record<string, unknown>;
  };
  contact: {
    id: string;
    customerName: string;
    settlementAmount: number;
    mobileNumber: string;
    emailId: string;
  };
  status: string;
  responseStatus: 'interested' | 'not_interested' | null;
  email: {
    sent: boolean;
    sentAt?: string;
  };
  sms: {
    sent: boolean;
  };
  whatsapp: {
    sent: boolean;
  };
  lead?: {
    id: string;
    interestedAt: string;
    consentGivenAt: string | null;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignContactsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignContactsStats {
  pending: string | number;
  processing: string | number;
  completed: string | number;
  failed: string | number;
  emailSent: string | number;
  smsSent: string | number;
  whatsappSent: string | number;
  interested: string | number;
  notInterested: string | number;
}

export interface CampaignContactsResponse {
  data: CampaignContactData[];
  meta: CampaignContactsMeta;
  stats: CampaignContactsStats;
}

// Campaign Timeline Types
export interface CampaignTimelineData {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  metadata: {
    contactCount?: number;
    bankName?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}

export interface CampaignTimelineResponse {
  data: CampaignTimelineData[];
}

// Configuration Types
export interface TemplateContent {
  subject?: string;
  body?: string;
  [key: string]: unknown;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'whatsapp';
  content: TemplateContent;
  status: 'approved' | 'pending' | 'rejected';
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Configuration {
  id: string;
  emailTemplate?: ConfigTemplate;
  smsTemplate?: ConfigTemplate;
  whatsappTemplate?: ConfigTemplate;
  schedulerId?: string;
  cronPattern?: string;
  frequency?: number;
  interval?: number;
  schedulerEnabled?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationResponse {
  data: Configuration[];
}

export interface InteractionRecord {
  id: string;
  campaign: {
    id: string;
    name: string;
    description: string;
    file: string;
    status: CampaignStatus;
    lastRunAt: string | null;
    errorDetails: Record<string, unknown>;
    interested: number;
    messageSent: MessageSentStats;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  campaignContact: {
    id: string;
    campaign: string;
    contact: string;
    status: string;
    responseStatus: 'interested' | 'not_interested' | null;
    email: { sent: boolean; sentAt: string | null };
    sms: { sent: boolean; sentAt: string | null };
    whatsapp: { sent: boolean; sentAt: string | null };
    lead: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  contact: {
    id: string;
    file: string;
    customerName: string;
    settlementAmount: number;
    mobileNumber: string;
    emailId: string;
    additionalData: Record<string, unknown>;
    isValid: boolean;
    validationErrors: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  channel: 'email' | 'sms' | 'whatsapp' | 'call';
  direction: 'inbound' | 'outbound';
  status: string;
  subject: string | null;
  body: string | null;
  from: string;
  to: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  callDuration: number | null;
  callOutcome: string | null;
  callNotes: string | null;
  recordingUrl: string | null;
  error:
    | string
    | {
        code: string;
        message: string;
        timestamp: string;
      }
    | null;
  metadata: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InteractionResponse {
  data: InteractionRecord[];
  meta: {
    total: number;
    page: string | number;
    limit: string | number;
    totalPages: number;
  };
}
