import { httpClientMockReset } from "./test";
import { httpClientClearCache } from "./index/createHttpClient/deduplicateRequestsInterceptor";

export function resetHttpClient() {
  httpClientMockReset();
  httpClientClearCache();
};