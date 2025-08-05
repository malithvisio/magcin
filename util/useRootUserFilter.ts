import { useState, useEffect } from 'react';
import {
  getCurrentRootUserId,
  setCurrentRootUserId,
  getActiveRootUsers,
  getRootUserName,
  createRootUserQueryParam,
  type RootUserConfig,
} from './root-user-config';

interface UseRootUserFilterReturn {
  currentRootUserId: string;
  activeRootUsers: RootUserConfig[];
  currentRootUserName: string;
  setRootUserId: (rootUserId: string) => void;
  createQueryParam: (rootUserId?: string) => string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing root user filtering across components
 * Provides state management and utility functions for root user selection
 */
export function useRootUserFilter(): UseRootUserFilterReturn {
  const [currentRootUserId, setCurrentRootUserIdState] = useState<string>('');
  const [activeRootUsers, setActiveRootUsersState] = useState<RootUserConfig[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Initialize root user state
      const rootUserId = getCurrentRootUserId();
      setCurrentRootUserIdState(rootUserId);
      setActiveRootUsersState(getActiveRootUsers());
      setError(null);
    } catch (err) {
      setError('Failed to initialize root user filter');
      console.error('Root user filter initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setRootUserId = (rootUserId: string) => {
    try {
      setCurrentRootUserId(rootUserId);
      setCurrentRootUserIdState(rootUserId);
      setCurrentRootUserId(rootUserId); // Update localStorage
      setError(null);
    } catch (err) {
      setError('Failed to set root user ID');
      console.error('Set root user ID error:', err);
    }
  };

  const createQueryParam = (rootUserId?: string): string => {
    return createRootUserQueryParam(rootUserId || currentRootUserId);
  };

  const currentRootUserName = getRootUserName(currentRootUserId);

  return {
    currentRootUserId,
    activeRootUsers,
    currentRootUserName,
    setRootUserId,
    createQueryParam,
    isLoading,
    error,
  };
}

/**
 * Hook for fetching data with root user filtering
 * @param fetchFunction - Function that fetches data with root user query parameter
 * @param dependencies - Additional dependencies for the fetch effect
 */
export function useRootUserData<T>(
  fetchFunction: (queryParam: string) => Promise<T>,
  dependencies: any[] = []
) {
  const {
    currentRootUserId,
    createQueryParam,
    isLoading: filterLoading,
  } = useRootUserFilter();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (filterLoading) return;

      try {
        setIsLoading(true);
        setError(null);
        const queryParam = createQueryParam();
        const result = await fetchFunction(queryParam);
        setData(result);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentRootUserId, filterLoading, ...dependencies]);

  return {
    data,
    isLoading: filterLoading || isLoading,
    error,
    refetch: () => {
      const queryParam = createQueryParam();
      return fetchFunction(queryParam);
    },
  };
}

/**
 * Hook for creating API URLs with root user filtering
 */
export function useRootUserApi() {
  const { createQueryParam } = useRootUserFilter();

  const createApiUrl = (
    endpoint: string,
    additionalParams?: Record<string, string>
  ): string => {
    const rootUserParam = createQueryParam();
    const params = new URLSearchParams(rootUserParam);

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    return `${endpoint}?${params.toString()}`;
  };

  return {
    createApiUrl,
    createQueryParam,
  };
}
