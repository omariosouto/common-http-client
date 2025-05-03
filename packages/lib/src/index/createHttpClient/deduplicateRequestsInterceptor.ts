import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type CacheKey = string;
type CachedResponse = {
  timestamp: number;
  data: AxiosResponse;
};

const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes in milliseconds
const cache = new Map<CacheKey, CachedResponse>();

declare module 'axios' {
  export interface AxiosRequestConfig {
    staleTime?: number;
  }
}

export function deduplicateRequestsInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use((config) => {
    const isGET = config.method?.toUpperCase() === 'GET';
    const staleTime = config.staleTime ?? DEFAULT_STALE_TIME;

    if (!isGET || staleTime === 0) return config;

    const key = getCacheKey(config);

    const cached = cache.get(key);
    if (cached) {
      const isStale = Date.now() - cached.timestamp > staleTime;

      if (!isStale) {
        config.adapter = async () => cached.data;
      } else {
        cache.delete(key);
      }
    }

    return config;
  });

  axiosInstance.interceptors.response.use((response) => {
    const config = response.config;
    const isGET = config.method?.toUpperCase() === 'GET';
    const staleTime = config.staleTime ?? DEFAULT_STALE_TIME;

    if (isGET && staleTime > 0) {
      const key = getCacheKey(config);
      cache.set(key, {
        timestamp: Date.now(),
        data: response,
      });
    }

    return response;
  });
}

function getCacheKey(config: AxiosRequestConfig): string {
  const url = config.url ?? '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${config.method?.toUpperCase()}:${url}?${params}`;
}

export function httpClientClearCache() {
  cache.clear();
}