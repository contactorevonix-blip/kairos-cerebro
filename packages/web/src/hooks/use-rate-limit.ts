import { useEffect, useState } from 'react';

interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetAt: number;
}

const STORAGE_KEY = 'kairos_rate_limit_status';

export function useRateLimit() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStatus(JSON.parse(stored));
      }
    } catch (e) {
      // Silently fail
    }
  }, []);

  // Listen for API responses to update rate limit info
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const resetAt = response.headers.get('X-RateLimit-Reset');

      if (remaining && limit && resetAt) {
        const newStatus = {
          remaining: parseInt(remaining, 10),
          limit: parseInt(limit, 10),
          resetAt: parseInt(resetAt, 10),
        };
        setStatus(newStatus);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatus));
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return status;
}
