import { useEffect } from 'react';

// Hook to automatically add token to all fetch requests
export const useAuthToken = () => {
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Override fetch to add authorization header
    window.fetch = function (...args) {
      let [resource, config] = args;

      // Ensure config exists
      if (!config) {
        config = {};
      }

      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {};
      }

      // Add authorization header
      const token = localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Call original fetch with modified arguments
      return originalFetch.apply(this, [resource, config]).then((response) => {
        // If 401, logout
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return response;
      });
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};
