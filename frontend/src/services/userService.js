import api from './api';

export const userService = {
  getUserProfile: async (id) => {
    try {
      const response = await api.get(`/v1/users/${id}`);
      return response.data;
    } catch {
      const response = await api.get(`/users/${id}`);
      return response.data;
    }
  },

  followUser: async (id) => {
    try {
      const response = await api.post(`/v1/users/${id}/follow`);
      return response.data;
    } catch {
      const response = await api.post(`/users/${id}/follow`);
      return response.data;
    }
  },

  unfollowUser: async (id) => {
    try {
      const response = await api.delete(`/v1/users/${id}/follow`);
      return response.data;
    } catch {
      const response = await api.delete(`/users/${id}/follow`);
      return response.data;
    }
  },

  getSuggestedUsers: async () => {
    try {
      const response = await api.get('/v1/users/suggested');
      return response.data;
    } catch {
      const response = await api.get('/users/suggested');
      return response.data;
    }
  },

  search: async (query, type = 'user') => {
    const response = await api.get('/v1/search', {
      params: { q: query, type },
    });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/v1/notifications');
    return response.data;
  },
};
