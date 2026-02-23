import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:3010';

export const phoneNumberService = {
  async searchNumbers(country: string, type: string = 'local', userId: string, pattern?: string) {
    const response = await axios.get(`${API_URL}/instagram/plivo/numbers/search`, {
      params: { countryIso: country, type, pattern, userId },
      withCredentials: true,
    });
    return response.data;
  },

  async buyNumber(phoneNumber: string, userId: string) {
    const response = await axios.post(
      `${API_URL}/instagram/plivo/numbers/buy`,
      {
        phoneNumber,
        userId,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  async getMyNumbers(userId: string) {
    const response = await axios.get(`${API_URL}/instagram/plivo/numbers/my`, {
      params: { userId },
      withCredentials: true,
    });
    return response.data;
  },

  async deleteNumber(id: string, userId: string) {
    const response = await axios.delete(`${API_URL}/instagram/plivo/numbers/${id}`, {
      params: { userId },
      withCredentials: true,
    });
    return response.data;
  },

  async updateNumber(id: string, userId: string, data: { alias?: string }) {
    const response = await axios.patch(
      `${API_URL}/instagram/plivo/numbers/${id}`,
      {
        ...data,
        userId,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
};
