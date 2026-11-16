import api from './api';
import { broadcastSync } from '../utils/syncManager';

export const userService = {
  getUserProfile: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch {
      const response = await api.get(`/v1/users/${id}`);
      return response.data;
    }
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    broadcastSync('PROFILE_UPDATED', response.data);
    return response.data;
  },

  followUser: async (id) => {
    let res;
    try {
      const response = await api.post(`/users/${id}/follow`);
      res = response.data;
    } catch {
      const response = await api.post(`/v1/users/${id}/follow`);
      res = response.data;
    }
    broadcastSync('FOLLOW_REQUEST_SENT', { targetUserId: id, status: res?.status });
    return res;
  },

  unfollowUser: async (id) => {
    let res;
    try {
      const response = await api.delete(`/users/${id}/follow`);
      res = response.data;
    } catch {
      const response = await api.delete(`/v1/users/${id}/follow`);
      res = response.data;
    }
    broadcastSync('FOLLOW_STATUS_CHANGED', { targetUserId: id, status: 'unfollowed' });
    return res;
  },

  getFollowRequests: async () => {
    const response = await api.get('/users/requests');
    return response.data;
  },

  respondFollowRequest: async (requesterId, action) => {
    const response = await api.post(`/users/requests/${requesterId}`, { action });
    broadcastSync('FOLLOW_REQUEST_RESOLVED', { requesterId, action, user: response.data?.user });
    return response.data;
  },

  getFollowers: async (id) => {
    try {
      const response = await api.get(`/users/${id}/followers`);
      return response.data;
    } catch {
      const response = await api.get(`/v1/users/${id}/followers`);
      return response.data;
    }
  },

  getFollowing: async (id) => {
    try {
      const response = await api.get(`/users/${id}/following`);
      return response.data;
    } catch {
      const response = await api.get(`/v1/users/${id}/following`);
      return response.data;
    }
  },

  getSuggestedUsers: async () => {
    try {
      const response = await api.get('/users/suggested');
      return response.data;
    } catch {
      const response = await api.get('/v1/users/suggested');
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
