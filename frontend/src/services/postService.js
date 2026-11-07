import api from './api';

export const postService = {
  getPosts: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/v1/feed', {
        params: { limit },
      });
      return response.data;
    } catch {
      const response = await api.get('/posts', {
        params: { page, limit },
      });
      return response.data;
    }
  },

  getFeed: async (cursor = null, limit = 20) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const response = await api.get('/v1/feed', { params });
    return response.data;
  },

  getUploadUrl: async (fileMeta = {}) => {
    const response = await api.post('/v1/media/upload-url', {
      mediaType: fileMeta.mediaType || 'IMAGE',
      contentType: fileMeta.contentType || 'image/jpeg',
      sizeBytes: fileMeta.sizeBytes || 2048000,
    });
    return response.data;
  },

  getPostById: async (id) => {
    try {
      const response = await api.get(`/v1/posts/${id}`);
      return response.data;
    } catch {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    }
  },

  createPost: async (postData) => {
    // Generate UUID idempotency key for network resilience (Phase 4A)
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const response = await api.post('/v1/posts', postData, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      return response.data;
    } catch {
      const response = await api.post('/posts', postData);
      return response.data;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await api.delete(`/v1/posts/${id}`);
      return response.data;
    } catch {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    }
  },

  likePost: async (id) => {
    try {
      const response = await api.post(`/v1/posts/${id}/like`);
      return response.data;
    } catch {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    }
  },

  unlikePost: async (id) => {
    try {
      const response = await api.delete(`/v1/posts/${id}/like`);
      return response.data;
    } catch {
      const response = await api.delete(`/posts/${id}/like`);
      return response.data;
    }
  },

  addComment: async (id, text) => {
    try {
      const response = await api.post(`/v1/posts/${id}/comments`, { text });
      return response.data;
    } catch {
      const response = await api.post(`/posts/${id}/comments`, { text });
      return response.data;
    }
  },

  getComments: async (id) => {
    try {
      const response = await api.get(`/v1/posts/${id}/comments`);
      return response.data;
    } catch {
      const response = await api.get(`/posts/${id}/comments`);
      return response.data;
    }
  },
};
