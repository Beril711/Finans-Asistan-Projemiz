import api from './api';
import type { Transaction, Category, TransactionPayload } from '@/types';

export const getTransactions = () => api.get<Transaction[]>('/transactions/');

export const getCategories = () => api.get<Category[]>('/categories/');

export const addCategory = (data: { name: string; type: string }) =>
  api.post<Category>('/categories/', data);

export const addTransaction = (data: TransactionPayload) =>
  api.post<Transaction>('/transactions/', data);

export const deleteTransaction = (id: number) => api.delete(`/transactions/${id}/`);
