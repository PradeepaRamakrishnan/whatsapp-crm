'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
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
