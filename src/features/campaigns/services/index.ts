'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type {
  CampaignContactsResponse,
  CampaignDetailsResponse,
  CampaignsResponse,
  CampaignTimelineResponse,
  Configuration,
} from '../types';
import type { TemplateChannel, TemplateData } from '../types/template.types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getAllCampaigns(page: number, limit: number): Promise<CampaignsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/?page=${page}&limit=${limit}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch get all campaigns');
    }
    throw error;
  }
}

export async function getCampaignById(id: string): Promise<CampaignDetailsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/${id}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign by id');
    }
    throw error;
  }
}

export async function getCampaignContacts(
  id: string,
  page: number,
  limit: number,
): Promise<CampaignContactsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/${id}/contacts?page=${page}&limit=${limit}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign contacts');
    }
    throw error;
  }
}

export async function getCampaignTimeline(id: string): Promise<CampaignTimelineResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/${id}/timeline`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign timeline');
    }
    throw error;
  }
}

export async function getAllTemplates(
  channel?: TemplateChannel | 'all' | 'by-bank',
): Promise<TemplateData[]> {
  try {
    const cookieStore = await cookies();
    // Only pass channel param if it's a specific channel (not 'all' or 'by-bank')
    const params = channel && channel !== 'all' && channel !== 'by-bank' ? { channel } : {};

    const response = await axiosClient({
      method: 'GET',
      url: `/templates`,
      params,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch templates');
    }
    throw error;
  }
}

export async function getAllConfiguration(): Promise<Configuration> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/configurations`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch configurations');
    }
    throw error;
  }
}

export async function runCampaign(id: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/${id}/run`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to run campaign');
    }
    throw error;
  }
}

export async function pauseCampaign(id: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/${id}/pause`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to pause campaign');
    }
    throw error;
  }
}

export async function resumeCampaign(id: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/${id}/resume`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to resume campaign');
    }
    throw error;
  }
}
