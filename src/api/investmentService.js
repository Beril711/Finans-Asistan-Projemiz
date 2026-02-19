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

// Portfolio
export const getPortfolio = () => {
  return api.get('/portfolio/')
}

// Assets (Varlıklar)
export const getAssets = () => {
  return api.get('/assets/')
}

// Investments (Alım/Satım İşlemleri)
export const getInvestments = () => {
  return api.get('/investments/')
}

export const createInvestment = (investmentData) => {
  return api.post('/investments/', investmentData)
}

// Holdings (Elinizdeki Varlıklar)
export const getHoldings = () => {
  return api.get('/holdings/')
}

// Reset portfolio (custom action)
export const resetPortfolio = () => {
  // DRF action defined on PortfolioViewSet: /api/portfolio/reset/
  return api.post('/portfolio/reset/')
}
