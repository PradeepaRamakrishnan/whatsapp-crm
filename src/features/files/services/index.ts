'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { API_URLS } from '@/lib/api-urls';
import type {
  FileData,
  FileDetailData,
  FileRecord,
  FileStatus,
  FilesResponse,
} from '../types/file.types';

const FILES_API_URL = API_URLS.files;

async function getServerHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

async function getServerMultipartHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  // Do NOT set Content-Type for multipart — let axios set it with the correct boundary
  return {
    Accept: 'application/json',
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createEmptyList(name: string): Promise<ActionResult<FileData>> {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('source', 'Manual');

    const headers = await getServerMultipartHeaders();
    const response = await axios({
      method: 'POST',
      url: `${FILES_API_URL}/create`,
      data: formData,
      headers,
    });

    const data = (response.data?.data ?? response.data) as FileData;
    return { success: true, data };
  } catch (err) {
    if (err instanceof AxiosError) {
      return { success: false, error: err.response?.data?.message || 'Failed to create list' };
    }
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create list' };
  }
}

export async function createFile(formData: FormData): Promise<FileData> {
  try {
    const headers = await getServerMultipartHeaders();
    const response = await axios({
      method: 'POST',
      url: `${FILES_API_URL}/create`,
      data: formData,
      headers,
    });

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
    const headers = await getServerMultipartHeaders();
    await axios({
      method: 'POST',
      url: `${FILES_API_URL}/${fileId}/upload`,
      data: formData,
      headers,
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
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      queryParams.append('filter', search);
    }

    const headers = await getServerHeaders();
    const response = await axios({
      method: 'GET',
      url: `${FILES_API_URL}/?${queryParams.toString()}`,
      headers,
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
    const headers = await getServerHeaders();
    const response = await axios({
      method: 'GET',
      url: `${FILES_API_URL}/${id}?page=${page}&limit=${limit}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`,
      headers,
    });

    return response.data.data ?? response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch file by ID');
    }
    throw error;
  }
}

export async function updateFileStatus(id: string, status: FileStatus): Promise<void> {
  try {
    const headers = await getServerHeaders();
    await axios({
      method: 'PATCH',
      url: `${FILES_API_URL}/${id}/status`,
      data: { status },
      headers,
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
    const headers = await getServerHeaders();
    const response = await axios({
      method: 'PATCH',
      url: `${FILES_API_URL}/${id}/reviewed`,
      headers,
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
    const headers = await getServerHeaders();
    const response = await axios({
      method: 'PATCH',
      url: `${FILES_API_URL}/${id}`,
      data: { active: false },
      headers,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
    throw error;
  }
}

export async function updateFileRecord(
  fileId: string,
  recordId: string,
  data: Partial<FileRecord>,
): Promise<FileRecord> {
  try {
    const headers = await getServerHeaders();
    const response = await axios({
      method: 'PATCH',
      url: `${FILES_API_URL}/${fileId}/contents/${recordId}`,
      data,
      headers,
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
    const headers = await getServerHeaders();
    const response = await axios({
      method: 'DELETE',
      url: `${FILES_API_URL}/${fileId}/contents/${recordId}`,
      headers,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete record');
    }
    throw error;
  }
}
