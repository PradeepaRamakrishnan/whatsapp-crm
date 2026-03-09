import axios, { AxiosError } from 'axios';
import { API_URLS } from '@/lib/api-urls';
import { getAuthHeaders } from '@/lib/auth-headers';
import type { LeadChartData, RecentActivityItem } from '../types/dashboard.type';

const USERS_API_URL = API_URLS.users;

const axiosClient = axios.create({
  baseURL: USERS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getOverviewCounts() {
  try {
    const response = await axiosClient({
      method: 'GET',
      url: '/overview',
      headers: {
        ...getAuthHeaders(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overview counts');
    }
    throw error;
  }
}

// Recent Activity Types

export async function getRecentActivity(limit = 5): Promise<RecentActivityItem[]> {
  try {
    const response = await axiosClient({
      method: 'GET',
      url: '/recent-activity',
      params: { limit },
      headers: {
        ...getAuthHeaders(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
    }
    throw error;
  }
}

export async function getLeadsChartData(): Promise<LeadChartData[]> {
  try {
    const response = await axiosClient({
      method: 'GET',
      url: '/daily-leads',
      headers: {
        ...getAuthHeaders(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leads chart data');
    }
    throw error;
  }
}
