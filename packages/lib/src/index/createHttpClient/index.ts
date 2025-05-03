import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { bookmarkMock } from "../bookmarkMock";
import { addInstance } from "./instances";
import { SchemaType } from "@omariosouto/common-schema";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type HttpClientBookmarks = {
  [key: string]: {
    url: string;
    methods: {
      [key in HttpMethod]?: {
        response: {
          [key: number]: SchemaType;
        }
      }
    }
  }
};

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

  axiosInstance.interceptors.response.use((config) => {
    (config as any).body = config.data;
    return config;
  });

  const httpClientInstance: HttpClientInstance = {
    setBookmarkProxy(intercepted: any) {
      bookmarkMock.set(intercepted);
    },
    async request(options: HttpRequestOptions) {
      let requestUrl;
      let bookmark;
      const {
        method,
        url,
        body,
        retry,
        bookmarks = {},
      } = options;
      const isURLBookmark = bookmarks[url] !== undefined;
      requestUrl = url;

      if (isURLBookmark) {
        bookmark = url;
        requestUrl = bookmarks[url]?.url ?? '';
        const bookmarkProxy = bookmarkMock.get();
        const bookmarkProxyKey = `${url}::${method}`.toLowerCase();
        const response = {
          data: bookmarkProxy[bookmarkProxyKey],
        };

        if (bookmarkProxy[bookmarkProxyKey]) return response;
      }

      return axiosInstance.request({
        method,
        url: requestUrl,
        retry,
        data: body,
        bookmark,
      } as any);
    },
    ...({
      _instance: axiosInstance,
    })
  } as unknown as HttpClientInternalInstance;
  return httpClientInstance;
};

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