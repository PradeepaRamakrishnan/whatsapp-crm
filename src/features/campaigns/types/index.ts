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
