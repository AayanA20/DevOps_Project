import api from './api';

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/v1/auth/signup', userData);
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const response = await api.post('/auth/register', userData);
        return response.data;
      }
      throw err;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/v1/auth/login', credentials);
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
      }
      throw err;
    }
  },

  logout: async (refreshToken = null) => {
    try {
      await api.post('/v1/auth/logout', { refreshToken });
    } catch {
      // Clear local storage regardless
    } finally {
      localStorage.removeItem('mini_insta_token');
      localStorage.removeItem('mini_insta_refresh_token');
      localStorage.removeItem('mini_insta_user');
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/v1/auth/me');
      return response.data;
    } catch {
      const response = await api.get('/auth/me');
      return response.data;
    }
  },
};
