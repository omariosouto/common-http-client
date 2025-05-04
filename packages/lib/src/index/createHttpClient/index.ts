import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { bookmarkMock } from "../bookmarkMock";
import { addInstance } from "./instances";
import { SchemaType, parseSchema } from "@omariosouto/common-schema";
import { deduplicateRequestsInterceptor } from "./deduplicateRequestsInterceptor";

export { httpClientClearCache } from "./deduplicateRequestsInterceptor";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type HttpClientBookmarks = {
  [key: string]: {
    url: string;
    methods: {
      [key in HttpMethod]?: {
        response: {
          [key: number]: SchemaType;
        }
        request?: SchemaType;
      }
    }
  }
};

export type HttpRequestOptions = {
  /** This value defines the request URL or Bookmark */
  url: string;
  /** This value defines the request method */
  method: HttpMethod;
  /** This value defines the request query string */
  queryParams?: Record<string, string>;
  /** This value defines the request URL parameters */
  params?: Record<string, string>;
  /** This value defines the request headers */
  headers?: Record<string, string>;
  /** This value defines the request body */
  body?: any;
  /** This value defines how many times the request will be retried in case of failure before throwing an error */
  retry?: number;
  /** This value defines for how long the cache for a GET request to an external endpoint will remain */
  staleTime?: number;
  /** This value defines the request bookmarks */
  bookmarks?: HttpClientBookmarks;
}

export type HttpClientHeaders = AxiosHeaders;

export type HttpClientResponse = {
  status: number;
  headers: HttpClientHeaders;
  body: any;
}

export type HttpClientInstance = {
  request: (options: HttpRequestOptions) => Promise<HttpClientResponse>;
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
        staleTime,
        queryParams,
        params,
        headers,
        bookmarks = {},
      } = options;
      const isURLBookmark = bookmarks[url] !== undefined;
      requestUrl = url;

      if (isURLBookmark) {
        bookmark = url;
        requestUrl = bookmarks[url]?.url ?? '';
        const bookmarkProxy = bookmarkMock.get();
        const bookmarkProxyKey = `${url}::${method}`.toLowerCase();
        const requestSchema = bookmarks[url]?.methods?.[method]?.request;
        if (requestSchema && body) parseSchema(requestSchema, body);

        if (bookmarkProxy[bookmarkProxyKey]) {
          const bookmarkProxyResponse: HttpClientResponse = {
            status: bookmarkProxy[bookmarkProxyKey].status,
            headers: {} as HttpClientHeaders,
            body: bookmarkProxy[bookmarkProxyKey].body,
          };

          return bookmarkProxyResponse;
        };
      }

      if(params) {
        const urlParams = Object.keys(params).reduce((acc, key) => {
          const value = params[key];
          if (value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);

        requestUrl = Object.keys(urlParams).reduce((url, key) => {
          return url.replace(`:${key}`, urlParams[key] || '');
        }, requestUrl);
      }

      return axiosInstance.request({
        method,
        urlParams: params,
        url: requestUrl,
        retry,
        data: body,
        staleTime,
        headers,
        queryParams,
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