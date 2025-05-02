import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { bookmarkMock } from "../bookmarkMock";
import { addInstance } from "./instances";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type HttpClientBookmarks = any;

export type HttpRequestOptions = {
  method: HttpMethod;
  url: string;
  body?: any;
  // TODO: Bookmark
  bookmarks?: HttpClientBookmarks;
  // TODO: Circuit Breaker
  retry?: number;
  // retryDelay?: number;
  // TODO: Memory Cache
  // ???
}

export type HttpClientHeaders = AxiosHeaders;

export type HttpClientInstance = {
  request: (options: HttpRequestOptions) => Promise<any>;
  setBookmarkProxy: (intercepted: any) => void;
}

export type HttpClientInternalInstance = HttpClientInstance & {
  _instance: AxiosInstance;
}

export function createHttpClient(): HttpClientInstance {
  const axiosInstance = axios.create();
  addInstance(axiosInstance);

  deduplicateRequestsInterceptor(axiosInstance);
  circuitBreakerInterceptor(axiosInstance);

  const httpClientInstance: HttpClientInstance = {
    setBookmarkProxy(intercepted: any) {
      bookmarkMock.set(intercepted);
    },
    async request(options: HttpRequestOptions) {
      let requestUrl;
      const {
        method,
        url,
        body,
        retry,
        bookmarks = {},
      } = options;
      requestUrl = url;

      if(bookmarks[url]) {
        requestUrl = bookmarks[url].url;
        const bookmarkProxy = bookmarkMock.get();
        const bookmarkProxyKey = `${url}::${method}`.toLowerCase();
        const response = {
          data: bookmarkProxy[bookmarkProxyKey],
        };

        if(bookmarkProxy[bookmarkProxyKey]) return response;
      }

      return axiosInstance.request({
        method,
        url: requestUrl,
        retry,
        data: body,
      } as any);
    },
    ...({
      _instance: axiosInstance,
    })
  } as unknown as HttpClientInternalInstance;
  return httpClientInstance;
};

/*
## It's mandatory to have support for circuit-breaker and cache
- If two components are doing a request for the same place, we should not do the request twice considering a stale time

- https://github.com/barnendu/axios-breaker
- https://www.npmjs.com/package/axios-cache-adapter


HttpClient.request({
  method: "GET", ✅
  url: "https://api.github.com/users/omariosouto", // bookmarks[method]["https://api.github.com/users/:username"] ✅
  headers: {
    "Content-Type": "application/json",
  },
  // Cache Config -> https://tanstack.com/query/v4/docs/framework/react/guides/important-defaults
  staleTime: "5m", // avoid deduplicated requests
  // Circuit Breaker Config -> https://github.com/barnendu/axios-breaker
  retry: 3 // by default 3 with exponential backoff of 100ms for first, 200ms for second and 400ms for third
  // -> statusCodesToRetry: [[100, 199], [429, 429], [500, 599]],
  // options: { //customizaable optionsfor circuit breaker
  //   failureThreshold: 3, // maximum no of failed before circuit break,
  //   successThreshold: 2, // maximum success call to close the circuit
  //   timeout: 5000, // reset timeout for next call while in open state
  //   fallbackPolicy: callback // fallbackpolicy if any while circuit is open. For example you want to  divert the api call to different endpoint.
  // }
})

// TODO: Add to common-core
import ms from 'ms';

*/

function circuitBreakerInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.response.use(undefined, async (error) => {
    const config = error.config;

    // Verifica se há configuração e se o retry está definido
    if (!config || typeof config.retry !== 'number') {
      return Promise.reject(error);
    }


    // Inicializa contador de tentativas se ainda não estiver presente
    config.__retryCount = config.__retryCount || 0;

    // Se já atingiu o limite de tentativas, rejeita
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Implementa o exponential backoff
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const backoff = Math.pow(2, config.__retryCount) * 500; // base 2^n * 500ms
    await delay(backoff);

    // Tenta novamente a requisição
    return axiosInstance(config);
  });
}

function deduplicateRequestsInterceptor(_axiosInstance: AxiosInstance) {
  // Before the request goes out, check if there is a request with the same URL and method
  // If the cache is not expired, return the cached response
  // If the cache is expired, remove the request from the cache and make a new request
  // Só pode cachear requests GET
  // staleTime: 2000 * 60 * 5, // 5 minutes
}