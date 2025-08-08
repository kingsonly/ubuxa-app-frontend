import { useMemo } from 'react';

export const useQueryString = (params: Record<string, any> | null) => {
  return useMemo(() => {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return queryString ? `&${queryString}` : '';
  }, [params]);
};

// Helper function for use in non-React contexts (like API utilities)
export const buildQueryString = (params?: Record<string, any> | null): string => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return queryString ? `&${queryString}` : '';
};