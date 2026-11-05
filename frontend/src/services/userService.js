import api from './api';

export const userService = {
  getUserProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },

  unfollowUser: async (id) => {
    const response = await api.delete(`/users/${id}/follow`);
    return response.data;
  },

  getSuggestedUsers: async () => {
    const response = await api.get('/users/suggested');
    return response.data;
  },
};

