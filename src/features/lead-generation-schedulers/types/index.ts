export type ScheduleType = 'daily' | 'weekly' | 'monthly';

export interface LeadGenerationScheduler {
  id: string;
  name: string;
  leadType: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  scheduleType: ScheduleType;
  cronPattern: string;
  scheduledHour: number;
  scheduledMinute: number;
  scheduledDay?: number;
  isEnabled: boolean;
  lastRunAt?: string;
  totalLeadsGenerated: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchedulersResponse {
  data: LeadGenerationScheduler[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSchedulerPayload {
  name: string;
  leadType: string;
  state: string;
  stateCode: string; // auto-filled from API, not typed by user
  country: string;
  countryCode: string; // auto-filled from API, not typed by user
  scheduleType: ScheduleType;
  scheduledHour: number;
  scheduledMinute: number;
  scheduledDay?: number;
}

export interface UpdateSchedulerPayload {
  name?: string;
  leadType?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  countryCode?: string;
  scheduleType?: ScheduleType;
  scheduledHour?: number;
  scheduledMinute?: number;
  scheduledDay?: number;
  isEnabled?: boolean;
}

export interface GetSchedulersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isEnabled?: boolean;
}
