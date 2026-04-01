import axios, { AxiosError } from 'axios';
import { API_URLS } from '@/lib/api-urls';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  CreateSchedulerPayload,
  GetSchedulersQuery,
  LeadGenerationScheduler,
  ScheduleAllUSStatesPayload,
  SchedulersResponse,
  UpdateSchedulerPayload,
} from '../types';

const BASE_URL = API_URLS.leadGenerationSchedulers;

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

function handleError(error: unknown, fallback: string): never {
  if (error instanceof AxiosError) {
    throw new Error(error.response?.data?.message || fallback);
  }
  throw error;
}

export async function getSchedulers(query: GetSchedulersQuery): Promise<SchedulersResponse> {
  try {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.isEnabled !== undefined) params.set('isEnabled', String(query.isEnabled));

    const res = await client.get(`/?${params}`, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to fetch schedulers');
  }
}

export async function getSchedulerById(id: string): Promise<LeadGenerationScheduler> {
  try {
    const res = await client.get(`/${id}`, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to fetch scheduler');
  }
}

export async function createScheduler(
  payload: CreateSchedulerPayload,
): Promise<LeadGenerationScheduler> {
  try {
    const res = await client.post('/', payload, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to create scheduler');
  }
}

export async function updateScheduler(
  id: string,
  payload: UpdateSchedulerPayload,
): Promise<LeadGenerationScheduler> {
  try {
    const res = await client.patch(`/${id}`, payload, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to update scheduler');
  }
}

export async function deleteScheduler(id: string): Promise<void> {
  try {
    await client.delete(`/${id}`, { headers: getAuthHeaders() });
  } catch (e) {
    handleError(e, 'Failed to delete scheduler');
  }
}

export async function scheduleAllUSStates(
  payload: ScheduleAllUSStatesPayload,
): Promise<{ schedulerId: string; jobId: string; runAt: string | null }> {
  try {
    const res = await client.post('/bulk-us-states', payload, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to schedule all-US-states job');
  }
}

export async function runCrossSearch(): Promise<{
  leadTypes: number;
  states: number;
  jobsQueued: number;
}> {
  try {
    const res = await client.post('/run-cross', {}, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to run cross search');
  }
}

export async function runAllSchedulers(): Promise<{ triggered: number; jobIds: string[] }> {
  try {
    const res = await client.post('/run-all', {}, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to trigger all schedulers');
  }
}

export async function runOneScheduler(id: string): Promise<{ jobId: string }> {
  try {
    const res = await client.post(`/${id}/run`, {}, { headers: getAuthHeaders() });
    return res.data;
  } catch (e) {
    handleError(e, 'Failed to trigger scheduler');
  }
}
