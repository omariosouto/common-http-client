import axios from 'axios';
import { HttpClientInstance, HttpClientInternalInstance, HttpRequestOptions } from "src/contract";

export function createHttpClient() {
  const axiosInstance = axios.create();
  const httpClientInstance: HttpClientInstance = {
    async request(options: HttpRequestOptions) {
      const {
        method,
        url,
      } = options;

      return axiosInstance.request({
        method,
        url,
      });
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