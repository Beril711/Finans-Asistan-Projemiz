import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenResponse, RegisterPayload } from '@/types';

export const loginUser = async (username: string, password: string): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('/token/', { username, password });
  await AsyncStorage.setItem('access_token', response.data.access);
  if (response.data.refresh) {
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
  }
  return response.data;
};

export const registerUser = async (payload: RegisterPayload): Promise<void> => {
  await api.post('/register/', payload);
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
};

export const getStoredToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('access_token');
};
