import { apiClient } from './client';

export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  refresh: async (data: { refreshToken: string }) => {
    const response = await apiClient.post('/auth/refresh', data);
    return response.data;
  },

  requestPasswordReset: async (data: { email: string }) => {
    const response = await apiClient.post('/auth/reset/request-otp', data);
    return response.data;
  },

  confirmPasswordReset: async (data: { 
    email: string; 
    otp: string; 
    newPassword: string; 
  }) => {
    const response = await apiClient.post('/auth/reset/confirm', data);
    return response.data;
  },
};