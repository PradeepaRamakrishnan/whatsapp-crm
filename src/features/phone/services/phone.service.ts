import axios, { AxiosError } from 'axios';

function handleAxiosError(error: unknown, defaultMessage: string): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message || defaultMessage;
    throw new Error(status ? `[${status}] ${message}` : message);
  }
  throw error;
}

const API_URL = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:3010';

export const phoneNumberService = {
  async searchNumbers(country: string, type: string = 'local', userId: string, pattern?: string) {
    try {
      const response = await axios.get(`${API_URL}/instagram/plivo/numbers/search`, {
        params: { countryIso: country, type, pattern, userId },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to search phone numbers');
    }
  },

  async buyNumber(
    phoneNumber: string,
    userId: string,
    country?: string,
    type?: string,
    amount?: number,
  ) {
    try {
      const response = await axios.post(
        `${API_URL}/instagram/plivo/numbers/buy`,
        { phoneNumber, userId, country, type, amount },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to buy phone number');
    }
  },

  async getMyNumbers(userId: string) {
    try {
      const response = await axios.get(`${API_URL}/instagram/plivo/numbers/my`, {
        params: { userId },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to load purchased numbers');
    }
  },

  async deleteNumber(id: string, userId: string) {
    try {
      const response = await axios.delete(`${API_URL}/instagram/plivo/numbers/${id}`, {
        params: { userId },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to delete phone number');
    }
  },

  async submitCompliance(data: FormData) {
    try {
      const response = await axios.post(`${API_URL}/instagram/plivo/compliance`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to submit compliance documents');
    }
  },

  async getMyCompliance(userId: string) {
    try {
      const response = await axios.get(`${API_URL}/instagram/plivo/compliance`, {
        params: { userId },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Failed to load compliance data');
    }
  },
};
