import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

export const getTransactions = () => {
  return api.get('/api/transactions/'); 
};

export const getCategories = () => {
  // Harcama kategorilerini GET ile çeker
  return axios.get(`${API_URL}/categories/`)
}

export const addTransaction = (transactionData) => {
  // Yeni bir harcama/gelir işlemi ekler (POST)
  return axios.post(`${API_URL}/transactions/`, transactionData)
}

export const updateTransaction = (id, transactionData) => {
  // Mevcut bir işlemi günceller (PATCH - kısmi güncelleme)
  return axios.patch(`${API_URL}/transactions/${id}/`, transactionData)
}

export const deleteTransaction = (id) => {
  // Mevcut bir işlemi siler (DELETE)
  return axios.delete(`${API_URL}/transactions/${id}/`)
}

// Bu servis, 7. Hafta hedeflerindeki tüm backend endpoint'lerini kapsar.