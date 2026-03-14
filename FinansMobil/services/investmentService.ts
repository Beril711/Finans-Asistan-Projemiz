import api from './api';
import type { Portfolio, Asset, Investment, Holding, InvestmentPayload } from '@/types';

export const getPortfolio = () => api.get<Portfolio>('/portfolio/');

export const resetPortfolio = () => api.post<Portfolio>('/portfolio/reset/');

export const depositBalance = (amount: number) =>
  api.post<Portfolio>('/portfolio/deposit/', { amount });

export const getAssets = () => api.get<Asset[]>('/assets/');

export const getInvestments = () => api.get<Investment[]>('/investments/');

export const createInvestment = (data: InvestmentPayload) =>
  api.post<Investment>('/investments/', data);

export const getHoldings = () => api.get<Holding[]>('/holdings/');
