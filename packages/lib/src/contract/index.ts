import { AxiosHeaders, AxiosInstance } from "axios";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type HttpRequestOptions = {
  method: HttpMethod;
  url: string;
  body?: any;
}

export type HttpClientHeaders = AxiosHeaders;

export type HttpClientInstance = {
  request: (options: HttpRequestOptions) => Promise<any>;
}

export type HttpClientInternalInstance = HttpClientInstance & {
  _instance: AxiosInstance;
}