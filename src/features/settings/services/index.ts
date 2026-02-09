'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { Configuration, ConfigurationResponse } from '@/features/campaigns/types';
import type { TemplateChannel, TemplateData } from '@/features/campaigns/types/template.types';
import type { FinancialInstitution, FinancialInstitutionsResponse } from '../types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SETTINGS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getAllFinancialInstitutions(
  page: number,
  limit: number,
): Promise<FinancialInstitutionsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/financial-institutions?page=${page}&limit=${limit}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch get all financial institutions',
      );
    }
    throw error;
  }
}

export async function getAllFinancialInstitutionsName(): Promise<FinancialInstitutionsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/financial-institutions/names/list`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch get all financial institutions',
      );
    }
    throw error;
  }
}

export async function createFinancialInstitution(
  data: Record<string, unknown>,
): Promise<FinancialInstitution> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'POST',
      url: `/financial-institutions`,
      data,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create financial institution');
    }
    throw error;
  }
}

export async function updateFinancialInstitution(
  id: string,
  data: Record<string, unknown>,
): Promise<FinancialInstitution> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'PATCH',
      url: `/financial-institutions/${id}`,
      data,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update financial institution');
    }
    throw error;
  }
}

export async function getAllConfiguration(): Promise<ConfigurationResponse> {
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

export async function getConfigurationyId(id: string): Promise<Configuration> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/configurations/${id}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch file by ID');
    }
    throw error;
  }
}

export async function updateConfiguration(
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  try {
    const cookieStore = await cookies();
    await axiosClient({
      method: 'PATCH',
      url: `/configurations/${id}`,
      data: body,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update file configuration');
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
