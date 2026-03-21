/**
 * Client-side file service — uses localStorage token via getAuthHeaders().
 * Use this in client components / React Query hooks.
 * The server-side services/index.ts (uses cookies) is only for Server Components.
 */
import axios, { AxiosError } from 'axios';
import { API_URLS } from '@/lib/api-urls';
import { getAuthHeaders } from '@/lib/auth-headers';
import type { FileDetailData, FileRecord, FilesResponse } from '../types/file.types';

const FILES_API_URL = API_URLS.files;

const client = axios.create({
  baseURL: FILES_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

export async function addContact(
  fileId: string,
  contact: {
    customerName: string;
    mobileNumber?: string;
    emailId?: string;
    additionalData?: Record<string, string | number>;
  },
): Promise<FileRecord> {
  try {
    const response = await client.post(`/${fileId}/contacts`, contact, {
      headers: getAuthHeaders(),
    });
    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add contact');
    }
    throw error;
  }
}

export async function fetchFileById(
  fileId: string,
  page: number,
  limit: number,
  filter?: string,
): Promise<FileDetailData> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter) params.append('filter', filter);

    const response = await client.get(`/${fileId}?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch file');
    }
    throw error;
  }
}

export async function deleteRecord(fileId: string, recordId: string): Promise<void> {
  try {
    await client.delete(`/${fileId}/contents/${recordId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete record');
    }
    throw error;
  }
}

export async function updateRecord(
  fileId: string,
  recordId: string,
  data: Partial<FileRecord>,
): Promise<FileRecord> {
  try {
    const response = await client.patch(`/${fileId}/contents/${recordId}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update record');
    }
    throw error;
  }
}

export async function fetchFiles(
  page: number,
  limit: number,
  search?: string,
): Promise<FilesResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append('filter', search);

    const response = await client.get(`/?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    const r = response.data;

    if (Array.isArray(r?.data) && r?.meta) return r as FilesResponse;
    if (Array.isArray(r?.data?.data) && r?.data?.meta) return r.data as FilesResponse;
    if (Array.isArray(r))
      return {
        data: r,
        meta: { total: r.length, page, limit, totalPages: Math.ceil(r.length / limit) },
      };

    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          (error.response?.status === 401 ? 'Unauthorized' : 'Failed to fetch files'),
      );
    }
    throw error;
  }
}
