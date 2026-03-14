// Auth
export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
  password2: string;
}

// Tracking
export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Transaction {
  id: number;
  amount: string;
  date: string;
  description: string | null;
  category: number;
  category_name: string;
  transaction_type: 'INCOME' | 'EXPENSE';
}

export interface TransactionPayload {
  category: number;
  transaction_type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  description?: string;
}

// Investment
export interface Portfolio {
  id: number;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  asset_type: 'STOCK' | 'CRYPTO' | 'FOREX';
  current_price: string;
  last_updated: string;
  priceChange?: 'up' | 'down';
}

export interface Investment {
  id: number;
  asset: number;
  asset_symbol: string;
  asset_name: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  total: string;
  date: string;
}

export interface Holding {
  id: number;
  asset: number;
  asset_symbol: string;
  asset_name: string;
  quantity: string;
  average_price: string;
  current_price: string;
  current_value: number;
  profit_loss: number;
}

export interface InvestmentPayload {
  asset: number;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
}

export interface ScanReceiptResponse {
  success: boolean;
  raw_text: string;
  detected_total: number;
}
