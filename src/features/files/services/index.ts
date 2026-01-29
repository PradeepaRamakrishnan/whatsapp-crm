'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { FileDetailData, FileRecord, FileStatus, FilesResponse } from '../types/file.types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FILES_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function createFile(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: '/create',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
}

export async function getAllFiles(
  page: number,
  limit: number,
  search?: string,
): Promise<FilesResponse> {
  try {
    const cookieStore = await cookies();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      active: 'true',
    });

    if (search) {
      queryParams.append('filter', search);
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
      throw new Error(error.response?.data?.message || 'Failed to fetch files');
    }
    throw error;
  }
}

export async function getFileById(
  id: string,
  page: number,
  limit: number,
  filter?: string,
): Promise<FileDetailData> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/${id}?page=${page}&limit=${limit}${filter ? `&filter=${filter}` : ''}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch file by ID');
    }
    throw error;
  }
}

export async function updateFileStatus(id: string, status: FileStatus): Promise<void> {
  try {
    const cookieStore = await cookies();
    await axiosClient({
      method: 'PATCH',
      url: `/${id}/status`,
      data: { status },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update file status');
    }
    throw error;
  }
}

export async function markAsReviewed(id: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PATCH',
      url: `/${id}/reviewed`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update file as reviewed');
    }
    throw error;
  }
}

export async function deleteFile(id: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PATCH',
      url: `/${id}`,
      data: { isActive: false },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
    throw error;
  }
}

// ... existing code ...
export async function updateFileRecord(
  fileId: string,
  recordId: string,
  data: Partial<FileRecord>,
): Promise<FileRecord> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PATCH',
      url: `/${fileId}/contents/${recordId}`,
      data,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update record');
    }
    throw error;
  }
}

export async function deleteFileRecord(fileId: string, recordId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'DELETE',
      url: `/${fileId}/contents/${recordId}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete record');
    }
    throw error;
  }
}
