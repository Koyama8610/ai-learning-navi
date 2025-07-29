import axios from 'axios';

const apiService = axios.create({
  baseURL: '/api'
});

// リクエストインターセプターで、localStorageからトークンを取得してヘッダーに付与
apiService.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiService;