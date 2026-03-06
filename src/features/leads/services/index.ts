'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type {
  Document,
  Lead,
  LeadsResponse,
  ManualFollowupCase,
  ManualFollowupsResponse,
  TimelineEntry,
} from '../types';

const LEADS_API_URL = process.env.LEADS_API_URL ?? process.env.NEXT_PUBLIC_LEADS_API_URL;

const axiosClient = axios.create({
  baseURL: LEADS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export const getAllLeads = cache(
  async (page: number, limit: number, search?: string): Promise<LeadsResponse> => {
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
  },
);

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

export const getLeadsById = cache(async (id: string): Promise<LeadsResponse> => {
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
});

export const getCampaignById = cache(async (id: string): Promise<LeadsResponse> => {
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
});

/** @deprecated Use getCampaignById */
export const getCompaignById = getCampaignById;

export async function uploadDocument(leadId: string, formData: FormData): Promise<Document> {
  try {
    const cookieStore = await cookies();
    const baseUrl = LEADS_API_URL;

    const response = await fetch(`${baseUrl}/${leadId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: cookieStore.toString(),
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload document');
    }

    return response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during upload');
  }
}

export async function generateUploadLink(
  leadId: string,
  email?: string,
): Promise<{ message: string; link: string; token: string; expiresAt: string }> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'POST',
      url: `/${leadId}/generate-document-link`,
      data: { email },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to generate upload link');
    }
    throw error;
  }
}

export async function deleteDocument(id: string, documentId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'DELETE',
      url: `/${id}/documents/${documentId}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
    throw error;
  }
}

export async function getDocuments(
  leadId: string,
): Promise<{ leadId: string; documents: Document[] }> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/${leadId}/documents`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
    throw error;
  }
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PUT',
      url: `/${id}`,
      data,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update lead');
    }
    throw error;
  }
}

export async function addTimelineEntry(
  leadId: string,
  entry: Omit<TimelineEntry, 'id' | 'timestamp'>,
  currentTimeline?: TimelineEntry[] | null,
): Promise<Lead> {
  const newEntry: TimelineEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const updatedTimeline = [newEntry, ...(currentTimeline || [])];
  return updateLead(leadId, { timeline: updatedTimeline } as Partial<Lead>);
}
export async function getManualFollowups(
  page: number,
  limit: number,
  search?: string,
): Promise<ManualFollowupsResponse> {
  try {
    const cookieStore = await cookies();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      queryParams.append('search', search);
    }

    const response = await axiosClient({
      method: 'GET',
      url: `/manual-followups?${queryParams.toString()}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch manual followups');
    }
    throw error;
  }
}
export async function getManualFollowupById(id: string): Promise<ManualFollowupCase> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/manual-followups/${id}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch manual followup details');
    }
    throw error;
  }
}
