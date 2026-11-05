import api from './api';

export const postService = {
  getPosts: async (page = 1, limit = 10) => {
    const response = await api.get('/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  likePost: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  unlikePost: async (id) => {
    const response = await api.delete(`/posts/${id}/like`);
    return response.data;
  },

  addComment: async (id, text) => {
    const response = await api.post(`/posts/${id}/comments`, { text });
    return response.data;
  },

  getComments: async (id) => {
    const response = await api.get(`/posts/${id}/comments`);
    return response.data;
  },
};
