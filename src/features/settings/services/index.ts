import axios, { AxiosError } from 'axios';
import type { Configuration, ConfigurationResponse } from '@/features/campaigns/types';
import { API_URLS } from '@/lib/api-urls';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  ResendConfig,
  SaveResendConfigPayload,
  Template,
  TemplatesResponse,
  WhatsAppTemplatesResponse,
} from '../types';

const SETTINGS_API_URL = API_URLS.settings;

const axiosClient = axios.create({
  baseURL: SETTINGS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function getAllConfiguration(): Promise<ConfigurationResponse> {
  try {
    const response = await axiosClient({
      method: 'GET',
      url: `/configurations`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'GET',
      url: `/configurations/${id}`,
      headers: {
        ...getAuthHeaders(),
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
    await axiosClient({
      method: 'PATCH',
      url: `/configurations/${id}`,
      data: body,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'GET',
      url: `/email-templates`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'GET',
      url: `/email-templates/${id}`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'POST',
      url: `/whatsapp/sync`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'POST',
      url: `/resend/sync`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'GET',
      url: `/sms-templates`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'POST',
      url: `/configurations`,
      data: body,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'GET',
      url: `/whatsapp-templates`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'PATCH',
      url: `/email-templates/${id}/default`,
      headers: {
        ...getAuthHeaders(),
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
    const response = await axiosClient({
      method: 'POST',
      url: `/whatsapp-templates`,
      data,
      headers: {
        ...getAuthHeaders(),
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

export async function getResendConfig(): Promise<ResendConfig | null> {
  try {
    const response = await axiosClient({
      method: 'GET',
      url: '/resend/config',
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Resend config');
    }
    throw error;
  }
}

export async function saveResendConfig(data: SaveResendConfigPayload): Promise<ResendConfig> {
  try {
    const response = await axiosClient({
      method: 'POST',
      url: '/resend/config',
      data,
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to save Resend config');
    }
    throw error;
  }
}

export async function verifyResendDomain(): Promise<ResendConfig> {
  try {
    const response = await axiosClient({
      method: 'POST',
      url: '/resend/config/verify',
      headers: { ...getAuthHeaders() },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to verify domain');
    }
    throw error;
  }
}

export async function deleteResendConfig(): Promise<void> {
  try {
    await axiosClient({
      method: 'DELETE',
      url: '/resend/config',
      headers: { ...getAuthHeaders() },
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete Resend config');
    }
    throw error;
  }
}

export async function toggleWhatsAppTemplateDefault(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosClient({
      method: 'PATCH',
      url: `/whatsapp-templates/${id}/default`,
      headers: {
        ...getAuthHeaders(),
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
