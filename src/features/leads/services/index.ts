'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { LeadsResponse } from '../types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_LEADS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getAllLeads(
  page: number,
  limit: number,
  search?: string,
): Promise<LeadsResponse> {
  try {
    const cookieStore = await cookies();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      active: 'true',
    });

    if (search) {
      queryParams.append('name', search);
    }

    const response = await axiosClient({
      method: 'GET',
      url: `/?${queryParams.toString()}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all leads');
    }
    throw error;
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PATCH',
      url: `/${id}`,
      data: { active: false },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete lead');
    }
    throw error;
  }
}

export async function getLeadsById(id: string): Promise<LeadsResponse> {
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
      throw new Error(error.response?.data?.message || 'Failed to fetch leads by id');
    }
    throw error;
  }
}
