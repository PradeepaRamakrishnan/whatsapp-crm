import axios, { AxiosError } from 'axios';
import { API_URLS } from '@/lib/api-urls';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  BulkCreatePayload,
  BusinessLeadsResponse,
  CreateBusinessLeadPayload,
  GetBusinessLeadsQuery,
  SearchParams,
  SearchResponse,
} from '../types';

const BUSINESS_LEADS_API_URL = API_URLS.businessLeads;

const axiosClient = axios.create({
  baseURL: BUSINESS_LEADS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function searchBusinessLeads(params: SearchParams): Promise<SearchResponse> {
  try {
    const response = await axiosClient({
      method: 'POST',
      url: '/search',
      data: params,
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to search');
    }
    throw error;
  }
}

export async function createBusinessLead(
  payload: CreateBusinessLeadPayload,
): Promise<CreateBusinessLeadPayload> {
  try {
    const response = await axiosClient({
      method: 'POST',
      url: '/',
      data: payload,
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to save lead');
    }
    throw error;
  }
}

export async function bulkCreateBusinessLeads(payload: BulkCreatePayload): Promise<{
  saved: number;
}> {
  try {
    const response = await axiosClient({
      method: 'POST',
      url: '/bulk',
      data: payload,
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to save leads');
    }
    throw error;
  }
}

export async function getBusinessLeads(
  query: GetBusinessLeadsQuery,
): Promise<BusinessLeadsResponse> {
  try {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.type) params.set('type', query.type);
    if (query.city) params.set('city', query.city);

    const response = await axiosClient({
      method: 'GET',
      url: `/?${params.toString()}`,
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch business leads');
    }
    throw error;
  }
}

export async function deleteBusinessLead(id: string): Promise<void> {
  try {
    await axiosClient({
      method: 'DELETE',
      url: `/${id}`,
      headers: { ...getAuthHeaders() },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete lead');
    }
    throw error;
  }
}
