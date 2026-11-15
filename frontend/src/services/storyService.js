import api from './api';

export const storyService = {
  // Create a new 24h story
  createStory: async ({ mediaUrl, caption }) => {
    try {
      const response = await api.post('/v1/stories', { mediaUrl, caption });
      return response.data;
    } catch {
      const response = await api.post('/stories', { mediaUrl, caption });
      return response.data;
    }
  },

  // Get active stories
  getActiveStories: async () => {
    try {
      const response = await api.get('/v1/stories');
      return response.data;
    } catch {
      const response = await api.get('/stories');
      return response.data;
    }
  },

  // Delete story by ID
  deleteStory: async (id) => {
    try {
      const response = await api.delete(`/v1/stories/${id}`);
      return response.data;
    } catch {
      const response = await api.delete(`/stories/${id}`);
      return response.data;
    }
  },
};

