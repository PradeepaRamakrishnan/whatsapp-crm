'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { FileDetailData, FilesResponse } from '../types/file.types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FILES_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getAllFiles(page: number, limit: number): Promise<FilesResponse> {
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
      throw new Error(error.response?.data?.message || 'Failed to fetch files');
    }
    throw error;
  }
}

export async function getFileById(
  id: string,
  page: number,
  limit: number,
): Promise<FileDetailData> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/${id}?page=${page}&limit=${limit}`,
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
