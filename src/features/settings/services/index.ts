'use server';

import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import type { Configuration, ConfigurationResponse } from '@/features/campaigns/types';
import type {
  FinancialInstitution,
  FinancialInstitutionsResponse,
  Template,
  TemplatesResponse,
  WhatsAppTemplatesResponse,
} from '../types';

const SETTINGS_API_URL = process.env.NEXT_PUBLIC_SETTINGS_API_URL;

const axiosClient = axios.create({
  baseURL: SETTINGS_API_URL,
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

export async function getAllFinancialInstitutionsName(): Promise<FinancialInstitutionsResponse> {
  try {
    const cookieStore = await cookies();

    const response = await axiosClient({
      method: 'GET',
      url: `/financial-institutions/names/list`,
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

export async function getAllEmailTemplates(): Promise<TemplatesResponse> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/email-templates`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email templates');
    }
    throw error;
  }
}

export async function getEmailTemplateById(id: string): Promise<Template> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/email-templates/${id}`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email template');
    }
    throw error;
  }
}

export async function syncWhatsAppTemplates(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/whatsapp/sync`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to sync WhatsApp templates');
    }
    throw error;
  }
}

export async function syncResendTemplates(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/resend/sync`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to sync Resend templates');
    }
    throw error;
  }
}

export async function getAllSmsTemplates(): Promise<TemplatesResponse> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/sms-templates`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch SMS templates');
    }
    throw error;
  }
}

export interface ConfigurationStep {
  channel: 'whatsapp' | 'sms' | 'email';
  templateId: string;
  delayMs: number;
}

export async function createConfiguration(body: {
  steps: ConfigurationStep[];
  cronPattern?: string | null;
}): Promise<{ id: string }> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/configurations`,
      data: body,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create configuration');
    }
    throw error;
  }
}

export async function getAllWhatsAppTemplates(): Promise<WhatsAppTemplatesResponse> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'GET',
      url: `/whatsapp-templates`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch WhatsApp templates');
    }
    throw error;
  }
}

export async function toggleEmailTemplateDefault(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PATCH',
      url: `/email-templates/${id}/default`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update email template default');
    }
    throw error;
  }
}

export async function createWhatsAppTemplate(
  data: Record<string, unknown>,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'POST',
      url: `/whatsapp-templates`,
      data,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create WhatsApp template');
    }
    throw error;
  }
}

export async function toggleWhatsAppTemplateDefault(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const response = await axiosClient({
      method: 'PATCH',
      url: `/whatsapp-templates/${id}/default`,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update WhatsApp template default',
      );
    }
    throw error;
  }
}
