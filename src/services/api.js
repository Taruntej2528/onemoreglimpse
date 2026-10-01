/**
 * Prazna Photography API Service Client
 * Seamlessly connects React frontend to Node.js / Express backend (port 5000)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onemoreglimpse-backend.onrender.com/api/v1';

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('prazna_admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If body is FormData, delete Content-Type so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        result?.message ||
        (result?.errors ? result.errors.join(', ') : `HTTP Error ${response.status}`);
      const error = new Error(errorMsg);
      error.statusCode = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`[API Error: ${options.method || 'GET'} ${endpoint}]`, error.message);
    throw error;
  }
}

// ----------------------------------------------------
// 1. Authentication Endpoints
// ----------------------------------------------------
export const authAPI = {
  login: async ({ email, password }) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return request('/auth/me');
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    return request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ----------------------------------------------------
// 2. Settings & Website Configuration Endpoints
// ----------------------------------------------------
export const settingsAPI = {
  get: async () => {
    return request('/settings');
  },

  update: async (data) => {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  switchStorage: async (provider) => {
    return request('/settings/storage/switch', {
      method: 'PATCH',
      body: JSON.stringify({ provider }),
    });
  },
};

// ----------------------------------------------------
// 3. Client Requests & Concierge Inquiries
// ----------------------------------------------------
export const requestsAPI = {
  // Public date inquiry & bespoke quote submission
  submit: async (data) => {
    return request('/requests/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Protected Admin management
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/requests${query ? `?${query}` : ''}`);
  },

  getById: async (id) => {
    return request(`/requests/${id}`);
  },

  updateStatus: async (id, status) => {
    return request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id) => {
    return request(`/requests/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 4. Notifications Endpoints
// ----------------------------------------------------
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: async (id) => {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  delete: async (id) => {
    return request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 5. Events & Signature Packages Endpoints
// ----------------------------------------------------
export const eventsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/events${query ? `?${query}` : ''}`);
  },

  getActivePackages: async () => {
    return request('/events/packages/active');
  },

  getById: async (id) => {
    return request(`/events/${id}`);
  },

  create: async (data) => {
    return request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return request(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 6. Portfolio Categories Endpoints
// ----------------------------------------------------
export const categoriesAPI = {
  getAll: async () => {
    return request('/categories');
  },

  getActive: async () => {
    return request('/categories/active');
  },

  create: async (data) => {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return request(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 7. Media & Multi-Cloud Storage Endpoints
// ----------------------------------------------------
export const mediaAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/media${query ? `?${query}` : ''}`);
  },

  upload: async (formData) => {
    return request('/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Public upload for website visitors (moodboards, inquiry attachments)
  uploadPublic: async (formData) => {
    return request('/media/upload-public', {
      method: 'POST',
      body: formData,
    });
  },

  setActiveHero: async (id) => {
    return request(`/media/${id}/hero-active`, {
      method: 'PATCH',
    });
  },

  delete: async (id) => {
    return request(`/media/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 8. Access Management & Sub-Admin Users
// ----------------------------------------------------
export const usersAPI = {
  getAll: async () => {
    return request('/users');
  },

  create: async (userData) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 9. Activity Audit Logs Endpoints
// ----------------------------------------------------
export const logsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/logs${query ? `?${query}` : ''}`);
  },
};

// ----------------------------------------------------
// 10. Database Seed API
// ----------------------------------------------------
export const seedAPI = {
  run: async (options = {}) => {
    return request('/seed', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },
};

// ----------------------------------------------------
// 11. AI Studio Concierge Streaming & Configuration
// ----------------------------------------------------
export const chatAPI = {
  // Get public chat widget info (bot name, active provider, quick prompts)
  getConfig: async () => {
    return request('/chat/config');
  },

  // Get WebSocket endpoint URL matching current host
  getWebSocketUrl: () => {
    const isHttps = window.location.protocol === 'https:';
    const host = window.location.hostname;
    // Default backend port is 5000 in dev
    const port = window.location.port === '5173' || window.location.port === '5174' ? '5000' : window.location.port;
    return `${isHttps ? 'wss:' : 'ws:'}//${host}:${port}/ws/chat`;
  },

  // Native streaming chat with real-time SSE token delivery
  streamMessage: async ({ message, history = [], onToken, onComplete, onError, signal }) => {
    const url = `${API_BASE_URL}/chat/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Chat stream failed with HTTP status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') {
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                fullText += parsed.token;
                onToken?.(parsed.token, fullText);
              }
              if (parsed.done && parsed.fullText) {
                fullText = parsed.fullText;
              }
              if (parsed.error) {
                console.warn('[Stream Error Event]', parsed.error);
                onError?.(new Error(parsed.error));
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      onComplete?.(fullText);
      return fullText;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Chat stream aborted by user]');
        return;
      }
      console.error('[ChatAPI streamMessage error]', err);
      onError?.(err);
      throw err;
    }
  },
};
