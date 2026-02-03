'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { LeadChartData, RecentActivityItem } from '../types/dashboard.type';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_USERS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getOverviewCounts() {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: '/overview',
      headers: {
        Cookie: cookieStore.toString(),
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
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: '/recent-activity',
      params: { limit },
      headers: {
        Cookie: cookieStore.toString(),
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
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: '/daily-leads',
      headers: {
        Cookie: cookieStore.toString(),
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
