export type FileStatus =
  | 'uploaded'
  | 'queued'
  | 'processing'
  | 'pending_review'
  | 'reviewed'
  | 'archived'
  | 'failed';

export interface FileErrorDetails {
  message: string;
  missingColumns?: string[];
  invalidRows?: { row: number; errors: string[] }[];
}

export interface FileData {
  id: string;
  name: string;
  bankName: string;
  status: FileStatus;
  jobId: string | null;
  errorDetails: FileErrorDetails | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilesResponse {
  data: FileData[];
  meta: FilesMeta;
}

export interface ChannelStatus {
  sent: boolean;
  sentAt: string | null;
  deliveredAt: string | null;
}

export interface CampaignChannels {
  sms: ChannelStatus;
  email: ChannelStatus;
  whatsapp: ChannelStatus;
}

export interface CampaignReference {
  id: string;
  name: string;
  responseStatus: string | null;
  lastRun?: string;
  channels?: CampaignChannels;
}

export interface FileRecord {
  id: string;
  customerName: string;
  settlementAmount: number;
  mobileNumber: string;
  emailId: string;
  contactStatus?: 'interested' | 'not_interested' | null;
  additionalData: Record<string, string | number>;
  isValid: boolean;
  validationErrors: string[] | null;
  campaigns: CampaignReference[];
  createdAt: string;
  updatedAt: string;
}

export interface FileRecordsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileContents {
  data: FileRecord[];
  meta: FileRecordsMeta;
}

export interface FileStats {
  totalRecords: number;
  totalInvalidRecords: number;
  duplicateEmailInCampaign: number;
  duplicateMobileInCampaign: number;
  excludedCount: number;
}

export interface FileDetailData extends FileData {
  stats: FileStats;
  contents: FileContents;
}
