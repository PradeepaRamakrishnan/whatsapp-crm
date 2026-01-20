'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { FileDetailData, FileStatus, FilesResponse } from '../types/file.types';

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
      method: 'DELETE',
      url: `/${id}`,
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
