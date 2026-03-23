import type { Template, WhatsAppTemplate } from '@/features/settings/types';

export type CampaignStatus =
  | 'active'
  | 'running'
  | 'paused'
  | 'failed'
  | 'completed'
  | 'pending'
  | 'draft'
  | 'scheduled';

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
  messageSent?: {
    total: number;
    email: number;
    sms: number;
    whatsapp: number;
  };
  interested?: number;
  responseRate?: number;
  totalContacts?: number;
  contactMessageSent?: {
    total: number;
    sent: number;
    pending: number;
  };
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

export interface ChannelStatus {
  id?: string | null;
  sent: boolean;
  sentAt?: string | null;
  delivered?: boolean;
  deliveredAt?: string | null;
  bounced?: boolean;
  bouncedAt?: string | null;
  read?: boolean;
  readAt?: string | null;
  error?:
    | string
    | {
        code?: string[];
        message?: string;
        timestamp?: string;
      }
    | null;
}

export interface CallingStatus {
  sent: boolean;
  sentAt?: string | null;
  sessionId?: string | null;
  callUuid?: string | null;
  error?: string | null;
}

export interface ChannelMessageStats {
  sent: number;
  pending: number;
}

export interface ContactMessageSent {
  totalContacts: number;
  email: ChannelMessageStats;
  sms: ChannelMessageStats;
  whatsapp: ChannelMessageStats;
}

export interface CampaignFile {
  id: string;
  name: string;
  source: string;
  status: string;
}

export interface FileContentStats {
  totalRecords?: number;
  validRecords?: number;
  invalidRecords: number;
  duplicateRecords: number;
  excludedRecords: number;
}

export interface ExecutionSummary {
  totalContacts: number;
  successful: {
    email: number;
    sms: number;
    whatsapp: number;
  };
  skipped: {
    duplicateEmail: number;
    duplicatePhone: number;
    alreadySent: {
      email: number;
      sms: number;
      whatsapp: number;
    };
    notWhitelisted: {
      email: number;
      sms: number;
      whatsapp: number;
    };
    campaignPaused: {
      email: number;
      sms: number;
      whatsapp: number;
    };
  };
  failed: {
    email: number;
    sms: number;
    whatsapp: number;
    details: Array<{
      channel: string;
      reason: string;
      count: number;
    }>;
  };
}

export interface ChannelOrderStep {
  channel: 'email' | 'sms' | 'whatsapp';
  templateId: string;
  delayMs: number;
  enabled: boolean;
}

export interface CampaignDetails {
  id: string;
  name: string;
  description: string;
  file: CampaignFile;
  status: CampaignStatus;
  totalContacts: number;
  uniqueEmail?: number;
  uniqueMobile?: number;
  fileContentStats: FileContentStats;
  interested: number;
  responseRate: number;
  messageSent: MessageSentStats;
  contactMessageSent: ContactMessageSent;
  channelOrder?: ChannelOrderStep[];
  lastRunAt?: string | null;
  executionSummary?: ExecutionSummary | null;
  createdAt: string;
  updatedAt: string;
}

// API returns campaign data directly, not wrapped
export type CampaignDetailsResponse = CampaignDetails;

// Campaign Contacts Types
export interface CampaignContactData {
  id: string;
  campaign: { id: string };
  contact: {
    id: string;
    customerName: string;
    mobileNumber: string;
    emailId: string;
  };
  status: string;
  responseStatus: 'interested' | 'not_interested' | null;
  email: ChannelStatus;
  sms: ChannelStatus;
  whatsapp: ChannelStatus;
  calling: CallingStatus;
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
  emailDelivered: string | number;
  emailBounced: string | number;
  smsSent: string | number;
  smsDelivered: string | number;
  smsBounced: string | number;
  whatsappSent: string | number;
  whatsappDelivered: string | number;
  whatsappBounced: string | number;
  callingSent: string | number;
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

export interface ChannelOrderItem {
  channel: 'email' | 'sms' | 'whatsapp';
  delayMs: number;
  enabled: boolean;
}

export type ManualAction = 'call' | 'manual_whatsapp' | 'manual_email' | 'visit';

export interface CampaignSequenceStep {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'manual';
  templateId: string;
  delayValue: number;
  delayUnit: 'minutes' | 'hours' | 'days';
  manualAction?: ManualAction;
}

export interface Configuration {
  id: string;
  emailTemplate?: Template;
  smsTemplate?: Template | null;
  whatsappTemplate?: WhatsAppTemplate;
  schedulerId?: string | null;
  cronPattern?: string;
  frequency?: number;
  interval?: number;
  schedulerEnabled?: boolean;
  jobId?: string | null;
  channelOrder?: ChannelOrderItem[];
  sequence?: CampaignSequenceStep[];
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
    email: ChannelStatus;
    sms: ChannelStatus;
    whatsapp: ChannelStatus;
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
  channel: 'email' | 'sms' | 'whatsapp' | 'call' | 'note';
  direction: 'inbound' | 'outbound';
  status: string;
  subject: string | null;
  body: string | null;
  from: string;
  to: string;
  sentAt: string | null;
  deliveredAt: string | null;
  bouncedAt: string | null;
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

export interface CampaignPerformanceStat {
  month: string;
  email: number;
  sms: number;
  whatsapp: number;
}
