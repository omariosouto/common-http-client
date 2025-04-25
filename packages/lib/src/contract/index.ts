import { AxiosHeaders, AxiosInstance } from "axios";

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