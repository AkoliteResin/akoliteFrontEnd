// Utility function to make authenticated API calls with JWT token
export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Convenient methods for common HTTP verbs
export const apiGet = (url) => apiCall(url, { method: 'GET' });

export const apiPost = (url, data) =>
  apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiPut = (url, data) =>
  apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiDelete = (url) =>
  apiCall(url, {
    method: 'DELETE',
  });
