import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// Axios instance oluştur ve token ekle
const api = axios.create({
  baseURL: API_URL
})

// Her istekte token'ı header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const getTransactions = () => {
  return api.get('/transactions/'); 
};

export const getCategories = () => {
  // Harcama kategorilerini GET ile çeker
  return api.get('/categories/')
}

export const addCategory = (categoryData) => {
  // Yeni kategori ekler (POST)
  return api.post('/categories/', categoryData)
}

export const addTransaction = (transactionData) => {
  // Yeni bir harcama/gelir işlemi ekler (POST)
  return api.post('/transactions/', transactionData)
}

export const updateTransaction = (id, transactionData) => {
  // Mevcut bir işlemi günceller (PATCH - kısmi güncelleme)
  return api.patch(`/transactions/${id}/`, transactionData)
}

export const deleteTransaction = (id) => {
  // Mevcut bir işlemi siler (DELETE)
  return api.delete(`/transactions/${id}/`)
}

// Bu servis, 7. Hafta hedeflerindeki tüm backend endpoint'lerini kapsar.