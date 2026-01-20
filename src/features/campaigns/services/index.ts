'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { TemplateChannel, TemplateData } from '../types/template.types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

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

export async function getAllConfiguration(): Promise<any> {
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
