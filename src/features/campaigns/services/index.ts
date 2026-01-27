'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type {
  CampaignContactsResponse,
  CampaignDetailsResponse,
  CampaignsResponse,
  CampaignTimelineResponse,
  Configuration,
  ConfigurationResponse,
} from '../types';
import type { TemplateChannel, TemplateData } from '../types/template.types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getAllCampaigns(page: number, limit: number): Promise<CampaignsResponse> {
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
      throw new Error(error.response?.data?.message || 'Failed to fetch get all campaigns');
    }
    throw error;
  }
}

export async function getCampaignById(id: string): Promise<CampaignDetailsResponse> {
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
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign by id');
    }
    throw error;
  }
}

export async function getCampaignContacts(
  id: string,
  page: number,
  limit: number,
): Promise<CampaignContactsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/${id}/contacts?page=${page}&limit=${limit}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign contacts');
    }
    throw error;
  }
}

export async function getCampaignTimeline(id: string): Promise<CampaignTimelineResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/${id}/timeline`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign timeline');
    }
    throw error;
  }
}

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

export async function getAllConfiguration(): Promise<ConfigurationResponse> {
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

export async function runCampaign(id: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/${id}/run`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to run campaign');
    }
    throw error;
  }
}

export async function pauseCampaign(id: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/${id}/pause`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to pause campaign');
    }
    throw error;
  }
}

export async function resumeCampaign(id: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/${id}/resume`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to resume campaign');
    }
    throw error;
  }
}

export async function getConfigurationyId(id: string): Promise<Configuration> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/configurations/${id}`,
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

export async function updateConfiguration(
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  try {
    const cookieStore = await cookies();
    await axiosClient({
      method: 'PATCH',
      url: `/configurations/${id}`,
      data: body,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update file configuration');
    }
    throw error;
  }
}

export async function updateTemplate(id: string, body: Record<string, unknown>): Promise<void> {
  try {
    const cookieStore = await cookies();
    await axiosClient({
      method: 'PATCH',
      url: `templates/${id}`,
      data: { body },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update file template');
    }
    throw error;
  }
}

export async function markContactInterested(
  campaignId: string,
  contactId: string,
  channel?: string,
): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/interested?campaignId=${campaignId}&contactId=${contactId}${channel ? `&channel=${channel}` : ''}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to mark contact as interested');
    }
    throw error;
  }
}

export async function markContactNotInterested(
  campaignId: string,
  contactId: string,
): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/not-interested?campaignId=${campaignId}&contactId=${contactId}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to mark contact as not interested');
    }
    throw error;
  }
}

export async function markContactConsent(campaignId: string, contactId: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/consent?campaignId=${campaignId}&contactId=${contactId}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to mark contact as not interested');
    }
    throw error;
  }
}

export async function unsubscribeContact(campaignId: string, contactId: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/unsubscribe?campaignId=${campaignId}&contactId=${contactId}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe contact');
    }
    throw error;
  }
}

export async function getContactMessages(campaignId: string, contactId?: string): Promise<unknown> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: contactId
        ? `/${campaignId}/contacts/${contactId}/conversations`
        : `/${campaignId}/conversations`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    // For now, return mock data as if coming from API
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to conversation messages');
    }
    return [
      {
        id: 'msg-1',
        sender: 'agent',
        senderName: 'Samatva Support',
        channel: 'email',
        content:
          'Dear Customer,\n\nWe have a special settlement offer for your outstanding balance. You can now settle your account with a 20% discount on the total amount.\n\nPlease let us know if you are interested in this offer.\n\nBest regards,\nSamatva Team',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }
}

// export async function createLead(data: {
//   mobile: string;
//   pan_number: string;
//   date_of_birth: string;
//   campaignId?: string;
//   contactId?: string;
// }): Promise<unknown> {
//   try {
//     const cookieStore = await cookies();
//     const response = await axiosClient({
//       method: 'POST',
//       url: '/leads',
//       data,
//       headers: {
//         Cookie: cookieStore.toString(),
//       },
//     });

//     return response.data;
//   } catch (error: unknown) {
//     if (error instanceof AxiosError) {
//       throw new Error(error.response?.data?.message || 'Failed to create lead');
//     }
//     throw error;
//   }
// }
