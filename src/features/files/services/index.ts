'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type {
  FileData,
  FileDetailData,
  FileRecord,
  FileStatus,
  FilesResponse,
} from '../types/file.types';

const FILES_API_URL = process.env.FILES_API_URL ?? process.env.NEXT_PUBLIC_FILES_API_URL;

const axiosClient = axios.create({
  baseURL: FILES_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function createEmptyList(name: string): Promise<FileData> {
  const cookieStore = await cookies();
  const formData = new FormData();
  formData.append('name', name);
  formData.append('source', 'Manual');

  const res = await fetch(`${FILES_API_URL}/create`, {
    method: 'POST',
    headers: { Cookie: cookieStore.toString() },
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || `Failed to create list (${res.status})`);
  }
  return (json?.data ?? json) as FileData;
}

export async function createFile(formData: FormData): Promise<FileData> {
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

    // Support both { data: FileData } and FileData response shapes
    return (response.data?.data ?? response.data) as FileData;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
}

export async function addContactsToFile(fileId: string, formData: FormData): Promise<void> {
  try {
    const cookieStore = await cookies();
    await axiosClient({
      method: 'POST',
      url: `/${fileId}/upload`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Cookie: cookieStore.toString(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add contacts');
    }
    throw error;
  }
}

const EMPTY_FILES_RESPONSE: FilesResponse = {
  data: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
};

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

    const r = response.data;

    // Flat: { data: [...], meta: {...} }
    if (Array.isArray(r?.data) && r?.meta) {
      return r as FilesResponse;
    }
    // Nested: { data: { data: [...], meta: {...} } }
    if (Array.isArray(r?.data?.data) && r?.data?.meta) {
      return r.data as FilesResponse;
    }
    // Bare array
    if (Array.isArray(r)) {
      return {
        data: r as FileData[],
        meta: { total: r.length, page, limit, totalPages: Math.ceil(r.length / limit) },
      };
    }

    console.error('[getAllFiles] Unexpected response shape:', JSON.stringify(r)?.slice(0, 300));
    return EMPTY_FILES_RESPONSE;
  } catch (error: unknown) {
    console.error('[getAllFiles] Error fetching files:', error);
    return EMPTY_FILES_RESPONSE;
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
      data: { active: false },
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
